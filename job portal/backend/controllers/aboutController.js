const { About } = require("../models");

// Create About record
const createAbout = async (req, res) => {
  try {
    const { heading, sub_heading, content, card_heading, card_content } = req.body;

    if (!heading || !content) {
      return res.status(400).json({ error: "Heading and content are required" });
    }

    const about = await About.create({
      heading,
      sub_heading,
      content,
      card_heading,
      card_content,
    });

    return res.status(201).json({
      message: "About section created successfully",
      data: about,
    });

  } catch (error) {
    console.error("Error creating about:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all About records
const getAbout = async (req, res) => {
  try {
    const aboutData = await About.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(aboutData);

  } catch (error) {
    console.error("Error fetching about:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update About record by ID
const updateAbout = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const about = await About.findByPk(id);
    if (!about) {
      return res.status(404).json({ error: "About record not found" });
    }

    await about.update(updates);

    return res.status(200).json({
      message: "About updated successfully",
      data: about,
    });

  } catch (error) {
    console.error("Error updating about:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete About record
const deleteAbout = async (req, res) => {
  try {
    const { id } = req.params;

    const about = await About.findByPk(id);
    if (!about) {
      return res.status(404).json({ error: "About record not found" });
    }

    await about.destroy();

    return res.status(200).json({ message: "About deleted successfully" });

  } catch (error) {
    console.error("Error deleting about:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAbout,
  getAbout,
  updateAbout,
  deleteAbout,
};
