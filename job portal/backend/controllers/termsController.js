const { Terms } = require("../models");

// Create Terms Entry
const createTerms = async (req, res) => {
  try {
    const data = await Terms.create(req.body);

    return res.status(201).json({
      message: "Terms entry created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating terms data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Terms
const getTerms = async (req, res) => {
  try {
    const data = await Terms.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching terms data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update Terms by ID
const updateTerms = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await Terms.findByPk(id);
    if (!terms) {
      return res.status(404).json({ error: "Terms entry not found" });
    }

    await terms.update(req.body);

    return res.status(200).json({
      message: "Terms updated successfully",
      data: terms,
    });
  } catch (error) {
    console.error("Error updating terms data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Terms by ID
const deleteTerms = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await Terms.findByPk(id);
    if (!terms) {
      return res.status(404).json({ error: "Terms entry not found" });
    }

    await terms.destroy();

    return res.status(200).json({ message: "Terms entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting terms data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTerms,
  getTerms,
  updateTerms,
  deleteTerms,
};
