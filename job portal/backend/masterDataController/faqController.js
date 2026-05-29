

const { FAQ } = require('../models');
const createFaq = async (req, res) => {
    try {
        const data = req.body;

        // Normalize input to array (support both single object or array of objects)
        const faqArray = Array.isArray(data) ? data : [data];

        // Basic validation
        for (const faq of faqArray) {
            if (!faq.question || !faq.answer || !faq.role) {
                return res.status(400).json({
                    error: "Each FAQ must include 'question', 'answer', and 'role'."
                });
            }
        }

        // Add is_active = true to each
        const faqEntries = faqArray.map(faq => ({
            question: faq.question,
            answer: faq.answer,
            role: faq.role,
            is_active: true
        }));

        // Bulk insert
        const createdFaqs = await FAQ.bulkCreate(faqEntries);

        return res.status(201).json({
            message: "FAQs created successfully",
            data: createdFaqs
        });

    } catch (error) {
        console.error("Error while creating FAQ:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getFaqs = async (req, res) => {
    try {
        const role = req.params.role;
        const faqs = await FAQ.findAll({
            where: { role: role, is_active: true },
            order: [['created_at', 'DESC']]
        });
        if (faqs.length == 0) {
            return res.status(404).json({ message: "No FAQs found for this role." });
        }
        res.status(200).json({ message: "FAQs fetched successfully", data: faqs });
    } catch (error) {
        console.log("Error while fetching FAQs:", error);
        res.status(500).json({ error: "Internal Server Error:" + error.message });
    }
}

const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, is_active } = req.body;
        const faq = await FAQ.findByPk(id);
        if (!faq) {
            return res.status(404).json({
                error: "FAQ not found with the provided ID."
            })
        }
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        faq.is_active = is_active !== undefined ? is_active : faq.is_active;
        await faq.save();
        res.status(200).json({ message: "FAQs updated successfully", data: faq });
    } catch (error) {
        console.log("Error while updating FAQ:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findByPk(id);
        if (!faq) {
            return res.status(404).json({
                error: "FAQ not found for the provided ID."
            })
        }
        await faq.destroy();
        return res.status(200).json({
            message: "FAQ deleted successfully."
        })
    } catch (error) {
        console.log("Error while deleting FAQ:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createFaq,
    getFaqs,
    updateFaq,
    deleteFaq
};