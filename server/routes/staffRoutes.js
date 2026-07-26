const express = require("express");
const router = express.Router();
const { getStaff, addStaff, updateStaff, deleteStaff } = require("../controllers/staffController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", authorize("admin"), getStaff);
router.post("/", authorize("admin"), addStaff);
router.put("/:id", authorize("admin"), updateStaff);
router.delete("/:id", authorize("admin"), deleteStaff);

module.exports = router;
