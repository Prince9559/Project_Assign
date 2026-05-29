const { SchoolCollege, sequelize } = require("../models");
const { Op, fn, col } = require("sequelize");

function formatCollege(row) {
  return {
    id: row.id,
    name: row.name,
    college_name: row.name,
    status: row.status,
  };
}

/**
 * GET /api/colleges/search?query=
 * Approved colleges only (status = 1).
 */
async function searchApprovedColleges(req, res) {
  try {
    const raw = req.query.query;
    const q = typeof raw === "string" ? raw.trim() : "";
    if (!q) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Enter text to search colleges",
      });
    }

    const colleges = await SchoolCollege.findAll({
      where: {
        status: 1,
        name: { [Op.like]: `%${q}%` },
      },
      attributes: ["id", "name", "status"],
      order: [["name", "ASC"]],
      limit: 30,
    });

    return res.status(200).json({
      success: true,
      data: colleges.map((c) => formatCollege(c)),
      message: "Colleges fetched successfully",
    });
  } catch (error) {
    console.error("searchApprovedColleges:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching colleges",
      error: error.message,
    });
  }
}

/**
 * POST /api/colleges
 * Body: { college_name }
 * New rows default to status = 0 (pending).
 * Duplicate names are blocked case-insensitively; returns existing row.
 */
async function createCollegeRequest(req, res) {
  try {
    const raw = req.body?.college_name;
    const normalized =
      typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";

    if (!normalized) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    const existing = await SchoolCollege.findOne({
      where: sequelize.where(
        fn("LOWER", col("name")),
        normalized.toLowerCase()
      ),
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        created: false,
        duplicate: true,
        data: formatCollege(existing),
        message: "College already exists",
      });
    }

    const created = await SchoolCollege.create({
      name: normalized,
      status: 0,
    });

    return res.status(201).json({
      success: true,
      created: true,
      data: formatCollege(created),
      message: "College created successfully",
    });
  } catch (error) {
    console.error("createCollegeRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating college",
      error: error.message,
    });
  }
}

module.exports = {
  searchApprovedColleges,
  createCollegeRequest,
};
