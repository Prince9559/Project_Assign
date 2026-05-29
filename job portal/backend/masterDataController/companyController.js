const { CompanyRecruiterProfile, Specialization } = require("../models");
const { Op, literal } = require("sequelize");

/**
 * GET ALL COMPANIES
 */
async function getAllcompanies(req, res) {
  try {
    const companies = await CompanyRecruiterProfile.findAll({
      attributes: ["id", "company_name"],
      order: [["company_name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: companies,
      message: "Companies fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching companies",
      error: error.message,
    });
  }
}

async function searchcompanies(req, res) {
  try {
    const { search } = req.query;

    // 1. Basic Length Validation
    // if (!search || search.trim().length < 3) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please enter at least 3 characters to search"
    //   });
    // }

    // 2. Sanitization: Allow only letters, numbers, spaces, hyphens, underscores
    // const searchTerm = search.trim();
    const searchTerm = (search || "").trim();
    const safePattern = /^[a-zA-Z0-9\s\-_]+$/;

    // if (!safePattern.test(searchTerm)) {
    if (searchTerm && !safePattern.test(searchTerm)) {
      return res.status(400).json({
        success: false,
        message: "Search input contains invalid characters."
      });
    }

    // 3. Query with Custom Sorting Priority
    const companies = await CompanyRecruiterProfile.findAll({
      where: {
        company_name: {
          [Op.like]: `%${searchTerm}%`
        }
      },
      attributes: ["id", "company_name"],
      order: [
        [
          literal(`CASE 
                        WHEN company_name = '${searchTerm}' THEN 1 
                        WHEN company_name LIKE '${searchTerm}%' THEN 2 
                        ELSE 3 
                    END`),
          'ASC'
        ],
        ['company_name', 'ASC'] // Secondary alphabetical sort
      ],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: companies,
      message: "Companies fetched successfully"
    });

  } catch (error) {
    console.error("Error searching companies:", error);
    res.status(500).json({
      success: false,
      message: "Error searching companies",
      error: error.message
    });
  }
}

/**
 * GET COMPANY BY ID
 */
async function getCompanyById(req, res) {
  try {
    const { id } = req.params;

    const company = await CompanyRecruiterProfile.findByPk(id, {
      attributes: ["id", "company_name"],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      data: company,
      message: "Company fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
}

/**
 * CREATE COMPANY
 */
async function createCompany(req, res) {
  try {
    const { company_name } = req.body;

    if (!company_name) {
      return res.status(400).json({
        success: false,
        message: "Company company_name is required",
      });
    }

    const existingCompany = await CompanyRecruiterProfile.findOne({
      where: { company_name },
    });

    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Company with this company_name already exists",
      });
    }

    const company = await CompanyRecruiterProfile.create({ company_name });

    res.status(201).json({
      success: true,
      data: company,
      message: "Company created successfully",
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({
      success: false,
      message: "Error creating company",
      error: error.message,
    });
  }
}

/**
 * BULK CREATE COMPANIES
 */
async function createBulkcompanies(req, res) {
  try {
    const { companies } = req.body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "companies array is required and must not be empty",
      });
    }

    // Validate each company object
    for (const c of companies) {
      if (!c.company_name) {
        return res.status(400).json({
          success: false,
          message: "Each company must have a company_name",
        });
      }
    }

    const createdCompanies = await CompanyRecruiterProfile.bulkCreate(companies);

    res.status(201).json({
      success: true,
      data: createdCompanies,
      message: `${createdCompanies.length} companies created successfully`,
    });
  } catch (error) {
    console.error("Error creating bulk companies:", error);
    res.status(500).json({
      success: false,
      message: "Error creating bulk companies",
      error: error.message,
    });
  }
}

/**
 * UPDATE COMPANY
 */
async function updateCompany(req, res) {
  try {
    const { id } = req.params;
    const { company_name } = req.body;

    const company = await CompanyRecruiterProfile.findByPk(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.update({ company_name });

    res.status(200).json({
      success: true,
      data: company,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
}

/**
 * DELETE COMPANY
 */
async function deleteCompany(req, res) {
  try {
    const { id } = req.params;

    const company = await CompanyRecruiterProfile.findByPk(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const count = await Specialization.count({
      where: { company_id: id },
    });

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: "Company is being used in specializations",
      });
    }

    await company.destroy();

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting company",
      error: error.message,
    });
  }
}

module.exports = {
  getAllcompanies,
  searchcompanies,
  getCompanyById,
  createCompany,
  createBulkcompanies,
  updateCompany,
  deleteCompany,
};
