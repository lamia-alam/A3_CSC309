const express = require("express");
const path = require("path");
const uuid = require("uuid");
const prisma = require("../prisma/prisma_client");
const authentication = require("../middleware/auth");
const verifiedUser = require("../middleware/verifiedUser")
const clearance = require("../middleware/clearance");
const { hashedPassword, comparePassword } = require("../utils/jwt");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  getCurrentUser,
  updateCurrentUser,
  updateUserById,
  updateMyPassword,
  createTransfer,
  createRedemption,
  getTransactions,
} = require("../controllers/users");

const multer = require("multer");

const upload = multer({
  dest: "uploads/",

  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
  filename:(req,file,cb)=>{
    let ext = path.extname(file.originalname);
    cb(null,file.originalname);
  }
});

// Serve uploaded images
router.use("/uploads", express.static("uploads"));

// POST /users
router.post("/", authentication, clearance(["cashier", "manager", "superuser"]), createUser);

// GET /users
router.get("/", authentication, clearance(["manager", 'superuser']), getUsers);

// GET /users/me
router.get("/me", authentication, getCurrentUser);

// PATCH /users/me
router.patch("/me", authentication, upload.single("avatar"), updateCurrentUser);

// PATCH /users/me/password
router.patch("/me/password", authentication, updateMyPassword);

// GET /users/me/transactions
router.get("/me/transactions", authentication, getTransactions);

// POST /users/me/transactions
router.post("/me/transactions", authentication, verifiedUser, createRedemption);

// GET /users/:userId
router.get("/:userId", authentication, clearance(["cashier", "manager", "superuser"]), getUserById);

// PATCH /users/:userId
router.patch("/:userId", authentication, clearance(["manager", "superuser"]), updateUserById);

// POST /users/:userId/transactions
router.post("/:userId/transactions", authentication, createTransfer);

module.exports = router;
