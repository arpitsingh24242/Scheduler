const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();
const JWT_SECRET = "your_jwt_secret"; 

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

module.exports = router;
