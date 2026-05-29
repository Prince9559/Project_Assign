const { Language } = require("../models");
const { Op } = require("sequelize");
const addLanguage = async (req, res) => {
   try {
       const {language} = req.body;
       if (!language) {
           return res.status(400).json({
               message: "Language is  required",
               success: false,
               data: null,
               error:"Language is required"
           })
       }
       const existingLanguage = await Language.findOne({
           where: {
               name:language.toLowerCase()
           }
       })
       if (existingLanguage) {
           return res.status(409).json({
               message: "Language is already exist",
               success: false,
               data: null,
               error:"Language is already exist"
           })
       }
       const newLanguage = await Language.create({
           name:language.toLowerCase()
       })
       return res.status(201).json({
           message: "Language added successfully",
           success: true,
           data: newLanguage,
           error:null
       })
   } catch (error) {
       console.log("Error while adding Languages", error.message);
       return res.status(500).json({
           message: "Internal server error",
           success: false,
           data: null,
           error:error.message,
       })
   }
}



async function searchLanguages(req, res) {
    try {
        const { search } = req.query;

        // validation: minimum 3 characters
        if (!search || search.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please enter at least 3 characters to search"
            });
        }

        const languages = await Language.findAll({
            where: {
                name: {
                    [Op.like]: `%${search.toLowerCase()}%`   // MySQL
                    // [Op.iLike]: `%${search}%` // PostgreSQL
                }
            },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']],
            limit: 10
        });

        return res.status(200).json({
            success: true,
            data: languages,
            message: "Languages fetched successfully"
        });

    } catch (error) {
        console.error("Error searching languages:", error);
        return res.status(500).json({
            success: false,
            message: "Error searching languages",
            error: error.message
        });
    }
}




const getAllLanguages = async (req, res) => {
    try {
        const Languages = await Language.findAll(
            {
                attributes: ['id', 'name'],
                order:[['name','ASC']]
            }
        )
        if (Languages.length == 0) {
            return res.status(404).json({
                message: 'No languages found',
                success: false,
                data: null,
                error:'No Languages found'
            })
        }
        return res.status(200).json({
            message: "All Languges fetched successfully",
            success: true,
            data: Languages,
            error:null,
        })
    } catch (error) {
        console.log("Error while fetching allLanguags", error.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            data: null,
            error:error.message,
        })
    }
}

const deleteLanguageById = async (req, res) => {
    try {
        const { languageId } = req.params;
        const language = await Language.findByPk(languageId);
        if (!language) {
            return res.status(404).json({
                message: "Language for given id not found",
                success: false,
                data: null,
                error:"Language for given id not found"
            })
        }
        await language.destroy();
        return res.status(200).json({
            message: "Languages deleted successfully",
            success: true,
            data: language,
            error:null,
        })
    } catch (error) {
        console.log("Error while deleting languages", error.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            data: null,
            error:error.message,
        })
    }
}

const getLanguageById = async (req, res) => {
    try {
        const { languageId } = req.params;
        if (!languageId) {
            return res.status(400).json({
                message: "LanguageId is required",
                success: false,
                data: null,
                error:"LanguageId is required"
            })
        }
        const language = await Language.findByPk(languageId);
        if (!language) {
            return res.status(404).json({
                message: "Language for given id not found",
                success: false,
                data: null,
                error:"Language for given id not found",
            })
        }
        return res.status(200).json({
            message: "Languages fetched successfully",
            success: true,
            data: language,
            error:null,
        })
    } catch (error) {
        console.log("Error while fetching LanguageById", error.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            data: null,
            error:error.message,
        })
    }
}
const updateLanguageById = async (req, res) => {
    try {
        const { languageId } = req.params;
        const { language } = req.body;
        const LanguageToUpdate = await Language.findByPk(languageId);
        if (!LanguageToUpdate) {
            return res.status(404).json({
                message: "Language for given id not found",
                success: false,
                data: null,
                error:"Language for given id not found",
            })
        }
        LanguageToUpdate.language = language;
        await LanguageToUpdate.save();
        return res.status(200).json({
            message: "Language updated successfully",
            success: true,
            data: LanguageToUpdate,
            error:null,
        })
    } catch (error) {
        console.log("Error while updating LanguageById", error.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            data: null,
            error:error.message,
        })
    }
}
module.exports = {
    addLanguage,
    getAllLanguages,
    deleteLanguageById,
    getLanguageById,
    updateLanguageById,
    searchLanguages
}
