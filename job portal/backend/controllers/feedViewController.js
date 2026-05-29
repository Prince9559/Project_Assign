
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
//   UniversityDetail,
// } = db;

// const MAX_FOLLOWED_IDS = 1500;

// // Helper: safe array for SQL IN
// const safeArray = (arr) => arr.length ? arr : [0];

// // Fetch 1st, 2nd, 3rd-degree connections
// const getSocialGraph = async (userId) => {
//   // 1st-degree: direct follows
//   const firstDegree = await Follow.findAll({
//     where: { follower_id: userId },
//     attributes: ["followed_id"],
//     raw: true,
//     limit: MAX_FOLLOWED_IDS,
//   });
//   const firstIds = firstDegree.map(r => r.followed_id);

//   // 2nd-degree: followed by your follows (friends of friends)
//   let secondIds = [];
//   if (firstIds.length > 0) {
//     const secondRaw = await sequelize.query(`
//       SELECT DISTINCT f2.followed_id
//       FROM follows f1
//       INNER JOIN follows f2 ON f1.followed_id = f2.follower_id
//       WHERE f1.follower_id = ?
//         AND f2.followed_id != ?
//         AND f2.followed_id NOT IN (?)
//       LIMIT 200
//     `, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: [userId, userId, firstIds.length ? firstIds : [0]]
//     });
//     secondIds = secondRaw.map(r => r.followed_id);
//   }

//   // 3rd-degree: followed by 2nd-degree (optional, capped)
//   let thirdIds = [];
//   if (secondIds.length > 0) {
//     const thirdRaw = await sequelize.query(`
//       SELECT DISTINCT f3.followed_id
//       FROM follows f2
//       INNER JOIN follows f3 ON f2.followed_id = f3.follower_id
//       WHERE f2.follower_id IN (?)
//         AND f3.followed_id != ?
//         AND f3.followed_id NOT IN (?)
//       LIMIT 200
//     `, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: [
//         secondIds.length ? secondIds : [0],
//         userId,
//         [...firstIds, ...secondIds].length ? [...firstIds, ...secondIds] : [0]
//       ]
//     });
//     thirdIds = thirdRaw.map(r => r.followed_id);
//   }

//   return { firstIds, secondIds, thirdIds };
// };

// const getFeed = async (req, res) => {
//     console.log("fds")
//   try {


//     console.log("fds1111")
//     const { cursor, limit: limitStr,debug } = req.query;
// const limit = parseInt(limitStr) || 10;

// // Parse cursor: "score:created_at:rand" → e.g., "100:2025-04-05T14%3A20%3A10.123Z:0.789"
// // SAFE cursor parsing (no Infinity, no NaN)
// let lastScore = 999999; // default high finite value
// let lastCreatedAt = new Date('3000-01-01T00:00:00Z'); // far future
// let lastRand = 2.0; // > 1.0

// if (cursor && typeof cursor === 'string') {
//   const parts = cursor.split(":");
//   if (parts.length >= 3) {
//     const [scoreStr, timeStr, randStr] = parts;

//     // Parse score — reject Infinity/NaN
//     const parsedScore = parseFloat(scoreStr);
//     if (isFinite(parsedScore)) {  //  key fix: use isFinite(), not !isNaN()
//       lastScore = parsedScore;
//     }

//     // Parse time
//     const decodedTimeStr = decodeURIComponent(timeStr);
//     const parsedTime = new Date(decodedTimeStr);
//     if (!isNaN(parsedTime.getTime())) {
//       lastCreatedAt = parsedTime;
//     }

//     // Parse rand — must be in [0,1], but allow slight overshoot
//     const parsedRand = parseFloat(randStr);
//     if (isFinite(parsedRand)) {
//       lastRand = parsedRand;
//     }
//   }
// }
//     const showDebug = debug === "1";

//     const loggedInUserId = req.user?.id;
//     if (!loggedInUserId) {
//       return res.status(401).json({ message: "Unauthorized: user not found in token" });
//     }
//     const userRole = req.user.role;

//     // === STEP 1: Get user context & social graph ===
//     const { firstIds, secondIds, thirdIds } = await getSocialGraph(loggedInUserId);

//     let skillIds = [], collegeIds = [], courseIds = [], appliedJobIds = [];

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

//     // Role-based job caps
//     const MAX_JOBS = 
//       userRole === "COMPANY" ? 2 :
//       userRole === "UNIVERSITY" ? 1 :
//       Math.floor(limit * 0.4); // Students: max 40%

//     // === STEP 2: Fetch personalized feed IDs (posts + jobs) ===

