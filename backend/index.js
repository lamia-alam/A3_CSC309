#!/usr/bin/env node
"use strict";

const port = (() => {
  const args = process.argv;

  if (args.length !== 3) {
    console.error("usage: node index.js port");
    process.exit(1);
  }

  const num = parseInt(args[2], 10);
  if (isNaN(num)) {
    console.error("error: argument must be an integer.");
    process.exit(1);
  }

  return num;
})();

const express = require("express");
const app = express();
const userRouter = require("./routes/user_routes");
const authRouter = require("./routes/auth_routes");
const transactionRouter = require("./routes/transaction_routes");
const eventRouter = require("./routes/event_routes");
const promotionRouter = require("./routes/promotion_routes");

const prisma = require("./prisma/prisma_client");
const {PromotionType}  = require("@prisma/client");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

// ADD YOUR WORK HERE

app.use("/users", userRouter);

app.use("/auth", authRouter);

app.use("/transactions", transactionRouter);

app.use("/events", eventRouter);

app.use("/promotions", promotionRouter);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

server.on("error", (err) => {
  console.error(`cannot start server: ${err.message}`);
  process.exit(1);
});
