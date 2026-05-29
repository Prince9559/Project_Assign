const { Students } = require("../models");

// Create Students Data
const createStudents = async (req, res) => {
  try {
    const data = await Students.create(req.body);
    return res.status(201).json({
      message: "Students data created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating students data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Students Data
const getStudents = async (req, res) => {
  try {
    const data = await Students.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching students data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update Students by ID
const updateStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Students.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }

    await student.update(req.body);

    return res.status(200).json({
      message: "Students data updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating students data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Students by ID
const deleteStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Students.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: "Student record not found" });
    }

    await student.destroy();

    return res.status(200).json({ message: "Students data deleted successfully" });
  } catch (error) {
    console.error("Error deleting students data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createStudents,
  getStudents,
  updateStudents,
  deleteStudents,
};
