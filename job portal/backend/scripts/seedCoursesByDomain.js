//command to run the script:- 
//  node scripts/seedCoursesByDomain.js


const db = require("../models");
const { Domain, Skill, LearningResource, ResourceSkill } = db;

  // Helper: random integer [min, max]
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Helper: random float with ±20% spread
  function randomizeDuration(base) {
    return parseFloat((base * (0.8 + Math.random() * 0.4)).toFixed(2));
  }

  async function seedCoursesByDomain() {
    console.log("Seeding courses by domain...");

    try {
      // const domains = await Domain.findAll({
      //   include: [
      //     {
      //       model: Skill,
      //       attributes: ["skill_id", "domain_id]","skill_name"]
      //     },
      //   ],
      // });


      const domains = await Domain.findAll();
      const allSkills = await Skill.findAll();

      console.log(`Found ${domains.length} domains`);

      for (const domain of domains) {
        // const skills = domain.Skill || [];

        const skills = allSkills.filter(skill => skill.domain_id === domain.domain_id);

        if (skills.length === 0) {
          console.log(
            ` Domain "${domain.domain_name}" has no skills. Skipping.`
          );
          continue;
        }

        // === BEGINNER COURSE ===
        const beginnerTotalDays = randInt(30, 60); // 1–2 months
        const beginnerCourse = await LearningResource.create({
          resource_type: "course",
          source_type: "internal",
          title: `${domain.domain_name} Fundamentals`,
          description: `Comprehensive beginner-friendly course covering the fundamentals of ${domain.domain_name}.`,
          difficulty_level: "beginner",
          total_duration: beginnerTotalDays,
          is_active: true,
        });

        // Select 3–5 random skills (shuffle + slice)
        const beginnerSkillCount = Math.min(randInt(3, 5), skills.length);
        const selectedBeginnerSkills = [...skills]
          .sort(() => 0.5 - Math.random())
          .slice(0, beginnerSkillCount);

        const baseBeginnerPerSkill =
          beginnerTotalDays / Math.max(1, selectedBeginnerSkills.length);
        for (const skill of selectedBeginnerSkills) {
          //  Guard against duplicate (resource_id, skill_id)
          const exists = await ResourceSkill.findOne({
            where: {
              resource_id: beginnerCourse.resource_id,
              skill_id: skill.skill_id,
            },
          });
          if (exists) continue;

          await ResourceSkill.create({
            resource_id: beginnerCourse.resource_id,
            skill_id: skill.skill_id,
            skill_importance: "primary",
            skill_learning_duration: randomizeDuration(baseBeginnerPerSkill), // ✅ days
            skill_type: "outcome",
          });
        }

        console.log(
          ` Created beginner course for "${domain.domain_name}" (${beginnerTotalDays} days) with ${selectedBeginnerSkills.length} skills`
        );

        // === INTERMEDIATE COURSE ===
        const intermediateTotalDays = randInt(45, 90); // 1.5–3 months
        const intermediateCourse = await LearningResource.create({
          resource_type: "course",
          source_type: "internal",
          title: `Advanced ${domain.domain_name}`,
          description: `Deepen your expertise in ${domain.domain_name} with advanced techniques, case studies, and real-world applications.`,
          difficulty_level: "intermediate",
          total_duration: intermediateTotalDays, 
          is_active: true,
        });

        // Select 4–6 skills (can overlap with beginner — realistic for pathways)
        const intermediateSkillCount = Math.min(randInt(4, 6), skills.length);
        const selectedIntermediateSkills = [...skills]
          .sort(() => 0.5 - Math.random())
          .slice(0, intermediateSkillCount);

        const baseIntermediatePerSkill =
          intermediateTotalDays /
          Math.max(1, selectedIntermediateSkills.length);
        for (const skill of selectedIntermediateSkills) {
          //  Duplicate guard
          const exists = await ResourceSkill.findOne({
            where: {
              resource_id: intermediateCourse.resource_id,
              skill_id: skill.skill_id,
            },
          });
          if (exists) continue;

          await ResourceSkill.create({
            resource_id: intermediateCourse.resource_id,
            skill_id: skill.skill_id,
            skill_importance: "primary",
            skill_learning_duration: randomizeDuration(
              baseIntermediatePerSkill
            ), 
            skill_type: "outcome",
          });
        }

        console.log(
          ` Created intermediate course for "${domain.domain_name}" (${intermediateTotalDays} days) with ${selectedIntermediateSkills.length} skills`
        );
      }

      console.log("\n Course seeding complete!");
    } catch (error) {
      console.error(" Seeding failed:", error);
      throw error;
    }
  }

  // Run seeder
  seedCoursesByDomain()
    .then(() => {
      console.log("All done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
