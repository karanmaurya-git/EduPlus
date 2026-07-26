const express = require("express");
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getMaterials);
router.post("/", authorize("admin", "teacher"), createMaterial);
router.delete("/:id", authorize("admin", "teacher"), deleteMaterial);

module.exports = router;
