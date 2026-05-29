const { Support } = require('../models');

// Create Support
const createSupport = async (req, res) => {
  try {
    const { heading, contact_us, help_center, policies } = req.body;

    const support = await Support.create({
      heading,
      contact_us,
      help_center,
      policies,
    });

    return res.status(201).json({
      message: "Support section created successfully",
      data: support,
    });
  } catch (error) {
    console.error("Error creating support:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Support Data
const getSupport = async (req, res) => {
  try {
    const support = await Support.findAll();

    return res.status(200).json({
      message: "Support data fetched successfully",
      data: support,
    });
  } catch (error) {
    console.error("Error fetching support:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update Support
const updateSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, contact_us, help_center, policies } = req.body;

    const support = await Support.findOne({ where: { id } });

    if (!support) {
      return res.status(404).json({ error: "Support record not found" });
    }

    await support.update({
      heading,
      contact_us,
      help_center,
      policies,
    });

    return res.status(200).json({
      message: "Support updated successfully",
      data: support,
    });
  } catch (error) {
    console.error("Error updating support:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Support
const deleteSupport = async (req, res) => {
  try {
    const { id } = req.params;

    const support = await Support.findOne({ where: { id } });
    if (!support) {
      return res.status(404).json({ error: "Support not found" });
    }

    await support.destroy();

    return res.status(200).json({ message: "Support deleted successfully" });
  } catch (error) {
    console.error("Error deleting support:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createSupport,
  getSupport,
  updateSupport,
  deleteSupport,
};
