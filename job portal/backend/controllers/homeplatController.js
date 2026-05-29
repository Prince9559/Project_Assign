// controllers/homePlatformController.js

const { HomePlatform } = require("../models");

// Create HomePlatform data
const createHomePlatform = async (req, res) => {
  try {
    const data = await HomePlatform.create(req.body);
    return res.status(201).json({ message: "Created successfully", data });
  } catch (error) {
    console.error("Error creating HomePlatform:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all HomePlatform records
const getAllHomePlatforms = async (req, res) => {
  try {
    const data = await HomePlatform.findAll();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching HomePlatform:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single HomePlatform by ID
const getHomePlatformById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await HomePlatform.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching HomePlatform:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update HomePlatform record
const updateHomePlatform = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await HomePlatform.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    await data.update(req.body);
    return res.status(200).json({ message: "Updated successfully", data });
  } catch (error) {
    console.error("Error updating HomePlatform:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete HomePlatform record
const deleteHomePlatform = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await HomePlatform.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    await data.destroy();
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting HomePlatform:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createHomePlatform,
  getAllHomePlatforms,
  getHomePlatformById,
  updateHomePlatform,
  deleteHomePlatform,
};
