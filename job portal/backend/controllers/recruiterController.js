// controllers/recruiterController.js

const { Recruiter } = require("../models");

// Create Recruiter data
const createRecruiter = async (req, res) => {
  try {
    const data = await Recruiter.create(req.body);
    return res.status(201).json({ message: "Created successfully", data });
  } catch (error) {
    console.error("Error creating recruiter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all Recruiter records
const getAllRecruiters = async (req, res) => {
  try {
    const data = await Recruiter.findAll();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching recruiter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single Recruiter by ID
const getRecruiterById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Recruiter.findByPk(id);

    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching recruiter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update Recruiter record
const updateRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Recruiter.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    await data.update(req.body);
    return res.status(200).json({ message: "Updated successfully", data });
  } catch (error) {
    console.error("Error updating recruiter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Recruiter record
const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Recruiter.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    await data.destroy();
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting recruiter:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createRecruiter,
  getAllRecruiters,
  getRecruiterById,
  updateRecruiter,
  deleteRecruiter,
};
