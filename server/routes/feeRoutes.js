const express = require("express");
const router = express.Router();
const {
  getFeeLedger,
  updateFeeRecord,
  getStudentFeeHistory,
} = require("../controllers/feeController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/student/:id", getStudentFeeHistory);
router.get("/", authorize("admin", "teacher"), getFeeLedger);
router.put("/:id", authorize("admin"), updateFeeRecord);

module.exports = router;
