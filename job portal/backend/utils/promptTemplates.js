// utils/promptTemplates.js

const COMMON_INSTRUCTIONS = `
Return your response in this exact plain-text format (do not use markdown or JSON):
DESCRIPTION: [Your generated description here]
PREFERENCES: [Candidate preferences or "None"]
QUESTIONS: [Question 1] | [Question 2] | [Question 3] | [Question 4] | [Question 5]
`;

exports.getPromptForOpportunity = (data) => {
  const { opportunityType, title, skills, workType, workSchedule, duration } =
    data;

  const skillsList = skills.join(", ");
  let context = "";

  switch (opportunityType.toLowerCase()) {
    case "internship":
      context = `This is a ${
        duration || "3-month"
      } internship. Focus on learning, mentorship, and foundational skills.`;
      break;
    case "project":
      context = `This is a short-term project (${
        duration || "4-8 weeks"
      }). Emphasize deliverables, timeline, and scope.`;
      break;
    default: // "job"
      context = `This is a full role. Focus on impact, responsibilities, and qualifications.`;
  }

  return `
You are an expert HR recruiter. Generate a professional, inclusive, and concise opportunity description.

Opportunity Type: ${opportunityType}
Title: ${title}
Skills Required: ${skillsList}
Work Type: ${workType || "Not specified"}
Work Schedule: ${workSchedule || "Full-time"}
${duration ? `Duration: ${duration}` : ""}

${context}

Keep the description between 200–400 words. Screening questions should be short (<100 chars), relevant, and max 5.Prefrences should be specific but concise generate 3 prefrences (<200 chars).

${COMMON_INSTRUCTIONS}
`.trim();
};
