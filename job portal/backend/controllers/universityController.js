// controllers/universityController.js
const { University } = require("../models");

// Create University
const createUniversity = async (req, res) => {
  try {
    const { heading, sub_heading, card_haeding, card_content, pro_plan } = req.body;

    const entry = await University.create({
      heading,
      sub_heading,
      card_haeding,
      card_content,
      pro_plan
    });

    return res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating university:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All University Records
const getUniversity = async (req, res) => {
  try {
    const data = await University.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching university:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get Single by ID
const getUniversityById = async (req, res) => {
  try {
    const data = await University.findOne({
      where: { id: req.params.id },
    });

    if (!data) {
      return res.status(404).json({ error: "University record not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching university by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update University
const updateUniversity = async (req, res) => {
  try {
    const data = await University.findOne({ where: { id: req.params.id } });

    if (!data) {
      return res.status(404).json({ error: "University record not found" });
    }

    await data.update(req.body);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error updating university:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete University
const deleteUniversity = async (req, res) => {
  try {
    const data = await University.findOne({ where: { id: req.params.id } });

    if (!data) {
      return res.status(404).json({ error: "University record not found" });
    }

    await data.destroy();
    return res.status(200).json({ message: "University deleted successfully" });
  } catch (error) {
    console.error("Error deleting university:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUniversity,
  getUniversity,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};