// const feedIdQuery = `
//   SELECT * FROM (
//     (
//       SELECT 'post' AS type, fp.id, fp.created_at,
//         (CASE
//           WHEN fp.user_id = ? THEN 110
//           WHEN fp.user_id IN (?) THEN 100
//           WHEN fp.user_id IN (?) THEN 70
//           WHEN fp.user_id IN (?) THEN 40
//           ELSE 20 
//         END) AS score,
//         (CASE
//           WHEN fp.user_id = ? THEN 'own_post'
//           WHEN fp.user_id IN (?) THEN 'followed_user_post'
//           WHEN fp.user_id IN (?) THEN '2nd_degree_post'
//           WHEN fp.user_id IN (?) THEN '3rd_degree_post'
//           ELSE 'other_post'
//         END) AS reason,
//         RAND() AS rand
//       FROM feed_posts fp
//       WHERE fp.user_id = ? 
//          OR fp.user_id IN (?)
//          OR fp.user_id IN (?)
//          OR fp.user_id IN (?)
//     )
//     UNION ALL
//     (
//       SELECT 'job' AS type, jp.job_id AS id, jp.created_at,
//         (CASE WHEN crp.user_id = ? THEN 98
//               WHEN crp.user_id IN (?) THEN 95
//               WHEN crp.user_id IN (?) THEN 65
//               WHEN crp.user_id IN (?) THEN 35
//               ELSE 0 END +
//          CASE WHEN jp.job_id IN (?) THEN 85 ELSE 0 END +
//          CASE WHEN EXISTS (SELECT 1 FROM job_post_skills jps WHERE jps.job_post_id = jp.job_id AND jps.skill_id IN (?)) THEN 80 ELSE 0 END +
//          CASE WHEN EXISTS (SELECT 1 FROM job_post_colleges jpc WHERE jpc.job_post_id = jp.job_id AND jpc.college_id IN (?)) THEN 75 ELSE 0 END +
//          CASE WHEN EXISTS (SELECT 1 FROM job_post_courses jpc WHERE jpc.job_post_id = jp.job_id AND jpc.course_id IN (?)) THEN 70 ELSE 0 END +
//          10
//         ) AS score,
//         (CASE
//           WHEN crp.user_id = ? THEN 'self_company_job'
//           WHEN crp.user_id IN (?) THEN 'followed_company_job'
//           WHEN jp.job_id IN (?) THEN 'applied_job'
//           WHEN EXISTS (SELECT 1 FROM job_post_skills jps WHERE jps.job_post_id = jp.job_id AND jps.skill_id IN (?)) THEN 'skill_match'
//           WHEN EXISTS (SELECT 1 FROM job_post_colleges jpc WHERE jpc.job_post_id = jp.job_id AND jpc.college_id IN (?)) THEN 'college_match'
//           WHEN EXISTS (SELECT 1 FROM job_post_courses jpc WHERE jpc.job_post_id = jp.job_id AND jpc.course_id IN (?)) THEN 'course_match'
//           ELSE 'generic_job'
//         END) AS reason,
//         RAND() AS rand
//       FROM job_posts jp
//       INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
//       WHERE jp.active_status = 1 AND jp.payment_type = 'free'
//     )
//   ) AS combined
//   WHERE 
//     (score < ?) 
//     OR (score = ? AND created_at < ?) 
//     OR (score = ? AND created_at = ? AND rand < ?)
//   ORDER BY score DESC, created_at DESC, rand DESC
//   LIMIT ?
// `;

//     const idParams = [
//       // Post scoring (9x)
//       loggedInUserId,
//       firstIds.length ? firstIds : [0],
//       secondIds.length ? secondIds : [0],
//       thirdIds.length ? thirdIds : [0],
//       loggedInUserId,
//       firstIds.length ? firstIds : [0],
//       secondIds.length ? secondIds : [0],
//       thirdIds.length ? thirdIds : [0],
//       loggedInUserId,
//       firstIds.length ? firstIds : [0],
//       secondIds.length ? secondIds : [0],
//       thirdIds.length ? thirdIds : [0],

//       // Job scoring (9x)
//       loggedInUserId,
//       firstIds.length ? firstIds : [0],
//       secondIds.length ? secondIds : [0],
//       thirdIds.length ? thirdIds : [0],
//       safeArray(appliedJobIds),
//       safeArray(skillIds),
//       safeArray(collegeIds),
//       safeArray(courseIds),

//       // Job reason (6x)
//       loggedInUserId,
//       firstIds.length ? firstIds : [0],
//       safeArray(appliedJobIds),
//       safeArray(skillIds),
//       safeArray(collegeIds),
//       safeArray(courseIds),

//       // Cursor conditions (6 params)
// lastScore,
//   lastScore,
//   lastCreatedAt,   // Sequelize handles Date → string
//   lastScore,
//   lastCreatedAt,
//   lastRand,
// // Limit
// limit + 10,
//     ];

//     const idResults = await sequelize.query(feedIdQuery, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: idParams,
//     });

    

//     // === STEP 3: Fetch full objects ===
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
//                   { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile", attributes: ["logo_url"] },
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
//                 // as: "CompanyRecruiterProfile",
//                 include: [
//                   {
//                     model: User,
//                     as: "user",
//                     attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//                     include: [
//                       { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
//                       { model: CompanyRecruiterProfile, attributes: ["logo_url"] },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           })
//         : Promise.resolve([]),
//     ]);

//     const postMap = Object.fromEntries(feedPosts.map(p => [p.id, p]));
//     const jobMap = Object.fromEntries(jobPosts.map(j => [j.job_id, j]));

