const express = require("express");
const clearance = require("../middleware/clearance");
const authentication = require("../middleware/auth");
const {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotions");

const router = express.Router();

router.post(
  "/",
  authentication,
  clearance(["manager", "superuser"]),
  createPromotion
);

router.get("/", authentication, getPromotions);

router.get("/:promotionId", authentication, getPromotionById);

router.patch(
  "/:promotionId",
  authentication,
  clearance(["manager", "superuser"]),
  updatePromotion
);

router.delete(
  "/:promotionId",
  authentication,
  clearance(["manager", "superuser"]),
  deletePromotion
);

module.exports = router;
