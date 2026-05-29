// // controllers/feedController.js
// const { Op,  Sequelize } = require("sequelize");
// const db = require("../models");
// const { sequelize } = db;
// const {
//   User,
//   UserDetail,
//   Follow,
//   FeedPost,
//   JobPost,
//   CompanyRecruiterProfile,
//   UserSkill,
//   Education,
//   Application,
//   JobPostSkill,
//   JobPostCollege,
//   JobPostCourse,
// } = db;



// const MAX_FOLLOWED_IDS = 1500;
// const LIMIT = 20;

// exports.getFeed = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
//     const { cursor } = req.query;

//     // === Fetch user context ===
//     let followedUserIds = [];
//     let skillIds = [];
//     let collegeIds = [];
//     let courseIds = [];
//     let appliedJobIds = [];

//     // Followed users
//     const followedRows = await Follow.findAll({
//       where: { follower_id: userId },
//       attributes: ["followed_id"],
//       raw: true,
//       limit: MAX_FOLLOWED_IDS,
//     });
//     followedUserIds = followedRows.map(r => r.followed_id);

//     // Role-specific context
//     if (userRole === "STUDENT") {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: userId },
//         attributes: ["id"],
//       });

//       if (userDetail) {
//         const educations = await Education.findAll({
//           where: { user_detail_id: userDetail.id },
//           attributes: ["school_college_id", "course_id"],
//           raw: true,
//         });
//         collegeIds = [...new Set(educations.map(e => e.school_college_id).filter(Boolean))];
//         courseIds = [...new Set(educations.map(e => e.course_id).filter(Boolean))];
//       }

//       const [skills, applications] = await Promise.all([
//         UserSkill.findAll({ where: { user_id: userId }, attributes: ["skill_id"], raw: true }),
//         Application.findAll({ where: { user_id: userId }, attributes: ["job_post_id"], raw: true }),
//       ]);
//       skillIds = skills.map(s => s.skill_id);
//       appliedJobIds = applications.map(a => a.job_post_id);
//     }

//     // Parse cursor: "score:timestamp:rand"
//     let lastScore = Infinity;
//     let lastTimestamp = new Date();
//     let lastRand = 1;

//     if (cursor) {
//       const [s, t, r] = cursor.split(":");
//       lastScore = parseFloat(s) || 0;
//       lastTimestamp = new Date(decodeURIComponent(t));
//       lastRand = parseFloat(r) || 1;
//     }

//     //  MySQL-compatible query 
//     const feedQuery = `
//       (
//         SELECT 
//           'post' AS type,
//           fp.id,
//           fp.user_id AS author_id,
//           fp.caption,
//           fp.image,
//           fp.like_count,
//           fp.comment_count,
//           fp.created_at,
//           u.first_name,
//           u.last_name,
//           u.user_role AS author_role,
//           CASE 
//             WHEN fp.user_id = ? THEN 110
//             WHEN fp.user_id IN (?) THEN 100
//             ELSE 50 
//           END AS relevance_score,
//           RAND() AS rand
//         FROM feed_posts fp
//         INNER JOIN users u ON u.id = fp.user_id
//         WHERE fp.user_id = ? OR fp.user_id IN (?)
//       )
//       UNION ALL
//       (
//         SELECT 
//           'job' AS type,
//           jp.job_id AS id,
//           crp.user_id AS author_id,
//           jp.job_description AS caption,
//           NULL AS image,
//           0 AS like_count,
//           0 AS comment_count,
//           jp.created_at,
//           u.first_name,
//           u.last_name,
//           'COMPANY' AS author_role,
//           (
//             CASE WHEN crp.user_id = ? THEN 98
//                  WHEN crp.user_id IN (?) THEN 95
//                  ELSE 0 END +
//             CASE WHEN jp.job_id IN (?) THEN 85 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_skills jps 
//               WHERE jps.job_post_id = jp.job_id 
//                 AND jps.skill_id IN (?)
//             ) THEN 80 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_colleges jpc 
//               WHERE jpc.job_post_id = jp.job_id 
//                 AND jpc.college_id IN (?)
//             ) THEN 75 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_courses jpc 
//               WHERE jpc.job_post_id = jp.job_id 
//                 AND jpc.course_id IN (?)
//             ) THEN 70 ELSE 0 END +
//             10
//           ) AS relevance_score,
//           RAND() AS rand
//         FROM job_posts jp
//         INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
//         INNER JOIN users u ON u.id = crp.user_id
//         WHERE jp.active_status = 1
//           AND jp.payment_type = 'free'
//       )
//       ORDER BY relevance_score DESC, created_at DESC, rand DESC
//       LIMIT ?
//     `;

//     // Helper: safe array for IN (avoids empty IN ())
//     const safeArray = (arr) => arr.length ? arr : [0]; // 0 = dummy ID (won't match)