//     // Reconstruct ordered + enriched items
//     const rawItems = idResults.map(item => {
//       if (item.type === 'post') {
//         const post = postMap[item.id];
//         if (post) {
//           const data = post.toJSON();
//           data.feed_type = 'post';
//           data._score = parseFloat(item.score);
//           data._reason = item.reason;
//           return data;
//         }
//       } else if (item.type === 'job') {
//         const job = jobMap[item.id];
//         if (job) {
//           const user = job.CompanyRecruiterProfile?.user;
//           return {
//             id: job.job_id,
//             feed_type: 'job',
//             caption: job.job_description?.substring(0, 300) + (job.job_description?.length > 300 ? "…" : "") || "Job opportunity",
//             image: null,
//             like_count: 0,
//             comment_count: 0,
//             created_at: job.created_at,
//             updated_at: job.updated_at,
//             User: user
//               ? {
//                   id: user.id,
//                   first_name: user.first_name,
//                   last_name: user.last_name,
//                   user_role: "COMPANY",
//                   uuid: user.uuid,
//                   CompanyRecruiterProfile: { logo_url: user.CompanyRecruiterProfile?.logo_url || null },
//                 }
//               : { id: 0, first_name: "Company", last_name: "", user_role: "COMPANY", uuid: "" },
//             job:{
//               job_id: job.job_id,
//               opportunity_type: job.opportunity_type,
//               stipend_min: job.stipend_min,
//               stipend_max: job.stipend_max,
//               job_role_id: job.job_role_id,
//             },
//             comments: [],
//             _score: parseFloat(item.score),
//             _reason: item.reason,
//           };
//         }
//       }
//       return null;
//     }).filter(Boolean);

//     // === STEP 4: Enrich with likes, follows, comments (your existing logic) ===
//     const enrichedItems = await Promise.all(
//       rawItems.map(async (item) => {
//         // Profile pic
//         if (item.User.user_role === "COMPANY") {
//           item.User.profile_pic = item.User.CompanyRecruiterProfile?.logo_url || null;
//         } else if (item.User.user_role === "UNIVERSITY") {
//           item.User.profile_pic = item.User.UniversityDetail?.university_logo_url || null;
//         } else {
//           item.User.profile_pic = item.User.UserDetail?.user_profile_pic || null;
//         }

//         // Cleanup
//         delete item.User.UserDetail;
//         delete item.User.CompanyRecruiterProfile;
//         delete item.User.UniversityDetail;

//         // Commenter IDs
//         const comments = item.comments || [];
//         item._commenteruser_ids = comments.map(c => parseInt(c.user_id)).filter(Boolean);

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
//           where: { follower_id: loggedInUserId, followed_id: item.User.id },
//         });
//         item.User.isFollowing = !!isFollowing;

//         // Debug info (opt-in)
//         if (showDebug) {
//           const degree = 
//             item.User.id === loggedInUserId ? "self" :
//             firstIds.includes(item.User.id) ? "1st" :
//             secondIds.includes(item.User.id) ? "2nd" :
//             thirdIds.includes(item.User.id) ? "3rd" : "other";

//           item.__debug = {
//             feed_type: item.feed_type,
//             relevance_score: item._score,
//             reason: item._reason,
//             user_degree: degree,
//           };
//         }

//         delete item._score;
//         delete item._reason;
//         return item;
//       })
//     );

//     // === STEP 5: Balance feed (cap jobs, fallback to popular) ===
//     let finalPosts = [];
//     let jobCount = 0;

//     for (const post of enrichedItems) {
//       if (post.feed_type === 'job') {
//         if (jobCount < MAX_JOBS) {
//           finalPosts.push(post);
//           jobCount++;
//         }
//       } else {
//         finalPosts.push(post); // always include posts
//       }
//       if (finalPosts.length >= limit) break;
//     }

//     // Fallback: if too few items, add popular posts
//     if (finalPosts.length < 5 ) {
//       const fallbackLimit = limit - finalPosts.length;
//       const fallbackPosts = await FeedPost.findAll({
//         order: [
//           [sequelize.literal('like_count + comment_count'), 'DESC'],
//           ['created_at', 'DESC']
//         ],
//         limit: fallbackLimit,
//         include: [
//           {
//             model: User,
//             attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//             include: [
//               { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
//               { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile", attributes: ["logo_url"] },
//               { model: UniversityDetail, as: "UniversityDetail", attributes: ["university_logo_url"] },
//             ],
//           },
//           {
//             model: PostComments,
//             as: "comments",
//             attributes: ["id", "user_id", "comment", "created_at", "updated_at", "parent_comment_id"],
//             order: [["created_at", "DESC"]],
//           },
//         ],
//       });

//       // Enrich fallback posts (minimal)
//       const fallbackEnriched = await Promise.all(fallbackPosts.map(async (post) => {
//         const data = post.toJSON();
//         data.feed_type = 'post';
        
