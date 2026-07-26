const Event = require("../models/Event");

// @desc Get events, optionally filtered by type, sorted by date ascending
// @route GET /api/events?type=holiday|event
const getEvents = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new event/holiday entry (Admin only)
// @route POST /api/events
const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an event/holiday entry (Admin only)
// @route DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, createEvent, deleteEvent };
