const express = require("express");
const router = express.Router();
const companyController = require("../masterDataController/companyController");

// GET all companies
router.get("/", companyController.getAllcompanies);

// SEARCH companies (min 3 characters)
router.get("/search", companyController.searchcompanies);

// POST create new company
router.post("/", companyController.createCompany);

// POST create multiple companies (bulk insert) - MUST come before /:id route
router.post("/bulk", companyController.createBulkcompanies);

// GET company by ID
router.get("/:id", companyController.getCompanyById);

// PUT update company
router.put("/:id", companyController.updateCompany);

// DELETE company
router.delete("/:id", companyController.deleteCompany);

module.exports = router;
