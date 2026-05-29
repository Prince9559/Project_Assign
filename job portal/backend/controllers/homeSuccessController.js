// controllers/homeSuccessController.js

const { HomeSuccess } = require("../models");

// Create
const createHomeSuccess = async (req, res) => {
  try {
    const data = await HomeSuccess.create(req.body);
    return res.status(201).json({ message: "Created successfully", data });
  } catch (error) {
    console.error("Error creating home success:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all
const getAllHomeSuccess = async (req, res) => {
  try {
    const data = await HomeSuccess.findAll();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching home success:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get by ID
const getHomeSuccessById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HomeSuccess.findByPk(id);

    if (!data) return res.status(404).json({ error: "Record not found" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching home success:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update
const updateHomeSuccess = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HomeSuccess.findByPk(id);

    if (!data) return res.status(404).json({ error: "Record not found" });

    await data.update(req.body);
    return res.status(200).json({ message: "Updated successfully", data });
  } catch (error) {
    console.error("Error updating home success:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete
const deleteHomeSuccess = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HomeSuccess.findByPk(id);

    if (!data) return res.status(404).json({ error: "Record not found" });

    await data.destroy();
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting home success:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createHomeSuccess,
  getAllHomeSuccess,
  getHomeSuccessById,
  updateHomeSuccess,
  deleteHomeSuccess,
};
