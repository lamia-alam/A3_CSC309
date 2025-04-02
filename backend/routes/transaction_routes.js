const express = require("express");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const { TransactionType } = require("@prisma/client");

const prisma = require("../prisma/prisma_client");
const { hashedPassword, comparePassword, SECRET_KEY } = require("../utils/jwt");
const clearance = require("../middleware/clearance");
const authentication = require("../middleware/auth");
const {
  createTransaction,
  adjustTransaction,
  getTransactions,
  getTransactionById,
  setTransactionSuspicious,
  processTransaction
} = require("../controllers/transactions");

const router = express.Router();
router.post(
  "/",
  authentication,
  clearance(["cashier", "manager", "superuser"]),
  async (req, res) => {
    const { type } = req.body;
    if (type === TransactionType.purchase) {
      return createTransaction(req, res);
    }
    if (
      type === TransactionType.adjustment &&
      ["manager", "superuser"].includes(req.user.role)
    ) {
      return adjustTransaction(req, res);
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
  }
);

router.get(
  "/",
  authentication,
  clearance(["manager", "superuser"]),
  getTransactions
);

router.get(
  "/:transactionId",
  authentication,
  clearance(["manager", "superuser"]),
  getTransactionById
);

router.patch(
  "/:transactionId/suspicious",
  authentication,
  clearance(["manager", "superuser"]),
  setTransactionSuspicious
);

router.patch(
  "/:transactionId/processed",
  authentication,
  clearance(["cashier", "manager", "superuser"]),
  processTransaction
)

module.exports = router;
