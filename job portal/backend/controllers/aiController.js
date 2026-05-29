const { getGenerativeModel } = require( "../config/gemini.js");
const { getPromptForOpportunity } =require("../utils/promptTemplates.js");
const { parseAIGeneration } =require("../utils/parseAIGeneration.js");

exports.generateOpportunityContent = async (req, res) => {
  try {
    const { opportunityType, title, skills = [] } = req.body;

    // Validate minimum input
    if (!opportunityType || !["Job", "Internship", "Project"].includes(opportunityType)) {
      return res.status(400).json({ error: "Valid opportunity type is required." });
    }
    if (!title?.trim()) {
      return res.status(400).json({ error: "Job title is required." });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "At least one skill is required." });
    }

    // Build safe input data
    const inputData = {
      opportunityType,
      title: title.trim(),
      skills: skills.map(s => s.trim()).filter(Boolean),
      workType: req.body.workType || null,
      workSchedule: req.body.workSchedule || null,
      duration: req.body.duration || null
    };

    // Generate prompt
    const prompt = getPromptForOpportunity(inputData);
    console.log("the prompt sent",prompt);

    // Call Gemini
    const model = getGenerativeModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    });

    const response = result.response;
    const rawText = response.text();

    // Parse and sanitize
    const parsed = parseAIGeneration(rawText);

    res.json({ aiSuggestion: parsed });
  } catch (error) {
    console.error("AI Generation Error:", error);
    if (error.message?.includes("API_KEY")) {
      res.status(500).json({ error: "AI service misconfigured." });
    } else if (error.message?.includes("quota")) {
      res.status(429).json({ error: "AI quota exceeded. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to generate content. Please try again." });
    }
  }
};