//     const queryParams = [
//       // FeedPost section
//       userId,
//       safeArray(followedUserIds),
//       userId,
//       safeArray(followedUserIds),

//       // JobPost section
//       userId,
//       safeArray(followedUserIds),
//       safeArray(appliedJobIds),
//       safeArray(skillIds),
//       safeArray(collegeIds),
//       safeArray(courseIds),

//       // LIMIT
//       LIMIT + 1,
//     ];

//     let rawItems = await sequelize.query(feedQuery, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: queryParams,
//     });

//     // Cursor filtering in JS
//     if (cursor) {
//       rawItems = rawItems.filter(item => {
//         const score = parseFloat(item.relevance_score);
//         const createdAt = new Date(item.created_at);
//         const rand = parseFloat(item.rand);
//         if (score < lastScore) return true;
//         if (score > lastScore) return false;
//         if (createdAt < lastTimestamp) return true;
//         if (createdAt > lastTimestamp) return false;
//         return rand < lastRand;
//       });
//     }

//     const items = rawItems.slice(0, LIMIT);
//     const hasNextPage = rawItems.length > LIMIT;
//     const lastItem = items[items.length - 1];

//     const nextCursor = lastItem
//       ? `${lastItem.relevance_score}:${encodeURIComponent(lastItem.created_at)}:${lastItem.rand}`
//       : null;

//     const feed = items.map(item => ({
//       id: item.id,
//       type: item.type,
//       author: {
//         id: item.author_id,
//         name: `${item.first_name} ${item.last_name}`.trim(),
//         role: item.author_role,
//       },
//       content: (item.caption || "").substring(0, 300) + ((item.caption || "").length > 300 ? "…" : ""),
//       image: item.image,
//       metrics: {
//         likes: parseInt(item.like_count) || 0,
//         comments: parseInt(item.comment_count) || 0,
//       },
//       created_at: item.created_at,
//     }));

//     res.json({ success: true, feed, pagination: { hasNextPage, nextCursor } });

//   } catch (error) {
//     console.error("Feed error:", error);
//     res.status(500).json({ success: false, error: "Failed to load feed" });
//   }
// };

























// // controllers/feedPostController.js
// const db = require("../models");
// const {
//   sequelize,
//   User,
//   UserDetail,
//   Follow,
//   FeedPost,
//   JobPost,
//   CompanyRecruiterProfile,
//   UserSkill,
//   Education,
//   Application,
//   PostComments,
//   PostLikes,
//   UniversityDetail
// } = db;

// const MAX_FOLLOWED_IDS = 1500;

// const getFeed = async (req, res) => {
//   try {
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     const offset = (page - 1) * limit;

//     const loggedInUserId = req.user?.id;
//     if (!loggedInUserId) {
//       return res.status(401).json({ message: "Unauthorized: user not found in token" });
//     }

//     // === STEP 1: Get user context (same as before) ===
//     let followedUserIds = [];
//     let skillIds = [];
//     let collegeIds = [];
//     let courseIds = [];
//     let appliedJobIds = [];

//     const followedRows = await Follow.findAll({
//       where: { follower_id: loggedInUserId },
//       attributes: ["followed_id"],
//       raw: true,
//       limit: MAX_FOLLOWED_IDS,
//     });
//     followedUserIds = followedRows.map(r => r.followed_id);

//     const userRole = req.user.role;
//     if (userRole === "STUDENT") {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: loggedInUserId },
//         attributes: ["id"],
//       });

//       if (userDetail) {
//         const educations = await Education.findAll({
//           where: { user_detail_id: userDetail.id },
//           attributes: ["school_college_id", "course_id"],
//           raw: true,
//         });
//         collegeIds = [...new Set(educations.map(e => e.school_college_id).filter(Boolean))];
//         courseIds = [...new Set(educations.map(e => e.course_id).filter(Boolean))];
//       }

//       const [skills, applications] = await Promise.all([
//         UserSkill.findAll({ where: { user_id: loggedInUserId }, attributes: ["skill_id"], raw: true }),
//         Application.findAll({ where: { user_id: loggedInUserId }, attributes: ["job_post_id"], raw: true }),
//       ]);
//       skillIds = skills.map(s => s.skill_id);
//       appliedJobIds = applications.map(a => a.job_post_id);
//     }

//     // Helper: safe array for IN
//     const safeArray = (arr) => arr.length ? arr : [0];

