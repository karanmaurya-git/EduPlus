const express = require("express");
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getEvents);
router.post("/", authorize("admin"), createEvent);
router.delete("/:id", authorize("admin"), deleteEvent);

module.exports = router;
