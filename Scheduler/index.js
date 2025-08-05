const express = require("express");
const bodyParser = require("body-parser");
const Queue = require("bull");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = "your_jwt_secret";

app.use(cors());
app.use(bodyParser.json());

// Redis connection
const messageQueue = new Queue("messageQueue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

// JWT Middleware (kept in case you want auth for login-related routes)
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

// Create Event (with manually entered email)
app.post("/events", async (req, res) => {
  const { message, send_at, email } = req.body;
  if (!message || !send_at || !email) {
    return res.status(400).json({ error: "Missing message, send_at, or email" });
  }

  try {
    const event = await prisma.event.create({
      data: {
        message,
        send_at: new Date(send_at),
        status: "Scheduled",
        retries: 0,
        email, // ✅ Use provided email instead of user.email from token
      },
    });

    const delay = moment(send_at).diff(moment());
    await messageQueue.add(
      { eventId: event.id },
      { delay, attempts: 3, backoff: 5000 }
    );

    res.status(201).json(event);
  } catch (error) {
    console.error("Error scheduling event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Events (optional: remove `authenticate` if no login is needed)
app.get("/events", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { send_at: "desc" },
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Process jobs
messageQueue.process(async (job, done) => {
  const { eventId } = job.data;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return done(new Error("Event not found"));

  const failed = Math.random() < 0.1;
  if (failed) {
    const retries = event.retries + 1;
    const status = retries >= 3 ? "Failed" : "Retried";
    await prisma.event.update({
      where: { id: eventId },
      data: { status, retries },
    });
    return done(new Error("Simulated failure"));
  }

  console.log(`📩 Sent message: ${event.message} (To: ${event.email})`);
  await prisma.event.update({
    where: { id: eventId },
    data: { status: "Sent" },
  });

  done();
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
});