//     // === STEP 2: Get personalized feed item IDs + types (only IDs!) ===
//     const feedIdQuery = `
//       (
//         SELECT 'post' AS type, fp.id, fp.created_at,
//           CASE 
//             WHEN fp.user_id = ? THEN 110
//             WHEN fp.user_id IN (?) THEN 100
//             ELSE 50 
//           END AS score,
//           RAND() AS rand
//         FROM feed_posts fp
//         WHERE fp.user_id = ? OR fp.user_id IN (?)
//       )
//       UNION ALL
//       (
//         SELECT 'job' AS type, jp.job_id AS id, jp.created_at,
//           (
//             CASE WHEN crp.user_id = ? THEN 98
//                  WHEN crp.user_id IN (?) THEN 95
//                  ELSE 0 END +
//             CASE WHEN jp.job_id IN (?) THEN 85 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_skills jps 
//               WHERE jps.job_post_id = jp.job_id AND jps.skill_id IN (?)
//             ) THEN 80 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_colleges jpc 
//               WHERE jpc.job_post_id = jp.job_id AND jpc.college_id IN (?)
//             ) THEN 75 ELSE 0 END +
//             CASE WHEN EXISTS (
//               SELECT 1 FROM job_post_courses jpc 
//               WHERE jpc.job_post_id = jp.job_id AND jpc.course_id IN (?)
//             ) THEN 70 ELSE 0 END +
//             10
//           ) AS score,
//           RAND() AS rand
//         FROM job_posts jp
//         INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
//         WHERE jp.active_status = 1 AND jp.payment_type = 'free'
//       )
//       ORDER BY score DESC, created_at DESC, rand DESC
//       LIMIT ? OFFSET ?
//     `;

//     const idParams = [
//       loggedInUserId,
//       safeArray(followedUserIds),
//       loggedInUserId,
//       safeArray(followedUserIds),

//       loggedInUserId,
//       safeArray(followedUserIds),
//       safeArray(appliedJobIds),
//       safeArray(skillIds),
//       safeArray(collegeIds),
//       safeArray(courseIds),

//       limit,
//       offset,
//     ];

//     const idResults = await sequelize.query(feedIdQuery, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: idParams,
//     });

//     const totalCountQuery = `
//       SELECT COUNT(*) AS total FROM (
//         (SELECT 1 FROM feed_posts fp WHERE fp.user_id = ? OR fp.user_id IN (?))
//         UNION ALL
//         (SELECT 1 FROM job_posts jp
//          INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
//          WHERE jp.active_status = 1 AND jp.payment_type = 'free')
//       ) AS combined
//     `;

//     const totalCountResult = await sequelize.query(totalCountQuery, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: [
//         loggedInUserId,
//         safeArray(followedUserIds),
//       ],
//     });
//     const totalCount = parseInt(totalCountResult[0].total) || 0;

//     // === STEP 3: Fetch full objects by ID ===
//     const postIds = idResults.filter(i => i.type === 'post').map(i => i.id);
//     const jobIds = idResults.filter(i => i.type === 'job').map(i => i.id);

//     const [feedPosts, jobPosts] = await Promise.all([
//       postIds.length
//         ? FeedPost.findAll({
//             where: { id: postIds },
//             order: [["created_at", "DESC"]],
//             include: [
//               {
//                 model: User,
//                 attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//                 include: [
//                   { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
//                   { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile", attributes: ["logo_url","company_name"] },
//                   { model: UniversityDetail, as: "UniversityDetail", attributes: ["university_logo_url"] },
//                 ],
//               },
//               {
//                 model: PostComments,
//                 as: "comments",
//                 attributes: ["id", "user_id", "comment", "created_at", "updated_at", "parent_comment_id"],
//                 order: [["created_at", "DESC"]],
//               },
//             ],
//           })
//         : Promise.resolve([]),

//       jobIds.length
//         ? JobPost.findAll({
//             where: { job_id: jobIds },
//             include: [
//               {
//                 model: CompanyRecruiterProfile,
//                 // as: "CompanyRecruiterProfile", // note: singular in association
//                 attributes: [],
//                 include: [
//                   {
//                     model: User,
//                     as: "user",
//                     attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//                     include: [
//                       { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
//                       { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile", attributes: ["logo_url"] },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           })
//         : Promise.resolve([]),
//     ]);

//     // Map IDs to items for ordering
//     const postMap = Object.fromEntries(feedPosts.map(p => [p.id, p]));
//     const jobMap = Object.fromEntries(jobPosts.map(j => [j.job_id, j]));

//     // Reconstruct ordered list
//     const orderedItems = idResults.map(item => {
//       if (item.type === 'post') {
//         const post = postMap[item.id];
//         if (post) {
//           const data = post.toJSON();
//           data.feed_type = 'post';
//           return data;
//         }
//       } else if (item.type === 'job') {
//         const job = jobMap[item.id];
//         if (job) {
//           //  Convert JobPost → FeedPost-like structure
//           const user = job.CompanyRecruiterProfile?.user;
//           return {
//             id: job.job_id,
//             feed_type: 'job',
//             caption: job.job_description || job.title || "Job opportunity",
//             image: null,
//             like_count: 0,
//             comment_count: 0,
//             created_at: job.created_at,
//             updated_at: job.updated_at,

