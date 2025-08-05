const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authenticate = require("../middleware/auth");
const router = express.Router();

const prisma = new PrismaClient();


router.post("/events", authenticate, async (req, res) => {
  const { message, send_at } = req.body;

  const event = await prisma.event.create({
    data: {
      message,
      send_at: new Date(send_at),
      userId: req.userId,
    },
  });

  res.json(event);
});


router.get("/events", authenticate, async (req, res) => {
  const events = await prisma.event.findMany({
    where: { userId: req.userId },
    orderBy: { send_at: "desc" },
  });

  res.json(events);
});

module.exports = router;
