// const db = require('../models');
// const { Op } = require('sequelize');
// const FilterService = require('../services/filterServices');

// const getAllMasterData = async (req, res) => {
//     try {
//         // Fetch all master data in parallel
//         const [
//             duration,
//             perks,
//             locations,
//             schoolColleges,
//             courses,
//             jobRoles,
//             specializations,
//             domains,
//             skillsByDomain,
//             specializationByCourse,
//             industries,
//             languages,
//             companies
//         ] = await Promise.allSettled([
//             // Get duration options with all fields
//             db.FilterOption.findAll({
//                 where: {
//                     category: 'duration',
//                     is_active: true
//                 },
//                 attributes: ['id', 'value'],
//                 order: [['value', 'ASC']]
//             }),
//             db.FilterOption.findAll({
//                 where: {
//                     category: 'perks',
//                     is_active:true
//                 },
//                 attributes: ['id', 'value'],
//                 order:[['value','ASC']]
//             }),
//             db.Location.findAll({
//                 attributes: ['id', 'name'],
//                 order: [['name', 'ASC']]
//             }),
//             db.SchoolCollege.findAll({
//                 attributes: ['id', 'name'],
//                 order: [['name', 'ASC']]
//             }),
//             db.Course.findAll({
//                 attributes: ['id', 'name'],
//                 order: [['name', 'ASC']]
//             }),
//             db.JobRole.findAll({
//                 attributes: ['id', 'title', 'description'],
//                 order: [['title', 'ASC']]
//             }),
//             db.Specialization.findAll({
//                 where: { course_id: { [Op.ne]: null } },
//                 attributes: ['id', 'name', 'course_id'],
//                 order: [['name', 'ASC']],
//                 include: [{
//                     model: db.Course,
//                     as: 'course',
//                     attributes: ['name']
//                 }]
//             }),
//             db.Domain.findAll({
//                 attributes: ['domain_id', 'domain_name'],
//                 order: [['domain_name', 'ASC']]
//             }),
//             // Get skills grouped by domain
//             db.Domain.findAll({
//                 attributes: ['domain_id', 'domain_name'],
//                 order: [['domain_name', 'ASC']]
//             }).then(domains => {
//                 return Promise.all(domains.map(async domain => {
//                     const skills = await db.Skill.findAll({
//                         where: { domain_id: domain.domain_id },
//                         attributes: ['skill_id', 'skill_name'],
//                         order: [['skill_name', 'ASC']]
//                     });
//                     return {
//                         domain_id: domain.domain_id,
//                         domain_name: domain.domain_name,
//                         skills: skills.map(skill => ({
//                             skill_id: skill.skill_id,
//                             skill_name: skill.skill_name
//                         }))
//                     };
//                 }));
//             }),
//             // Get specializations grouped by course
//             db.Course.findAll({
//                 attributes: ['id', 'name'],
//                 include: [{
//                     model: db.Specialization,
//                     as: 'specializations',
//                     attributes: ['id', 'name'],
//                     where: { id: { [Op.ne]: null } },
//                     required: false
//                 }],
//                 order: [['name', 'ASC']]
//             }),
//             db.Industry.findAll({
//                 attributes: ['id', 'name'],
//                 order: [['name', 'ASC']]
//             }),
//             db.Language.findAll({
//                 attributes: ['id', 'name'],
//                 order: [['name', 'ASC']]
//             }),
//             db.CompanyRecruiterProfile.findAll({
//                 attributes: ['id', 'company_name'],
//                 where: {
//                     company_name: {
//                         [Op.ne]: null
//                     }
//                 },
//                 order: [['company_name', 'ASC']]
//             })
//         ]);

//         // Format the response
//         const response = {
//             success: true,
//             message: 'Master data fetched successfully',
//             data: {
//                 duration: duration.status === 'fulfilled' ? duration.value : { status: 'rejected', reason: duration.reason },
//                 perks:perks.status==='fulfilled'?perks.value:{status:'rejected',reason:perks.reason},
//                 locations: locations.status === 'fulfilled' ? locations.value : { status: 'rejected', reason: locations.reason },
//                 courses: courses.status === 'fulfilled' ? courses.value : { status: 'rejected', reason: courses.reason },
//                 schoolColleges: schoolColleges.status === 'fulfilled' ? schoolColleges.value : { status: 'rejected', reason: schoolColleges.reason },
//                 jobRoles: jobRoles.status === 'fulfilled' ? jobRoles.value : { status: 'rejected', reason: jobRoles.reason },
//                 specializations: specializations.status === 'fulfilled' ? specializations.value : { status: 'rejected', reason: specializations.reason },
//                 domains: domains.status === 'fulfilled' ? domains.value : { status: 'rejected', reason: domains.reason },
//                 skillsByDomain: skillsByDomain.status === 'fulfilled' ? skillsByDomain.value : { status: 'rejected', reason: skillsByDomain.reason },
//                 specializationByCourse: specializationByCourse.status === 'fulfilled' ? specializationByCourse.value : { status: 'rejected', reason: specializationByCourse.reason },
//                 industries: industries.status === 'fulfilled' ? industries.value : { status: 'rejected', reason: industries.reason },
//                 languages: languages.status === 'fulfilled' ? languages.value : { status: 'rejected', reason: languages.reason },
//                 companies: companies.status === 'fulfilled' ? companies.value : { status: 'rejected', reason: companies.reason }
//             }
//         };