//         // Profile pic
//         if (data.User.user_role === "COMPANY") {
//           data.User.profile_pic = data.User.CompanyRecruiterProfile?.logo_url || null;
//         } else if (data.User.user_role === "UNIVERSITY") {
//           data.User.profile_pic = data.User.UniversityDetail?.university_logo_url || null;
//         } else {
//           data.User.profile_pic = data.User.UserDetail?.user_profile_pic || null;
//         }
//         delete data.User.UserDetail;
//         delete data.User.CompanyRecruiterProfile;
//         delete data.User.UniversityDetail;

//         data.User.followersCount = await Follow.count({ where: { followed_id: data.User.id } });
//         data.isLiked = !!(await PostLikes.findOne({ where: { post_id: data.id, user_id: loggedInUserId } }));
//         data.User.isFollowing = !!(await Follow.findOne({ where: { follower_id: loggedInUserId, followed_id: data.User.id } }));
//         data.comments = data.comments || [];
//         return data;
//       }));

//       finalPosts = [...finalPosts, ...fallbackEnriched].slice(0, limit);
//     }

//     // === STEP 6: Enrich comments (same as your original logic) ===
//     const allCommenteruser_ids = Array.from(
//       new Set(finalPosts.flatMap(p => (p.feed_type === 'post' ? p._commenteruser_ids : [])))
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

//     finalPosts.forEach(post => {
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

//     // === Return ===
//     // Generate nextCursor from last item
// let nextCursor = null;
// if (finalPosts.length > 0) {
//   const lastItem = finalPosts[finalPosts.length - 1];
//   // Find original score/time/rand from idResults (match by id + type)
//   const original = idResults.find(i => 
//     (i.type === 'post' && i.id == lastItem.id) || 
//     (i.type === 'job' && i.id == lastItem.id)
//   );
//   if (original) {
//     nextCursor = `${original.score}:${encodeURIComponent(original.created_at)}:${original.rand}`;

//   }
// }

// return res.status(200).json({
//   success: true,
//   posts: finalPosts, // or keep "posts" if frontend expects it
//   pagination: {
//     hasNextPage: finalPosts.length >= limit,
//     nextCursor, // string or null
//   }
// });

//   } catch (error) {
//     console.error('Error fetching personalized feed:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = { getFeed };



























































const db = require("../models");
const {
  sequelize,
  User,
  UserDetail,
  Follow,
  FeedPost,
  JobPost,
  CompanyRecruiterProfile,
  UserSkill,
  Education,
  Application,
  PostComments,
  PostLikes,
  UniversityDetail,
} = db;

const {Op} =require("sequelize");
const MAX_FOLLOWED_IDS = 1500;

// Helper: safe array for SQL IN
const safeArray = (arr) => arr.length ? arr : [0];

// Fetch 1st, 2nd, 3rd-degree connections
const getSocialGraph = async (userId) => {
  // 1st-degree: direct follows
  const firstDegree = await Follow.findAll({
    where: { follower_id: userId },
    attributes: ["followed_id"],
    raw: true,
    limit: MAX_FOLLOWED_IDS,
  });
  const firstIds = firstDegree.map(r => r.followed_id);

  // 2nd-degree: followed by your follows (friends of friends)
  let secondIds = [];
  if (firstIds.length > 0) {
    const secondRaw = await sequelize.query(`
      SELECT DISTINCT f2.followed_id
      FROM follows f1
      INNER JOIN follows f2 ON f1.followed_id = f2.follower_id
      WHERE f1.follower_id = ?
        AND f2.followed_id != ?
        AND f2.followed_id NOT IN (?)
      LIMIT 200
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: [userId, userId, firstIds.length ? firstIds : [0]]
    });
    secondIds = secondRaw.map(r => r.followed_id);
  }

  // 3rd-degree: followed by 2nd-degree (optional, capped)
  let thirdIds = [];
  if (secondIds.length > 0) {
    const thirdRaw = await sequelize.query(`
      SELECT DISTINCT f3.followed_id
      FROM follows f2
      INNER JOIN follows f3 ON f2.followed_id = f3.follower_id
      WHERE f2.follower_id IN (?)
        AND f3.followed_id != ?
        AND f3.followed_id NOT IN (?)
      LIMIT 200
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: [
        secondIds.length ? secondIds : [0],
        userId,
        [...firstIds, ...secondIds].length ? [...firstIds, ...secondIds] : [0]
      ]
    });
    thirdIds = thirdRaw.map(r => r.followed_id);
  }

  return { firstIds, secondIds, thirdIds };
};

