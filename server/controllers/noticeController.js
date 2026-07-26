const Notice = require("../models/Notice");

// @desc Get all notices, optional category filter
// @route GET /api/notices?category=
const getNotices = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== "All Notice Categories") filter.category = category;

    const notices = await Notice.find(filter)
      .populate("publishedBy", "name role")
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Post a new announcement
// @route POST /api/notices
const createNotice = async (req, res) => {
  try {
    const { title, content, category, audience } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    const notice = await Notice.create({
      title,
      content,
      category,
      audience,
      publishedBy: req.user._id,
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a notice
// @route DELETE /api/notices/:id
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ message: "Notice removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };
