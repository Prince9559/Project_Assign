// services/pathwayGeneration/opportunityFetcher.js

const { Op } = require("sequelize");
const db = require("../../models");

/**
 * Fetch all opportunities (courses, internships, jobs, projects)
 * No duplication - query from source tables directly
 */
async function fetchAllOpportunities(userPreferences = {}) {
  const opportunities = [];

  // Default preferences
  const prefs = {
    include_courses: userPreferences.include_courses !== false,
    include_projects: userPreferences.include_projects !== false,
    include_internships: userPreferences.include_internships !== false,
    include_jobs: userPreferences.include_jobs !== false,
  };

  // 1. Fetch COURSES from learning_resources
  if (prefs.include_courses) {
    const courses = await db.LearningResource.findAll({
      where: {
        resource_type: "course",
        is_active: true,
      },
      include: [
        {
          model: db.ResourceSkill,
          as: "resourceSkills",
          include: [
            {
              model: db.Skill,
              as: "Skill",
              attributes: ["skill_id", "skill_name"],
            },
          ],
        },
      ],
    });

    courses.forEach((course) => {
      const skillsProvided = (course.resourceSkills || []).map((rs) => ({
        skill_id: rs.skill_id,
        skill_name: rs.Skill?.skill_name || "Unknown",
        experience_months: rs.experience_months_provided || 0,
        is_prerequisite: rs.is_prerequisite || false,
        // Store granular duration for this specific skill
        skill_duration: parseFloat(course.skill_learning_duration/7) || null,
      }));

      opportunities.push({
        type: "course",
        id: course.resource_id,
        title: course.title,
        description: course.description,
        duration_months: parseFloat(course.total_duration / 7),
        skill_learning_duration: parseFloat(course.skill_learning_duration) || null,
        duration_days: parseFloat(course.total_duration),
        difficulty_level: course.difficulty_level,
        rating: parseFloat(course.rating) || 0,
        skills_provided: skillsProvided,
        prerequisites: skillsProvided.filter((s) => s.is_prerequisite),
      });
    });
  }

  // 2. Fetch INTERNSHIPS from job_posts
  if (prefs.include_internships) {
    const internships = await db.JobPost.findAll({
      where: {
        opportunity_type: "Internship",
        active_status: { [Op.in]: [1, 2] }, // Active or closed (still usable for learning)
      },
      include: [
        // {
        //   model: db.JobPostSkill,
        //   as: "skills",
        //   include: [
        //     {
        //       model: db.Skill,
        //       as: "Skill",
        //       attributes: ["skill_id", "skill_name"],
        //     },
        //   ],
        // },

        {
          model: db.Skill,
          as: "skills", // ← This is your existing belongsToMany alias
          through: {
            attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
          },
          attributes: ["skill_id", "skill_name"],
        },
      ],
    });

    internships.forEach((internship) => {
    //   const skillsProvided = (internship.skills || []).map((jps) => ({
    //     skill_id: jps.skill_id,
    //     skill_name: jps.Skill?.skill_name || "Unknown",
    //     // Internships provide experience - assume they provide what they require
    //     experience_months: jps.min_experience_months || 6, // Default 6 months if not specified
    //     is_prerequisite: false,
    //   }));


    // Calculate duration
      let durationMonths = 6; // Default
      if (internship.internship_start_date && internship.internship_to_date) {
        const start = new Date(internship.internship_start_date);
        const end = new Date(internship.internship_to_date);
        durationMonths = Math.max(
          1,
          Math.round((end - start) / (30 * 24 * 60 * 60 * 1000))
        );
      }

    const skillsProvided = (internship.skills || []).map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      experience_months: durationMonths || skill.JobPostSkill?.min_experience_months || 6,
      is_prerequisite: skill.JobPostSkill?.type === "must_have",
    }));

      

      opportunities.push({
        type: "internship",
        id: internship.job_id,
        title: internship.JobRole?.title || "Internship",
        description: internship.job_description,
        duration_months: durationMonths,
        difficulty_level: "intermediate",
        rating: 0,
        skills_provided: skillsProvided,
        prerequisites: [], // Can add logic later if needed
      });
    });
  }

  // 3. Fetch PROJECTS from job_posts
  if (prefs.include_projects) {
    const projects = await db.JobPost.findAll({
      where: {
        opportunity_type: "Project",
        active_status: { [Op.in]: [1, 2] },
      },
      include: [
        // {
        //   model: db.JobPostSkill,
        //   as: "skills",
        //   include: [
        //     {
        //       model: db.Skill,
        //       as: "Skill",
        //       attributes: ["skill_id", "skill_name"],
        //     },
        //   ],
        // },


         {
      model: db.Skill,
      as: "skills", // ← This is your existing belongsToMany alias
      through: {
        attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
      },
      attributes: ["skill_id", "skill_name"],
    },
      ],
    });

    projects.forEach((project) => {
    //   const skillsProvided = (project.skills || []).map((jps) => ({
    //     skill_id: jps.skill_id,
    //     skill_name: jps.Skill?.skill_name || "Unknown",
    //     experience_months: jps.min_experience_months || 3, // Projects give moderate experience
    //     is_prerequisite: false,
    //   }));



    

      // Calculate duration
      let durationMonths = 2; // Default
      if (project.project_start_date && project.project_end_date) {
        const start = new Date(project.project_start_date);
        const end = new Date(project.project_end_date);
        durationMonths = Math.max(
          1,
          Math.round((end - start) / (30 * 24 * 60 * 60 * 1000))
        );
      }


      const skillsProvided = (project.skills || []).map((skill) => ({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        // experience_months: skill.JobPostSkill?.min_experience_months || 6,
        experience_months: durationMonths || 2 ,
        is_prerequisite: skill.JobPostSkill?.type === "must_have",
      }));

      opportunities.push({
        type: "project",
        id: project.job_id,
        title: project.JobRole?.title || "Project",
        description: project.job_description,
        duration_months: durationMonths,
        difficulty_level: "intermediate",
        rating: 0,
        skills_provided: skillsProvided,
        prerequisites: [],
      });
    });
  }

  // 4. Fetch JOBS from job_posts
  if (prefs.include_jobs) {
    const jobs = await db.JobPost.findAll({
      where: {
        opportunity_type: "Job",
        active_status: { [Op.in]: [1, 2] },
      },
      include: [
        // {
        //   model: db.JobPostSkill,
        //   as: "skills",
        //   include: [
        //     {
        //       model: db.Skill,
        //       as: "Skill",
        //       attributes: ["skill_id", "skill_name"],
        //     },
        //   ],
        // },
        {
          model: db.Skill,
          as: "skills", // ← This is your existing belongsToMany alias
          through: {
            attributes: ["type", "min_experience_months"], // ← Pull JobPostSkill fields here
          },
          attributes: ["skill_id", "skill_name"],
        },
      ],
    });

    jobs.forEach((job) => {
    //   const skillsProvided = (job.skills || []).map((jps) => ({
    //     skill_id: jps.skill_id,
    //     skill_name: jps.Skill?.skill_name || "Unknown",
    //     experience_months: jps.min_experience_months || 12, // Jobs give significant experience
    //     is_prerequisite: jps.type === "must_have", // Must-have skills are prerequisites for jobs
    //   }));

    const skillsProvided = (job.skills || []).map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      // experience_months: skill.JobPostSkill?.min_experience_months || 6,
      experience_months: 6,
      is_prerequisite: skill.JobPostSkill?.type === "must_have",
    }));

      opportunities.push({
        type: "job",
        id: job.job_id,
        title: job.JobRole?.role_name || "Job",
        description: job.job_description,
        duration_months: 12, // Assume 1 year for experience gain
        difficulty_level: "advanced",
        rating: 0,
        skills_provided: skillsProvided,
        prerequisites: skillsProvided.filter((s) => s.is_prerequisite),
      });
    });
  }

  return opportunities;
}


// services/pathwayGeneration/opportunityFetcher.js

/**
 * Filter opportunities to only those that teach target skills
 */
function filterRelevantOpportunities(opportunities, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;
  const targetSkillIds = new Set([
    ...must_have_skills.map(s => s.skill_id),
    ...preferred_skills.map(s => s.skill_id),
  ]);
  
  console.log(`[OpportunityFilter] Target skills (${targetSkillIds.size}): ${Array.from(targetSkillIds).join(', ')}`);
  
  if (targetSkillIds.size === 0) {
    console.log('[OpportunityFilter] WARNING: No target skills defined!');
    return [];
  }
  
  const relevant = opportunities.filter(opp => {
    const teachesTargetSkill = opp.skills_provided.some(skill => 
      targetSkillIds.has(skill.skill_id)
    );
    
    if (teachesTargetSkill) {
      const targetSkillsInOpp = opp.skills_provided
        .filter(s => targetSkillIds.has(s.skill_id))
        .map(s => `${s.skill_name}(${s.experience_months}mo)`)
        .join(', ');
      
      console.log(`[OpportunityFilter] RELEVANT: ${opp.type} "${opp.title}" teaches: ${targetSkillsInOpp}`);
    }
    
    return teachesTargetSkill;
  });
  
  console.log(`[OpportunityFilter] Result: ${relevant.length}/${opportunities.length} opportunities are relevant`);
  
  return relevant;
}

module.exports = {
  fetchAllOpportunities,
  filterRelevantOpportunities,
};