const getFeed = async (req, res) => {
  try {
    const { cursor, limit: limitStr, debug } = req.query;
    const limit = parseInt(limitStr) || 20; // Increased default for better UX

    // Parse cursor: "score:timestamp_ms:type_id:rand_seed"
    // Example: "100:1672531200000:post_123:0.789"
    let lastScore = null;
    let lastTimestamp = null;
    let lastSeenId = null;
    let seenIds = new Set(); // Track all seen items to prevent duplicates

    if (cursor && typeof cursor === 'string') {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const parts = decoded.split('|');
        
        if (parts.length >= 4) {
          lastScore = parseFloat(parts[0]);
          lastTimestamp = parseInt(parts[1]);
          lastSeenId = parts[2];
          
          // Decode seen IDs (format: "post_1,post_2,job_3")
          if (parts[3]) {
            parts[3].split(',').forEach(id => seenIds.add(id));
          }
        }
      } catch (e) {
        console.error('Invalid cursor format:', e);
        // Continue with fresh feed
      }
    }

    const showDebug = debug === "1";

    const loggedInUserId = req.user?.id;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: user not found in token" });
    }
    const userRole = req.user.role;

    // === STEP 1: Get user context & social graph ===
    const { firstIds, secondIds, thirdIds } = await getSocialGraph(loggedInUserId);

    let skillIds = [], collegeIds = [], courseIds = [], appliedJobIds = [];

    if (userRole === "STUDENT") {
      const userDetail = await UserDetail.findOne({
        where: { user_id: loggedInUserId },
        attributes: ["id"],
      });

      if (userDetail) {
        const educations = await Education.findAll({
          where: { user_detail_id: userDetail.id },
          attributes: ["school_college_id", "course_id"],
          raw: true,
        });
        collegeIds = [...new Set(educations.map(e => e.school_college_id).filter(Boolean))];
        courseIds = [...new Set(educations.map(e => e.course_id).filter(Boolean))];
      }

      const [skills, applications] = await Promise.all([
        UserSkill.findAll({ where: { user_id: loggedInUserId }, attributes: ["skill_id"], raw: true }),
        Application.findAll({ where: { user_id: loggedInUserId }, attributes: ["job_post_id"], raw: true }),
      ]);
      skillIds = skills.map(s => s.skill_id);
      appliedJobIds = applications.map(a => a.job_post_id);
    }

    // Role-based job distribution (percentage of feed, not hard cap)
    const JOB_RATIO = 
      userRole === "COMPANY" ? 0.3 : // 30% jobs for companies
      userRole === "UNIVERSITY" ? 0.15 : // 15% jobs for universities
      0.4; // 40% jobs for students

    // Calculate how many items to fetch (overfetch for deduplication)
    const fetchLimit = limit * 2.5;

    // === STEP 2: Fetch personalized feed IDs with stable random seed ===
    // Use MD5(user_id || item_id) for stable but unique-per-user randomization
    const feedIdQuery = `
      SELECT * FROM (
        (
          SELECT 
            'post' AS type, 
            fp.id, 
            UNIX_TIMESTAMP(fp.created_at) * 1000 AS timestamp_ms,
            fp.created_at,
            (CASE
              WHEN fp.user_id = ? THEN 110
              WHEN fp.user_id IN (?) THEN 100
              WHEN fp.user_id IN (?) THEN 70
              WHEN fp.user_id IN (?) THEN 40
              ELSE 20 
            END) AS base_score,
            -- Engagement boost (0-30 points based on like/comment ratio)
            LEAST(30, (fp.like_count * 0.5 + fp.comment_count * 2)) AS engagement_score,
            -- Recency boost (0-20 points, decays over 7 days)
            GREATEST(0, 20 - (TIMESTAMPDIFF(HOUR, fp.created_at, NOW()) / 168 * 20)) AS recency_score,
            (CASE
              WHEN fp.user_id = ? THEN 'own_post'
              WHEN fp.user_id IN (?) THEN 'followed_user_post'
              WHEN fp.user_id IN (?) THEN '2nd_degree_post'
              WHEN fp.user_id IN (?) THEN '3rd_degree_post'
              ELSE 'other_post'
            END) AS reason,
            -- Stable pseudo-random value per user-post pair
            (CONV(SUBSTRING(MD5(CONCAT(?, '_post_', fp.id)), 1, 8), 16, 10) % 10000) / 10000.0 AS stable_rand
          FROM feed_posts fp
          WHERE fp.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ${
              lastScore !== null
                ? `
  AND UNIX_TIMESTAMP(fp.created_at) * 1000 < ${lastTimestamp}
