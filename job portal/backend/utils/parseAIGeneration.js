
exports.parseAIGeneration = (rawText) => {
  const result = {
    description: "",
    candidatePreferences: "",
    screeningQuestions: []
  };

  const descMatch = rawText.match(/DESCRIPTION:\s*([\s\S]*?)(?=PREFERENCES:|$)/i);
  const prefMatch = rawText.match(/PREFERENCES:\s*([^\n]*)/i);
  const quesMatch = rawText.match(/QUESTIONS:\s*([^\n]*)/i);

  if (descMatch && descMatch[1]) {
    result.description = descMatch[1].trim().substring(0, 2500); // Max 2500 chars
  }

  if (prefMatch && prefMatch[1] && prefMatch[1].toLowerCase() !== "none") {
    result.candidatePreferences = prefMatch[1].trim().substring(0, 300); // Max 300 chars
  }

  if (quesMatch && quesMatch[1]) {
    const questions = quesMatch[1]
      .split("|")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .map(q => q.length > 100 ? q.substring(0, 100) : q) // Max 100 chars per question
      .slice(0, 5); // Max 5 questions
    result.screeningQuestions = questions;
  }

  return result;
};