//             // Mimic FeedPost.User
//             User: user
//               ? {
//                   id: user.id,
//                   first_name: user.first_name,
//                   last_name: user.last_name,
//                   user_role: "COMPANY",
//                   uuid: user.uuid,
//                   CompanyRecruiterProfile: { logo_url: user.CompanyRecruiterProfile?.logo_url || null },
//                   UserDetail: null,
//                 }
//               : { id: 0, first_name: "Company", last_name: "", user_role: "COMPANY", uuid: "" },

//             // Add job-specific fields (optional)
//             job_data: {
//               job_id: job.job_id,
//               opportunity_type: job.opportunity_type,
//               stipend_min: job.stipend_min,
//               stipend_max: job.stipend_max,
//               job_role_id: job.job_role_id,
//             },

//             // Empty comments (or fetch if needed later)
//             comments: [],
//           };
//         }
//       }
//       return null;
//     }).filter(Boolean);

//     // === STEP 4: Enrich with likes, follows, followers, comments (same as before) ===
//     const enrichedPosts = await Promise.all(
//       orderedItems.map(async (item) => {
//         // Attach profile_pic (same logic)
//         if (item.User.user_role === "COMPANY") {
//           item.User.profile_pic = item.User.CompanyRecruiterProfile?.logo_url || null;
//         } else if (item.User.user_role === "UNIVERSITY") {
//           item.User.profile_pic = item.User.UniversityDetail?.university_logo_url || null;
//         } else {
//           item.User.profile_pic = item.User.UserDetail?.user_profile_pic || null;
//         }

//         // Cleanup nested models
//         delete item.User.UserDetail;
//         delete item.User.CompanyRecruiterProfile;
//         delete item.User.UniversityDetail;

//         // Collect commenter IDs (only for real feed posts)
//         const comments = item.comments || [];
//         item._commenteruser_ids = comments
//           .map(c => parseInt(c.user_id))
//           .filter(Boolean);

//         // Followers count
//         const followersCount = await Follow.count({
//           where: { followed_id: item.User.id },
//         });
//         item.User.followersCount = followersCount;

//         // Liked?
//         const liked = await PostLikes.findOne({
//           where: { post_id: item.id, user_id: loggedInUserId },
//         });
//         item.isLiked = !!liked;

//         // Following?
//         const isFollowing = await Follow.findOne({
//           where: {
//             follower_id: loggedInUserId,
//             followed_id: item.User.id,
//           },
//         });
//         item.User.isFollowing = !!isFollowing;

//         // If it's a job, skip comment enrichment (or add later if needed)
//         return item;
//       })
//     );

//     // Enrich comments (only for real posts — jobs have empty comments for now)
//     const allCommenteruser_ids = Array.from(
//       new Set(enrichedPosts.flatMap(p => (p.feed_type === 'post' ? p._commenteruser_ids : [])))
//     );
//     let commenterUserMap = {};
//     if (allCommenteruser_ids.length > 0) {
//       const commenters = await User.findAll({
//         where: { id: allCommenteruser_ids },
//         attributes: ['id', 'first_name', 'last_name', 'user_role', 'uuid'],
//         include: [
//           { model: UserDetail, as: 'UserDetail', attributes: ['user_profile_pic'] },
//           { model: CompanyRecruiterProfile, as: 'CompanyRecruiterProfile', attributes: ['logo_url'] }
//         ]
//       });
//       commenterUserMap = Object.fromEntries(commenters.map(u => {
//         let profile_pic = null;
//         if (u.user_role === 'COMPANY') {
//           profile_pic = u.CompanyRecruiterProfile?.logo_url || null;
//         } else {
//           profile_pic = u.UserDetail?.user_profile_pic || null;
//         }
//         return [u.id, { first_name: u.first_name, last_name: u.last_name, profile_pic, uuid: u.uuid }];
//       }));
//     }

//     enrichedPosts.forEach(post => {
//       if (post.feed_type === 'post' && Array.isArray(post.comments)) {
//         post.comments = post.comments.map(comment => {
//           const userInfo = commenterUserMap[parseInt(comment.user_id)] || {};
//           return {
//             ...comment,
//             first_name: userInfo.first_name || null,
//             last_name: userInfo.last_name || null,
//             profile_pic: userInfo.profile_pic || null,
//             uuid: userInfo.uuid
//           };
//         });
//       }
//       delete post._commenteruser_ids;
//     });

//     // === STEP 5: Return identical structure to before ===
//     return res.status(200).json({
//       totalPosts: totalCount,
//       currentPage: page,
//       totalPages: Math.ceil(totalCount / limit),
//       posts: enrichedPosts, // ← same key!
//     });

//   } catch (error) {
//     console.error('Error fetching personalized feed:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = { getFeed };