`
                : ""
            }
        )
        UNION ALL
        (
          SELECT 
            'job' AS type, 
            jp.job_id AS id,
            UNIX_TIMESTAMP(jp.created_at) * 1000 AS timestamp_ms,
            jp.created_at,
            (CASE 
              WHEN crp.user_id = ? THEN 98
              WHEN crp.user_id IN (?) THEN 95
              WHEN crp.user_id IN (?) THEN 65
              WHEN crp.user_id IN (?) THEN 35
              ELSE 0 
            END +
            CASE WHEN jp.job_id IN (?) THEN 85 ELSE 0 END +
            CASE WHEN EXISTS (
              SELECT 1 FROM job_post_skills jps 
              WHERE jps.job_post_id = jp.job_id AND jps.skill_id IN (?)
            ) THEN 80 ELSE 0 END +
            CASE WHEN EXISTS (
              SELECT 1 FROM job_post_colleges jpc 
              WHERE jpc.job_post_id = jp.job_id AND jpc.college_id IN (?)
            ) THEN 75 ELSE 0 END +
            CASE WHEN EXISTS (
              SELECT 1 FROM job_post_courses jpc 
              WHERE jpc.job_post_id = jp.job_id AND jpc.course_id IN (?)
            ) THEN 70 ELSE 0 END +
            10) AS base_score,
            0 AS engagement_score,
            GREATEST(0, 15 - (TIMESTAMPDIFF(HOUR, jp.created_at, NOW()) / 168 * 15)) AS recency_score,
            (CASE
              WHEN crp.user_id = ? THEN 'self_company_job'
              WHEN crp.user_id IN (?) THEN 'followed_company_job'
              WHEN jp.job_id IN (?) THEN 'applied_job'
              WHEN EXISTS (
                SELECT 1 FROM job_post_skills jps 
                WHERE jps.job_post_id = jp.job_id AND jps.skill_id IN (?)
              ) THEN 'skill_match'
              WHEN EXISTS (
                SELECT 1 FROM job_post_colleges jpc 
                WHERE jpc.job_post_id = jp.job_id AND jpc.college_id IN (?)
              ) THEN 'college_match'
              WHEN EXISTS (
                SELECT 1 FROM job_post_courses jpc 
                WHERE jpc.job_post_id = jp.job_id AND jpc.course_id IN (?)
              ) THEN 'course_match'
              ELSE 'generic_job'
            END) AS reason,
            (CONV(SUBSTRING(MD5(CONCAT(?, '_job_', jp.job_id)), 1, 8), 16, 10) % 10000) / 10000.0 AS stable_rand
          FROM job_posts jp
          INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
          WHERE jp.active_status = 1 
            AND jp.payment_type = 'free'
            AND jp.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            ${
              lastScore !== null
                ? `
  AND UNIX_TIMESTAMP(jp.created_at) * 1000 < ${lastTimestamp}
