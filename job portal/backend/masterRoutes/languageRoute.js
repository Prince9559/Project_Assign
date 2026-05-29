const express = require("express");
const router = express.Router();
const languageController = require('../masterDataController/languageController');       

//get all languages
router.get("/", languageController.getAllLanguages);

//search languages
router.get("/search", languageController.searchLanguages);

//get language by id
router.get("/:languageId", languageController.getLanguageById);

//add new language
router.post("/", languageController.addLanguage);

//update language by id
router.put("/:languageId", languageController.updateLanguageById);

//delete language by id
router.delete("/:languageId", languageController.deleteLanguageById);

module.exports = router;