//         return res.status(200).json(response);
//     } catch (error) {
//         console.error("Error while fetching master data:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//             error: error.message,
//             data: null
//         });
//     }
// };

// module.exports = {
//     getAllMasterData
// };










































const db = require('../models');
const { Op } = require('sequelize');

// Global limit for all master data lists during transitional phase
const LIMIT = 10;

const getAllMasterData = async (req, res) => {
    try {
        const [
            duration,
            perks,
            locations,
            schoolColleges,
            courses,
            jobRoles,
            specializations,
            domains,
            skillsByDomain,
            specializationByCourse,
            industries,
            languages,
            companies
        ] = await Promise.allSettled([
            // Duration
            db.FilterOption.findAll({
                where: { category: 'duration', is_active: true },
                attributes: ['id', 'value'],
                order: [['value', 'ASC']]
            }),

            // Perks
            db.FilterOption.findAll({
                where: { category: 'perks', is_active: true },
                attributes: ['id', 'value'],
                order:[['value','ASC']]
            }),

            // Locations
            db.Location.findAll({
                attributes: ['id', 'name'],
                limit: LIMIT
            }),

            // School/Colleges
            db.SchoolCollege.findAll({
                attributes: ['id', 'name'],
                limit: LIMIT
            }),

            // Courses
            db.Course.findAll({
                attributes: ['id', 'name'],
                limit: LIMIT
            }),

            // Job Roles
            db.JobRole.findAll({
                attributes: ['id', 'title'], // skip description for speed
                limit: LIMIT
            }),

            // Specializations (only name + course_id — no join)
            db.Specialization.findAll({
                where: { course_id: { [Op.ne]: null } },
                attributes: ['id', 'name', 'course_id'],
                limit: LIMIT
            }),

            // Domains
            db.Domain.findAll({
                attributes: ['domain_id', 'domain_name'],
                limit: LIMIT
            }),

            // Skills grouped by domain (fetch top N domains, then top N skills each)
            (async () => {
                const domains = await db.Domain.findAll({
                    attributes: ['domain_id', 'domain_name'],
                    // limit: LIMIT
                });
                const domainMap = await Promise.all(
                    domains.map(async (d) => {
                        const skills = await db.Skill.findAll({
                            where: { domain_id: d.domain_id },
                            attributes: ['skill_id', 'skill_name'],
                            limit: LIMIT
                        });
                        return {
                            domain_id: d.domain_id,
                            domain_name: d.domain_name,
                            skills: skills.map(s => ({
                                skill_id: s.skill_id,
                                skill_name: s.skill_name
                            }))
                        };
                    })
                );
                return domainMap;
            })(),

            // Specializations by course (fetch top N courses, then their specs)
            (async () => {
                const courses = await db.Course.findAll({
                    attributes: ['id', 'name'],
                    limit: LIMIT
                });
                const courseMap = await Promise.all(
                    courses.map(async (c) => {
                        const specs = await db.Specialization.findAll({
                            where: { course_id: c.id },
                            attributes: ['id', 'name'],
                            limit: LIMIT
                        });
                        return {
                            id: c.id,
                            name: c.name,
                            specializations: specs
                        };
                    })
                );
                return courseMap;
            })(),

            // Industries
            db.Industry.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            }),

            // Languages
            db.Language.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            }),

            // Companies
            db.CompanyRecruiterProfile.findAll({
                where: { company_name: { [Op.ne]: null } },
                attributes: ['id', 'company_name'],
                limit: LIMIT
            })
        ]);

        // Helper to safely extract value or error
        const safeValue = (result) => 
            result.status === 'fulfilled' ? result.value : [];

        const response = {
            success: true,
            message: 'Master data fetched (limited, unordered, optimized)',
            data: {
                duration: safeValue(duration),
                perks: safeValue(perks),
                locations: safeValue(locations),
                schoolColleges: safeValue(schoolColleges),
                courses: safeValue(courses),
                jobRoles: safeValue(jobRoles),
                specializations: safeValue(specializations),
                domains: safeValue(domains),
                skillsByDomain: safeValue(skillsByDomain),
                specializationByCourse: safeValue(specializationByCourse),
                industries: safeValue(industries),
                languages: safeValue(languages),
                companies: safeValue(companies)
            }
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Fast master data fetch error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    getAllMasterData
};