`
                : ""
            }
        )
      ) AS combined
      ORDER BY 
        (base_score + engagement_score + recency_score) DESC,
        timestamp_ms DESC,
        stable_rand DESC
      LIMIT ?
    `;

    const idParams = [
      // Post scoring & reason (9 params)
      loggedInUserId,
      safeArray(firstIds),
      safeArray(secondIds),
      safeArray(thirdIds),
      loggedInUserId,
      safeArray(firstIds),
      safeArray(secondIds),
      safeArray(thirdIds),
      loggedInUserId, // for stable_rand

      // Job scoring (8 params)
      loggedInUserId,
      safeArray(firstIds),
      safeArray(secondIds),
      safeArray(thirdIds),
      safeArray(appliedJobIds),
      safeArray(skillIds),
      safeArray(collegeIds),
      safeArray(courseIds),

      // Job reason (6 params)
      loggedInUserId,
      safeArray(firstIds),
      safeArray(appliedJobIds),
      safeArray(skillIds),
      safeArray(collegeIds),
      safeArray(courseIds),
      loggedInUserId, // for stable_rand

      // Limit
      Math.ceil(fetchLimit),
    ];

    const idResults = await sequelize.query(feedIdQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: idParams,
    });

    // === STEP 3: Deduplicate and interleave posts/jobs ===
    const interleavedItems = [];
    const postQueue = [];
    const jobQueue = [];

    // Separate and deduplicate
    for (const item of idResults) {
      const itemKey = `${item.type}_${item.id}`;
      
      // Skip if already seen (from cursor)
      if (seenIds.has(itemKey)) continue;
      
      if (item.type === 'post') {
        postQueue.push(item);
      } else {
        jobQueue.push(item);
      }
    }

    // Interleave based on JOB_RATIO
    let postIdx = 0, jobIdx = 0;
    const targetJobCount = Math.ceil(limit * JOB_RATIO);
    let jobsAdded = 0;

    while (interleavedItems.length < limit && (postIdx < postQueue.length || jobIdx < jobQueue.length)) {
      // Decide whether to add job or post
      const shouldAddJob = 
        jobIdx < jobQueue.length && 
        jobsAdded < targetJobCount &&
        (postIdx >= postQueue.length || interleavedItems.length % Math.ceil(1 / JOB_RATIO) === 0);

      if (shouldAddJob) {
        interleavedItems.push(jobQueue[jobIdx]);
        seenIds.add(`job_${jobQueue[jobIdx].id}`);
        jobIdx++;
        jobsAdded++;
      } else if (postIdx < postQueue.length) {
        interleavedItems.push(postQueue[postIdx]);
        seenIds.add(`post_${postQueue[postIdx].id}`);
        postIdx++;
      } else {
        break;
      }
    }

    // === STEP 4: Fetch full objects ===
    const postIds = interleavedItems.filter(i => i.type === 'post').map(i => i.id);
    const jobIds = interleavedItems.filter(i => i.type === 'job').map(i => i.id);

    const [feedPosts, jobPosts] = await Promise.all([
      postIds.length
        ? FeedPost.findAll({
            where: { id: postIds },
            include: [
              {
                model: User,
                attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
                include: [
                  { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
                  { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile", attributes: ["logo_url"] },
                  { model: UniversityDetail, as: "UniversityDetail", attributes: ["university_logo_url"] },
                ],
              },
              {
                model: PostComments,
                as: "comments",
                attributes: ["id", "user_id", "comment", "created_at", "updated_at", "parent_comment_id"],
                limit: 3, // Only fetch top 3 comments for performance
                order: [["created_at", "DESC"]],
              },
            ],
          })
        : [],

      jobIds.length
        ? JobPost.findAll({
            where: { job_id: jobIds },
            include: [
              {
                model: CompanyRecruiterProfile,
                include: [
                  {
                    model: User,
                    as: "user",
                    attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
                    include: [
                      { model: UserDetail, as: "UserDetail", attributes: ["user_profile_pic"] },
                      { model: CompanyRecruiterProfile, attributes: ["logo_url"] },
                    ],
                  },
                ],
              },
            ],
          })
        : [],
    ]);

    const postMap = Object.fromEntries(feedPosts.map(p => [p.id, p]));
    const jobMap = Object.fromEntries(jobPosts.map(j => [j.job_id, j]));

    // === STEP 5: Reconstruct ordered items ===
    const orderedItems = interleavedItems.map(item => {
      const totalScore = (item.base_score || 0) + (item.engagement_score || 0) + (item.recency_score || 0);
      
      if (item.type === 'post') {
        const post = postMap[item.id];
        if (!post) return null;
        
        const data = post.toJSON();
        data.feed_type = 'post';
        data._score = totalScore;
        data._reason = item.reason;
        data._timestamp = item.timestamp_ms;
        data._stable_rand = item.stable_rand;
        return data;
      } else if (item.type === 'job') {
        const job = jobMap[item.id];
        if (!job) return null;
        
        const user = job.CompanyRecruiterProfile?.user;
        return {
          id: job.job_id,
          feed_type: 'job',
          caption: job.job_description?.substring(0, 300) + (job.job_description?.length > 300 ? "…" : "") || "Job opportunity",
          image: null,
          like_count: 0,
          comment_count: 0,
          created_at: job.created_at,
          updated_at: job.updated_at,
          User: user
            ? {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                user_role: "COMPANY",
                uuid: user.uuid,
                CompanyRecruiterProfile: { logo_url: user.CompanyRecruiterProfile?.logo_url || null },
              }
            : { id: 0, first_name: "Company", last_name: "", user_role: "COMPANY", uuid: "" },
          job: {
            job_id: job.job_id,
            opportunity_type: job.opportunity_type,
            stipend_min: job.stipend_min,
            stipend_max: job.stipend_max,
            job_role_id: job.job_role_id,
          },
          comments: [],
          _score: totalScore,
          _reason: item.reason,
          _timestamp: item.timestamp_ms,
          _stable_rand: item.stable_rand,
        };
      }
      return null;
    }).filter(Boolean);

    // === STEP 6: Fallback to popular content if insufficient ===
    let finalPosts = orderedItems;

    if (finalPosts.length < Math.min(10, limit)) {
      // Only apply fallback on first page
      const neededCount = limit - finalPosts.length;
      const existingIds = new Set(finalPosts.filter(p => p.feed_type === 'post').map(p => p.id));

      const popularPosts = await FeedPost.findAll({
        where: {
          id: {
            [Op.notIn]: existingIds.size > 0 ? Array.from(existingIds) : [0],
          },
          created_at: {
            [Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 7 DAY)"),
          },
        },
        order: [
          [sequelize.literal("(like_count * 2 + comment_count * 3)"), "DESC"],
          ["created_at", "DESC"],
        ],
        limit: neededCount,
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
            include: [
              {
                model: UserDetail,
                as: "UserDetail",
                attributes: ["user_profile_pic"],
              },
              {
                model: CompanyRecruiterProfile,
                as: "CompanyRecruiterProfile",
                attributes: ["logo_url"],
              },
              {
                model: UniversityDetail,
                as: "UniversityDetail",
                attributes: ["university_logo_url"],
              },
            ],
          },
          {
            model: PostComments,
            as: "comments",
            attributes: [
              "id",
              "user_id",
              "comment",
              "created_at",
              "updated_at",
              "parent_comment_id",
            ],
            limit: 3,
            order: [["created_at", "DESC"]],
          },
        ],
      });

      const fallbackItems = popularPosts.map(post => {
        const data = post.toJSON();
        data.feed_type = 'post';
        data._score = 10; // Low score for fallback
        data._reason = 'popular_fallback';
        data._timestamp = new Date(data.created_at).getTime();
        data._stable_rand = 0;
        return data;
      });

      finalPosts = [...finalPosts, ...fallbackItems];
    }

    // === STEP 7: Enrich with user interactions (batch optimize) ===
    const postIdsForEnrich = finalPosts.filter(p => p.feed_type === 'post').map(p => p.id);
    const userIdsForEnrich = [...new Set(finalPosts.map(p => p.User?.id).filter(Boolean))];

    // Batch fetch likes and follows
    const [likedPosts, followedUsers, followerCounts] = await Promise.all([
      postIdsForEnrich.length > 0
        ? PostLikes.findAll({
            where: { post_id: postIdsForEnrich, user_id: loggedInUserId },
            attributes: ['post_id'],
            raw: true
          })
        : Promise.resolve([]),
      
      userIdsForEnrich.length > 0
        ? Follow.findAll({
            where: { follower_id: loggedInUserId, followed_id: userIdsForEnrich },
            attributes: ['followed_id'],
            raw: true
          })
        : Promise.resolve([]),
      
      userIdsForEnrich.length > 0
        ? Follow.findAll({
            where: { followed_id: userIdsForEnrich },
            attributes: [
              'followed_id',
              [sequelize.fn('COUNT', sequelize.col('follower_id')), 'count']
            ],
            group: ['followed_id'],
            raw: true
          })
        : Promise.resolve([])
    ]);

    const likedPostIds = new Set(likedPosts.map(l => l.post_id));
    const followedUserIds = new Set(followedUsers.map(f => f.followed_id));
    const followerCountMap = Object.fromEntries(
      followerCounts.map(f => [f.followed_id, parseInt(f.count)])
    );

    // Enrich items
    finalPosts = finalPosts.map(item => {
      // Profile pic
      if (item.User.user_role === "COMPANY") {
        item.User.profile_pic = item.User.CompanyRecruiterProfile?.logo_url || null;
      } else if (item.User.user_role === "UNIVERSITY") {
        item.User.profile_pic = item.User.UniversityDetail?.university_logo_url || null;
      } else {
        item.User.profile_pic = item.User.UserDetail?.user_profile_pic || null;
      }

      delete item.User.UserDetail;
      delete item.User.CompanyRecruiterProfile;
      delete item.User.UniversityDetail;

      // Add interaction flags
      item.isLiked = likedPostIds.has(item.id);
      item.User.isFollowing = followedUserIds.has(item.User.id);
      item.User.followersCount = followerCountMap[item.User.id] || 0;

      // Debug info
      if (showDebug) {
        const degree = 
          item.User.id === loggedInUserId ? "self" :
          firstIds.includes(item.User.id) ? "1st" :
          secondIds.includes(item.User.id) ? "2nd" :
          thirdIds.includes(item.User.id) ? "3rd" : "other";

        item.__debug = {
          feed_type: item.feed_type,
          relevance_score: item._score,
          reason: item._reason,
          user_degree: degree,
        };
      }

      return item;
    });

    // === STEP 8: Enrich comments (batch fetch commenters) ===
    const commenterIds = [
      ...new Set(
        finalPosts
          .filter(p => p.feed_type === 'post')
          .flatMap(p => (p.comments || []).map(c => c.user_id))
          .filter(Boolean)
      )
    ];

    let commenterMap = {};
    if (commenterIds.length > 0) {
      const commenters = await User.findAll({
        where: { id: commenterIds },
        attributes: ['id', 'first_name', 'last_name', 'user_role', 'uuid'],
        include: [
          { model: UserDetail, as: 'UserDetail', attributes: ['user_profile_pic'] },
          { model: CompanyRecruiterProfile, as: 'CompanyRecruiterProfile', attributes: ['logo_url'] }
        ]
      });

      commenterMap = Object.fromEntries(
        commenters.map(u => {
          const profilePic = u.user_role === 'COMPANY'
            ? u.CompanyRecruiterProfile?.logo_url || null
            : u.UserDetail?.user_profile_pic || null;
          
          return [
            u.id,
            {
              first_name: u.first_name,
              last_name: u.last_name,
              profile_pic: profilePic,
              uuid: u.uuid
            }
          ];
        })
      );
    }

    // Attach commenter info
    finalPosts.forEach(post => {
      if (post.feed_type === 'post' && Array.isArray(post.comments)) {
        post.comments = post.comments.map(comment => ({
          ...comment,
          ...(commenterMap[comment.user_id] || {
            first_name: null,
            last_name: null,
            profile_pic: null,
            uuid: null
          })
        }));
      }
    });

    // === STEP 9: Generate next cursor ===
    let nextCursor = null;
    if (finalPosts.length >= limit) {
      const lastItem = finalPosts[finalPosts.length - 1];
      
      // Encode: score|timestamp|lastId|seenIds
      const cursorData = [
        lastItem._score,
        lastItem._timestamp,
        `${lastItem.feed_type}_${lastItem.id}`,
        Array.from(seenIds).join(',')
      ].join('|');
      
      nextCursor = Buffer.from(cursorData).toString('base64');
    }

    // Clean up internal fields
    finalPosts.forEach(post => {
      delete post._score;
      delete post._reason;
      delete post._timestamp;
      delete post._stable_rand;
    });

    return res.status(200).json({
      success: true,
      posts: finalPosts,
      pagination: {
        hasNextPage: finalPosts.length >= limit,
        nextCursor,
        count: finalPosts.length,
        jobCount: finalPosts.filter(p => p.feed_type === 'job').length,
        postCount: finalPosts.filter(p => p.feed_type === 'post').length,
      }
    });

  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getFeed };