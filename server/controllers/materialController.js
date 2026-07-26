const Material = require("../models/Material");

// @desc Get academic materials, filterable
// @route GET /api/materials?class=&section=&category=&subject=
const getMaterials = async (req, res) => {
  try {
    const { class: cls, section, category, subject } = req.query;
    const filter = {};
    if (cls) filter.targetClass = cls;
    if (section && section !== "All Sections") filter.section = section;
    if (category && category !== "Choose Category...") filter.category = category;
    if (subject) filter.subject = new RegExp(subject, "i");

    const materials = await Material.find(filter).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Upload/create a new academic material entry
// @route POST /api/materials
const createMaterial = async (req, res) => {
  try {
    const material = await Material.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a material
// @route DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json({ message: "Material removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMaterials, createMaterial, deleteMaterial };
