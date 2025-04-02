const express = require("express");
const clearance = require("../middleware/clearance");
const authentication = require("../middleware/auth");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addEventOrganizer,
  removeEventOrganizer,
  addEventGuest,
  removeEventGuest,
  addMeToEventGuest,
  removeMeFromEventGuest,
  createEventTransaction,
} = require("../controllers/events");

const router = express.Router();


router.post(
  "/",
  authentication,
  clearance(["manager", "superuser"]),
  createEvent
);

router.get("/", authentication, getEvents);

router.get(
  "/:eventId",
  authentication,
  getEventById
);

router.patch(
  "/:eventId",
  authentication,
  clearance(["manager", "superuser", "EventOrganizer"]),
  updateEvent
);

router.delete("/:eventId", authentication, clearance(["manager", "superuser"]), deleteEvent);

router.post(
  "/:eventId/organizers",
  authentication,
  clearance(["manager", "superuser"]),
  addEventOrganizer
);

router.delete(
  "/:eventId/organizers/:userId",
  authentication,
  clearance(["manager", "superuser"]),
  removeEventOrganizer
);

router.post(
  "/:eventId/guests",
  authentication,
  clearance(["manager", "superuser", "EventOrganizer"]),
  addEventGuest
);

router.post("/:eventId/guests/me", authentication, addMeToEventGuest);

router.delete("/:eventId/guests/me", authentication, removeMeFromEventGuest);

router.delete(
  "/:eventId/guests/:userId",
  authentication,
  clearance(["manager", "superuser"]),
  removeEventGuest
);

router.post(
  "/:eventId/transactions",
  authentication,
  clearance(["manager", "superuser", "EventOrganizer"]),
  createEventTransaction
);

module.exports = router;
