const {
  User,
  UserDetail,
  CompanyRecruiterProfile,
  FeedPost,
  UniversityDetail,
  Follow,
  Application,
  JobPost,
  Experience,
  UserSkill,
  Education,
  Course,
  SchoolCollege,
  Skill,
  PostLikes,
  PostComments,
  Location,
  AccessScope
} = require("../models");

const { Op, sequelize, fn, col, literal, Sequelize, where, } = require('sequelize');


const crypto=require("crypto");
// create feed
const createFeedPost = async (req, res) => {
  try {
    const {  caption, image } = req.body;
    let user_id;

    if (req.user.role === 'COMPANY') {
  const scope = await AccessScope.findByPk(req.user.scopeId);
  
  if (!scope || scope.scope_type !== 'COMPANY') {
    return res.status(400).json({ message: "No active company scope" });
  }

  const companyProfile = await CompanyRecruiterProfile.findByPk(scope.scope_id);
  if (!companyProfile) {
    return res.status(400).json({ message: "Company profile not found" });
  }

  user_id = companyProfile.user_id;
} else {
  user_id = req.user.id;
}

     

    // Fetch user with detail
    const user = await User.findOne({
      where: { id: user_id },
      include: [
        { model: UserDetail, as: "UserDetail" },
        { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
        {
          model: UniversityDetail,
          as: "UniversityDetail",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user_role = user.user_role;
    let profile_pic = null;

    if (user_role === 'COMPANY') {
      profile_pic = user.CompanyRecruiterProfile ? user.CompanyRecruiterProfile.logo_url : null;
    } else if(user_role === "UNIVERSITY"){
      profile_pic = user.UniversityDetail ? user.UniversityDetail.university_logo_url : null;
    }
     else {
      profile_pic = user.UserDetail ? user.UserDetail.user_profile_pic : null;
    }

    const feedPost = await FeedPost.create({
      user_id,
      image: image || null,
      caption,
      user_role,
      profile_pic,
    });


    return res.status(201).json({ message: 'Feed post created successfully', feedPost });
  } catch (error) {
    console.error('Error creating feed post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// get all feed post
const getFeedPosts = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Get user_id from JWT (set by authMiddleware)
    const loggedInuser_id = req.user && req.user.id;
    if (!loggedInuser_id) {
      return res.status(401).json({ message: "Unauthorized: user not found in token" });
    }

    const { count, rows: rawPosts } = await FeedPost.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit,
      offset,
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
          order: [["created_at", "DESC"]],
        },
      ],
    });

    const posts = await Promise.all(rawPosts.map(async post => {
      const postData = post.toJSON();
      // console.log("this is the post data", postData)

      // Attach user profile_pic
      if (postData.User.user_role === "COMPANY") {
        postData.User.profile_pic =
          postData.User.CompanyRecruiterProfile?.logo_url || null;
      } else if (postData.User.user_role === "UNIVERSITY") {
        postData.User.profile_pic =
          postData.User.UniversityDetail?.university_logo_url || null;
      } else {
        postData.User.profile_pic =
          postData.User.UserDetail?.user_profile_pic || null;
      }

      // Remove nested models
      delete postData.User.UserDetail;
      delete postData.User.CompanyRecruiterProfile;

      const comments = postData.comments || [];

      // Collect commenter user_ids
      postData._commenteruser_ids = comments
        .map(c => parseInt(c.user_id))
        .filter(Boolean);


      // Get followers count
      const followersCount = await Follow.count({
        where: { followed_id: postData.User.id },
      });
      postData.User.followersCount = followersCount;

      // Check if logged-in user has liked this post
      const liked = await PostLikes.findOne({
        where: { post_id: postData.id, user_id: loggedInuser_id },
      });
      postData.isLiked = !!liked;

      // Check if logged-in user is following the post author
      const isFollowing = await Follow.findOne({
        where: {
          follower_id: loggedInuser_id,
          followed_id: postData.User.id,
        },
      });
      postData.User.isFollowing = !!isFollowing; //true if following false otherwise

      return postData;
    }));

    // Batch fetch all unique commenter user_ids across all posts
    const allCommenteruser_ids = Array.from(new Set(posts.flatMap(p => p._commenteruser_ids)));
    let commenterUserMap = {};
    if (allCommenteruser_ids.length > 0) {
      const commenters = await User.findAll({
        where: { id: allCommenteruser_ids },
        attributes: ['id', 'first_name', 'last_name', 'user_role','uuid'],
        include: [
          { model: UserDetail, as: 'UserDetail', attributes: ['user_profile_pic'] },
          { model: CompanyRecruiterProfile, as: 'CompanyRecruiterProfile', attributes: ['logo_url'] }
        ]
      });
      commenterUserMap = Object.fromEntries(commenters.map(u => {
        let profile_pic = null;
        if (u.user_role === 'COMPANY') {
          profile_pic = u.CompanyRecruiterProfile?.logo_url || null;
        } else {
          profile_pic = u.UserDetail?.user_profile_pic || null;
        }
        return [u.id, {
          first_name: u.first_name,
          last_name: u.last_name,
          profile_pic,
          uuid:u.uuid
        }];
      }));
    }

    // Enrich comments with user info
    posts.forEach(post => {
      post.comments = post.comments.map(comment => {
        const userInfo = commenterUserMap[parseInt(comment.user_id)] || {};
        return {
          ...comment,
          first_name: userInfo.first_name || null,
          last_name: userInfo.last_name || null,
          profile_pic: userInfo.profile_pic || null,
          uuid:userInfo.uuid
        };
      });
      delete post._commenteruser_ids; // cleanup
    });

    return res.status(200).json({
      totalPosts: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      posts,
    });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const editFeedPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, image } = req.body;
    const loggedInUserId = req.user?.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found in token",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await FeedPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Feed post not found",
      });
    }

    if (post.user_id !== loggedInUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only edit your own posts",
      });
    }

    // Only update allowed fields
    await post.update({
      caption: caption ?? post.caption,
      image: image ?? post.image,
    });

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: {
        id: post.id,
        caption: post.caption,
        image: post.image,
        updated_at: post.updated_at,
      },
    });
  } catch (error) {
    console.error("Error editing feed post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const getFeedPosts = async (req, res) => {
//   try {
//     const studentUserId = req.user.id;
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;
//     const limitForScoring = limit * 3; // over-fetch for scoring

//     // ==============================
//     // STEP 1: Get relevant user IDs with weights
//     // ==============================

//     // 1. Followed users
//     const followedRows = await Follow.findAll({
//       where: { follower_id: studentUserId },
//       attributes: ["followed_id"],
//       raw: true,
//     });
//     const followedIds = followedRows.map((r) => r.followed_id);

//     // 2. Companies applied to
//     const applications = await Application.findAll({
//       where: { user_id: studentUserId },
//       include: [
//         {
//           model: JobPost,
//           as: "jobPost",
//           include: [
//             {
//               model: CompanyRecruiterProfile,
//               attributes: ["user_id"],
//             },
//           ],
//           attributes: [],
//         },
//       ],
//       attributes: [],
//       raw: true,
//     });
//     const appliedCompanyIds = [
//       ...new Set(
//         applications
//           .map((a) => a["jobPost.CompanyRecruiterProfile.user_id"])
//           .filter(Boolean)
//       ),
//     ];

//     // 3. Companies from experience
//     const userDetail = await UserDetail.findOne({
//       where: { user_id: studentUserId },
//       attributes: ["id"],
//     });
//     let experienceCompanyIds = [];
//     if (userDetail) {
//       const experiences = await Experience.findAll({
//         where: { user_detail_id: userDetail.id },
//         include: [
//           {
//             model: CompanyRecruiterProfile,
//             as: "companyRecruiterProfile",
//             attributes: ["user_id"],
//           },
//         ],
//         attributes: [],
//         raw: true,
//       });
//       experienceCompanyIds = [
//         ...new Set(
//           experiences
//             .map((e) => e["companyRecruiterProfile.user_id"])
//             .filter(Boolean)
//         ),
//       ];
//     }

//     // 4. Skill-matched companies
//     const userSkills = await UserSkill.findAll({
//       where: { user_id: studentUserId },
//       attributes: ["skill_id"],
//       raw: true,
//     });
//     let skillMatchedCompanyIds = [];
//     if (userSkills.length > 0) {
//       const skillIds = userSkills.map((s) => s.skill_id);
//       const jobPostsBySkill = await JobPost.findAll({
//         include: [
//           {
//             model: Skill,
//             as: "skills",
//             where: { skill_id: skillIds },
//             attributes: [],
//           },
//           {
//             model: CompanyRecruiterProfile,
//             attributes: ["user_id"],
//           },
//         ],
//         attributes: [],
//         raw: true,
//       });
//       skillMatchedCompanyIds = [
//         ...new Set(
//           jobPostsBySkill
//             .map((j) => j["CompanyRecruiterProfile.user_id"])
//             .filter(Boolean)
//         ),
//       ];
//     }

//     // 5. Education/college-matched companies
//     let eduMatchedCompanyIds = [];
//     if (userDetail) {
//       const educations = await Education.findAll({
//         where: { user_detail_id: userDetail.id },
//         attributes: ["course_id", "school_college_id"],
//         raw: true,
//       });

//       const courseIds = [
//         ...new Set(educations.map((e) => e.course_id).filter(Boolean)),
//       ];
//       const collegeIds = [
//         ...new Set(educations.map((e) => e.school_college_id).filter(Boolean)),
//       ];

//       let matchedJobPostIds = new Set();

//       if (courseIds.length > 0) {
//         const byCourse = await JobPost.findAll({
//           include: [
//             {
//               model: Course,
//               as: "eligibleCourses",
//               where: { id: courseIds },
//               attributes: [],
//             },
//           ],
//           attributes: ["job_id"],
//           raw: true,
//         });
//         byCourse.forEach((j) => matchedJobPostIds.add(j.job_id));
//       }

//       if (collegeIds.length > 0) {
//         const byCollege = await JobPost.findAll({
//           include: [
//             {
//               model: SchoolCollege,
//               as: "eligibleColleges",
//               where: { id: collegeIds },
//               attributes: [],
//             },
//           ],
//           attributes: ["job_id"],
//           raw: true,
//         });
//         byCollege.forEach((j) => matchedJobPostIds.add(j.job_id));
//       }

//       if (matchedJobPostIds.size > 0) {
//         const jobPosts = await JobPost.findAll({
//           where: { job_id: [...matchedJobPostIds] },
//           include: [
//             {
//               model: CompanyRecruiterProfile,
//               attributes: ["user_id"],
//             },
//           ],
//           attributes: [],
//           raw: true,
//         });
//         eduMatchedCompanyIds = [
//           ...new Set(
//             jobPosts
//               .map((j) => j["CompanyRecruiterProfile.user_id"])
//               .filter(Boolean)
//           ),
//         ];
//       }
//     }

//     // Combine all with weights
//     const weightMap = new Map();
//     const addWeight = (ids, weight) => {
//       ids.forEach((id) => {
//         weightMap.set(id, (weightMap.get(id) || 0) + weight);
//       });
//     };

//     addWeight(followedIds, 100);
//     addWeight(appliedCompanyIds, 90);
//     addWeight(experienceCompanyIds, 80);
//     addWeight(skillMatchedCompanyIds, 70);
//     addWeight(eduMatchedCompanyIds, 60);

//     const relevantUserIds = [...weightMap.keys()];

//     // ==============================
//     // STEP 2: Fetch feed posts
//     // ==============================

//     const whereClause =
//       relevantUserIds.length > 0
//         ? { user_id: relevantUserIds }
//         : { "$User.user_role$": "COMPANY" }; // fallback: only company posts

//     const { count: totalCount, rows: rawPosts } =
//       await FeedPost.findAndCountAll({
//         where: whereClause,
//         order: [["created_at", "DESC"]],
//         limit: limitForScoring,
//         offset: 0,
//         include: [
//           {
//             model: User,
//             attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//             include: [
//               {
//                 model: UserDetail,
//                 as: "UserDetail",
//                 attributes: ["user_profile_pic"],
//               },
//               {
//                 model: CompanyRecruiterProfile,
//                 as: "CompanyRecruiterProfile",
//                 attributes: ["logo_url"],
//               },
//             ],
//           },
//         ],
//       });

//     // Score and sort
//     const scoredPosts = rawPosts
//       .map((post) => {
//         const baseScore = weightMap.get(post.user_id) || 10;
//         const timeScore = new Date(post.created_at).getTime() / 1e10;
//         return { ...post.toJSON(), score: baseScore + timeScore };
//       })
//       .sort((a, b) => b.score - a.score);

//     // Paginate after scoring
//     const paginatedPosts = scoredPosts.slice(offset, offset + limit);

//     // ==============================
//     // STEP 3: Batch enrichment
//     // ==============================

//     const postIds = paginatedPosts.map((p) => p.id);
//     const userIds = paginatedPosts.map((p) => p.User.id);

//     // 1. Likes
//     const likes = await PostLikes.findAll({
//       where: { post_id: postIds, user_id: studentUserId },
//       attributes: ["post_id"],
//       raw: true,
//     });
//     const likedPostIds = new Set(likes.map((l) => l.post_id));

//     // 2. Followers count (batch)
//     const followerCounts = await Follow.findAll({
//       where: { followed_id: userIds },
//       attributes: ["followed_id"],
//       group: ["followed_id"],
//       raw: true,
//       include: [
//         { model: sequelize.fn("COUNT", sequelize.col("id")), as: "count" },
//       ], // Sequelize doesn't support this directly
//     });
//     //  Workaround: use raw query or map
//     // Simpler: accept slight overfetch or use Promise.all (acceptable for <50 posts)
//     const followersCountMap = new Map();
//     for (const userId of userIds) {
//       const count = await Follow.count({ where: { followed_id: userId } });
//       followersCountMap.set(userId, count);
//     }

//     // 3. Comments enrichment (as in your original code)
//     const allCommenterIds = Array.from(
//       new Set(
//         paginatedPosts.flatMap((p) =>
//           (p.comments ? JSON.parse(p.comments) : [])
//             .map((c) => parseInt(c.user_id))
//             .filter(Boolean)
//         )
//       )
//     );

//     let commenterMap = {};
//     if (allCommenterIds.length > 0) {
//       const commenters = await User.findAll({
//         where: { id: allCommenterIds },
//         attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//         include: [
//           {
//             model: UserDetail,
//             as: "UserDetail",
//             attributes: ["user_profile_pic"],
//           },
//           {
//             model: CompanyRecruiterProfile,
//             as: "CompanyRecruiterProfile",
//             attributes: ["logo_url"],
//           },
//         ],
//       });
//       commenterMap = Object.fromEntries(
//         commenters.map((u) => {
//           const pic =
//             u.user_role === "COMPANY"
//               ? u.CompanyRecruiterProfile?.logo_url
//               : u.UserDetail?.user_profile_pic;
//           return [
//             u.id,
//             {
//               first_name: u.first_name,
//               last_name: u.last_name,
//               profile_pic: pic,
//               uuid: u.uuid,
//             },
//           ];
//         })
//       );
//     }

//     // Apply enrichment
//     const finalPosts = paginatedPosts.map((post) => {
//       // Profile pic
//       post.User.profile_pic =
//         post.User.user_role === "COMPANY"
//           ? post.User.CompanyRecruiterProfile?.logo_url
//           : post.User.UserDetail?.user_profile_pic;

//       // Cleanup
//       delete post.User.UserDetail;
//       delete post.User.CompanyRecruiterProfile;

//       // Enrich
//       post.isLiked = likedPostIds.has(post.id);
//       post.User.followersCount = followersCountMap.get(post.User.id) || 0;

//       // Comments
//       post.comments = (post.comments ? JSON.parse(post.comments) : []).map(
//         (c) => ({
//           ...c,
//           ...(commenterMap[c.user_id] || {}),
//         })
//       );

//       return post;
//     });

//     // ==============================
//     // Return response
//     // ==============================
//     return res.status(200).json({
//       totalPosts: scoredPosts.length,
//       currentPage: page,
//       totalPages: Math.ceil(scoredPosts.length / limit),
//       posts: finalPosts,
//     });
//   } catch (error) {
//     console.error("Feed error:", error);
//     return res
//       .status(500)
//       .json({ message: "Failed to load personalized feed" });
//   }
// };

// const getFeedPosts = async (req, res) => {
//   try {
//     const studentUserId = req.user.id;
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;
//     const limitForScoring = limit * 3;

//     // ==============================
//     // STEP 1: Build relevance map with fallbacks
//     // ==============================
//     const weightMap = new Map();

//     const addToWeightMap = (ids, weight) => {
//       if (!Array.isArray(ids)) return;
//       ids.forEach((id) => {
//         if (id) weightMap.set(id, (weightMap.get(id) || 0) + weight);
//       });
//     };

//     // --- 1. Followed users ---
//     try {
//       const followedRows = await Follow.findAll({
//         where: { follower_id: studentUserId },
//         attributes: ["followed_id"],
//         raw: true,
//       });
//       const followedIds = followedRows
//         .map((r) => r.followed_id)
//         .filter((id) => id);
//       addToWeightMap(followedIds, 100);
//     } catch (e) {
//       console.warn("Feed: Error fetching followed users", e.message);
//     }

//     // --- 2. Applied companies ---
//     try {
//       const applications = await Application.findAll({
//         where: { user_id: studentUserId },
//         include: [
//           {
//             model: JobPost,
//             as: "jobPost",
//             include: [
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//           },
//         ],
//         attributes: [],
//         raw: true,
//       });
//       const appliedCompanyIds = applications
//         .map((a) => a["jobPost.CompanyRecruiterProfile.user_id"])
//         .filter((id) => id);
//       addToWeightMap(appliedCompanyIds, 90);
//     } catch (e) {
//       console.warn("Feed: Error fetching applied companies", e.message);
//     }

//     // --- 3. Experience companies ---
//     try {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: studentUserId },
//         attributes: ["id"],
//       });
//       if (userDetail?.id) {
//         const experiences = await Experience.findAll({
//           where: { user_detail_id: userDetail.id },
//           include: [
//             {
//               model: CompanyRecruiterProfile,
//               as: "companyRecruiterProfile",
//               attributes: ["user_id"],
//             },
//           ],
//           attributes: [],
//           raw: true,
//         });
//         const expCompanyIds = experiences
//           .map((e) => e["companyRecruiterProfile.user_id"])
//           .filter((id) => id);
//         addToWeightMap(expCompanyIds, 80);
//       }
//     } catch (e) {
//       console.warn("Feed: Error fetching experience companies", e.message);
//     }

//     // --- 4. Skill-matched companies ---
//     try {
//       const userSkills = await UserSkill.findAll({
//         where: { user_id: studentUserId },
//         attributes: ["skill_id"],
//         raw: true,
//       });
//       if (userSkills.length > 0) {
//         const skillIds = userSkills.map((s) => s.skill_id).filter((id) => id);
//         if (skillIds.length > 0) {
//           const jobPosts = await JobPost.findAll({
//             include: [
//               {
//                 model: Skill,
//                 as: "skills",
//                 where: { skill_id: skillIds },
//                 attributes: [],
//               },
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//             raw: true,
//           });
//           const skillCompanyIds = jobPosts
//             .map((j) => j["CompanyRecruiterProfile.user_id"])
//             .filter((id) => id);
//           addToWeightMap(skillCompanyIds, 70);
//         }
//       }
//     } catch (e) {
//       console.warn("Feed: Error fetching skill-matched companies", e.message);
//     }

//     // --- 5. Education/college-matched companies ---
//     try {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: studentUserId },
//         attributes: ["id"],
//       });
//       if (userDetail?.id) {
//         const educations = await Education.findAll({
//           where: { user_detail_id: userDetail.id },
//           attributes: ["course_id", "school_college_id"],
//           raw: true,
//         });

//         const courseIds = [
//           ...new Set(educations.map((e) => e.course_id).filter(Boolean)),
//         ];
//         const collegeIds = [
//           ...new Set(
//             educations.map((e) => e.school_college_id).filter(Boolean)
//           ),
//         ];

//         let matchedJobPostIds = new Set();

//         if (courseIds.length > 0) {
//           const byCourse = await JobPost.findAll({
//             include: [
//               {
//                 model: Course,
//                 as: "eligibleCourses",
//                 where: { id: courseIds },
//                 attributes: [],
//               },
//             ],
//             attributes: ["job_id"],
//             raw: true,
//           });
//           byCourse.forEach((j) => matchedJobPostIds.add(j.job_id));
//         }

//         if (collegeIds.length > 0) {
//           const byCollege = await JobPost.findAll({
//             include: [
//               {
//                 model: SchoolCollege,
//                 as: "eligibleColleges",
//                 where: { id: collegeIds },
//                 attributes: [],
//               },
//             ],
//             attributes: ["job_id"],
//             raw: true,
//           });
//           byCollege.forEach((j) => matchedJobPostIds.add(j.job_id));
//         }

//         if (matchedJobPostIds.size > 0) {
//           const jobPosts = await JobPost.findAll({
//             where: { job_id: [...matchedJobPostIds] },
//             include: [
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//             raw: true,
//           });
//           const eduCompanyIds = jobPosts
//             .map((j) => j["CompanyRecruiterProfile.user_id"])
//             .filter((id) => id);
//           addToWeightMap(eduCompanyIds, 60);
//         }
//       }
//     } catch (e) {
//       console.warn(
//         "Feed: Error fetching education-matched companies",
//         e.message
//       );
//     }

//     // ==============================
//     // STEP 2: Fetch posts
//     // ==============================
//     const relevantUserIds = [...weightMap.keys()];

//     const whereClause =
//       relevantUserIds.length > 0
//         ? { user_id: relevantUserIds }
//         : { "$User.user_role$": "COMPANY" }; // fallback: only companies

//     const { rows: rawPosts } = await FeedPost.findAndCountAll({
//       where: whereClause,
//       order: [["created_at", "DESC"]],
//       limit: limitForScoring,
//       offset: 0,
//       include: [
//         {
//           model: User,
//           attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//           include: [
//             {
//               model: UserDetail,
//               as: "UserDetail",
//               attributes: ["user_profile_pic"],
//             },
//             {
//               model: CompanyRecruiterProfile,
//               as: "CompanyRecruiterProfile",
//               attributes: ["logo_url"],
//             },
//           ],
//         },
//       ],
//     });

//     // Score posts
//     const scoredPosts = rawPosts
//       .map((post) => {
//         const baseScore =
//           weightMap.get(post.user_id) || (relevantUserIds.length > 0 ? 10 : 50);
//         const timeScore = new Date(post.created_at).getTime() / 1e10;
//         return { ...post.toJSON(), score: baseScore + timeScore };
//       })
//       .sort((a, b) => b.score - a.score);

//     const paginatedPosts = scoredPosts.slice(offset, offset + limit);

//     // ==============================
//     // STEP 3: Batch enrichment (with safety)
//     // ==============================
//     const postIds = paginatedPosts.map((p) => p.id).filter((id) => id);
//     const userIds = paginatedPosts.map((p) => p.User?.id).filter((id) => id);

//     // Likes
//     let likedPostIds = new Set();
//     if (postIds.length > 0) {
//       try {
//         const likes = await PostLikes.findAll({
//           where: { post_id: postIds, user_id: studentUserId },
//           attributes: ["post_id"],
//           raw: true,
//         });
//         likedPostIds = new Set(likes.map((l) => l.post_id));
//       } catch (e) {
//         console.warn("Feed: Error fetching likes", e.message);
//       }
//     }

//     // Followers count (safe batch)
//     const followersCountMap = new Map();
//     for (const userId of userIds) {
//       try {
//         const count = await Follow.count({ where: { followed_id: userId } });
//         followersCountMap.set(userId, count);
//       } catch (e) {
//         followersCountMap.set(userId, 0);
//       }
//     }

//     // Comments
//     let commenterMap = {};
//     try {
//       const allCommenterIds = Array.from(
//         new Set(
//           paginatedPosts.flatMap((p) => {
//             try {
//               const comments = p.comments ? JSON.parse(p.comments) : [];
//               return comments
//                 .map((c) => parseInt(c.user_id))
//                 .filter((id) => id);
//             } catch {
//               return [];
//             }
//           })
//         )
//       ).filter((id) => id);

//       if (allCommenterIds.length > 0) {
//         const commenters = await User.findAll({
//           where: { id: allCommenterIds },
//           attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//           include: [
//             {
//               model: UserDetail,
//               as: "UserDetail",
//               attributes: ["user_profile_pic"],
//             },
//             {
//               model: CompanyRecruiterProfile,
//               as: "CompanyRecruiterProfile",
//               attributes: ["logo_url"],
//             },
//           ],
//         });
//         commenterMap = Object.fromEntries(
//           commenters.map((u) => {
//             const pic =
//               u.user_role === "COMPANY"
//                 ? u.CompanyRecruiterProfile?.logo_url
//                 : u.UserDetail?.user_profile_pic;
//             return [
//               u.id,
//               {
//                 first_name: u.first_name || "",
//                 last_name: u.last_name || "",
//                 profile_pic: pic || null,
//                 uuid: u.uuid || null,
//               },
//             ];
//           })
//         );
//       }
//     } catch (e) {
//       console.warn("Feed: Error enriching comments", e.message);
//     }

//     // Final enrichment
//     const finalPosts = paginatedPosts.map((post) => {
//       // Profile pic
//       let profilePic = null;
//       if (post.User?.user_role === "COMPANY") {
//         profilePic = post.User.CompanyRecruiterProfile?.logo_url || null;
//       } else {
//         profilePic = post.User?.UserDetail?.user_profile_pic || null;
//       }

//       // Clean up
//       delete post.User?.UserDetail;
//       delete post.User?.CompanyRecruiterProfile;

//       return {
//         ...post,
//         User: {
//           ...post.User,
//           profile_pic: profilePic,
//           followersCount: followersCountMap.get(post.User?.id) || 0,
//         },
//         isLiked: likedPostIds.has(post.id),
//         comments: post.comments
//           ? (() => {
//               try {
//                 return JSON.parse(post.comments).map((c) => ({
//                   ...c,
//                   ...(commenterMap[c.user_id] || {}),
//                 }));
//               } catch {
//                 return [];
//               }
//             })()
//           : [],
//       };
//     });

//     // ==============================
//     // Response
//     // ==============================
//     return res.status(200).json({
//       totalPosts: scoredPosts.length,
//       currentPage: page,
//       totalPages: Math.ceil(scoredPosts.length / limit),
//       posts: finalPosts,
//     });
//   } catch (error) {
//     console.error("Critical feed error:", error);
//     return res
//       .status(500)
//       .json({ message: "Unable to load feed. Please try again." });
//   }
// };

//====================================================================================================
//student specific only..
// const getFeedPosts = async (req, res) => {
//   try {
//     const studentUserId = req.user.id;
//     const { page = 1, limit = 20 } = req.query;
//     const offset = (page - 1) * limit;
//     const limitForScoring = limit * 3;

//     // ==============================
//     // STEP 1: Build relevance map with fallbacks
//     // ==============================
//     const weightMap = new Map();

//     const addToWeightMap = (ids, weight) => {
//       if (!Array.isArray(ids)) return;
//       ids.forEach((id) => {
//         if (id) weightMap.set(id, (weightMap.get(id) || 0) + weight);
//       });
//     };

//     // --- 1. Followed users ---
//     try {
//       const followedRows = await Follow.findAll({
//         where: { follower_id: studentUserId },
//         attributes: ["followed_id"],
//         raw: true,
//       });
//       const followedIds = followedRows
//         .map((r) => r.followed_id)
//         .filter((id) => id);
//       addToWeightMap(followedIds, 100);
//     } catch (e) {
//       console.warn("Feed: Error fetching followed users", e.message);
//     }

//     // --- 2. Applied companies ---
//     try {
//       const applications = await Application.findAll({
//         where: { user_id: studentUserId },
//         include: [
//           {
//             model: JobPost,
//             as: "jobPost",
//             include: [
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//           },
//         ],
//         attributes: [],
//         raw: true,
//       });
//       const appliedCompanyIds = applications
//         .map((a) => a["jobPost.CompanyRecruiterProfile.user_id"])
//         .filter((id) => id);
//       addToWeightMap(appliedCompanyIds, 90);
//     } catch (e) {
//       console.warn("Feed: Error fetching applied companies", e.message);
//     }

//     // --- 3. Experience companies ---
//     try {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: studentUserId },
//         attributes: ["id"],
//       });
//       if (userDetail?.id) {
//         const experiences = await Experience.findAll({
//           where: { user_detail_id: userDetail.id },
//           include: [
//             {
//               model: CompanyRecruiterProfile,
//               as: "companyRecruiterProfile",
//               attributes: ["user_id"],
//             },
//           ],
//           attributes: [],
//           raw: true,
//         });
//         const expCompanyIds = experiences
//           .map((e) => e["companyRecruiterProfile.user_id"])
//           .filter((id) => id);
//         addToWeightMap(expCompanyIds, 80);
//       }
//     } catch (e) {
//       console.warn("Feed: Error fetching experience companies", e.message);
//     }

//     // --- 4. Skill-matched companies ---
//     try {
//       const userSkills = await UserSkill.findAll({
//         where: { user_id: studentUserId },
//         attributes: ["skill_id"],
//         raw: true,
//       });
//       if (userSkills.length > 0) {
//         const skillIds = userSkills.map((s) => s.skill_id).filter((id) => id);
//         if (skillIds.length > 0) {
//           const jobPosts = await JobPost.findAll({
//             include: [
//               {
//                 model: Skill,
//                 as: "skills",
//                 where: { skill_id: skillIds },
//                 attributes: [],
//               },
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//             raw: true,
//           });
//           const skillCompanyIds = jobPosts
//             .map((j) => j["CompanyRecruiterProfile.user_id"])
//             .filter((id) => id);
//           addToWeightMap(skillCompanyIds, 70);
//         }
//       }
//     } catch (e) {
//       console.warn("Feed: Error fetching skill-matched companies", e.message);
//     }

//     // --- 5. Education/college-matched companies ---
//     try {
//       const userDetail = await UserDetail.findOne({
//         where: { user_id: studentUserId },
//         attributes: ["id"],
//       });
//       if (userDetail?.id) {
//         const educations = await Education.findAll({
//           where: { user_detail_id: userDetail.id },
//           attributes: ["course_id", "school_college_id"],
//           raw: true,
//         });

//         const courseIds = [
//           ...new Set(educations.map((e) => e.course_id).filter(Boolean)),
//         ];
//         const collegeIds = [
//           ...new Set(
//             educations.map((e) => e.school_college_id).filter(Boolean)
//           ),
//         ];

//         let matchedJobPostIds = new Set();

//         if (courseIds.length > 0) {
//           const byCourse = await JobPost.findAll({
//             include: [
//               {
//                 model: Course,
//                 as: "eligibleCourses",
//                 where: { id: courseIds },
//                 attributes: [],
//               },
//             ],
//             attributes: ["job_id"],
//             raw: true,
//           });
//           byCourse.forEach((j) => matchedJobPostIds.add(j.job_id));
//         }

//         if (collegeIds.length > 0) {
//           const byCollege = await JobPost.findAll({
//             include: [
//               {
//                 model: SchoolCollege,
//                 as: "eligibleColleges",
//                 where: { id: collegeIds },
//                 attributes: [],
//               },
//             ],
//             attributes: ["job_id"],
//             raw: true,
//           });
//           byCollege.forEach((j) => matchedJobPostIds.add(j.job_id));
//         }

//         if (matchedJobPostIds.size > 0) {
//           const jobPosts = await JobPost.findAll({
//             where: { job_id: [...matchedJobPostIds] },
//             include: [
//               {
//                 model: CompanyRecruiterProfile,
//                 attributes: ["user_id"],
//               },
//             ],
//             attributes: [],
//             raw: true,
//           });
//           const eduCompanyIds = jobPosts
//             .map((j) => j["CompanyRecruiterProfile.user_id"])
//             .filter((id) => id);
//           addToWeightMap(eduCompanyIds, 60);
//         }
//       }
//     } catch (e) {
//       console.warn(
//         "Feed: Error fetching education-matched companies",
//         e.message
//       );
//     }


//     // ==============================
//     // STEP 2: Fetch posts (personalized + fallback)
//     // ==============================
//     const relevantUserIds = [...weightMap.keys()];
//     let allCandidatePosts = [];

//     // Phase 1: Personalized posts
//     if (relevantUserIds.length > 0) {
//       const personalized = await FeedPost.findAll({
//         where: { user_id: relevantUserIds },
//         order: [["created_at", "DESC"]],
//         limit: parseInt(offset + limit + 20), // buffer
//         include: [
//           {
//             model: User,
//             attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//             include: [
//               {
//                 model: UserDetail,
//                 as: "UserDetail",
//                 attributes: ["user_profile_pic"],
//               },
//               {
//                 model: CompanyRecruiterProfile,
//                 as: "CompanyRecruiterProfile",
//                 attributes: ["logo_url"],
//               },
//             ],
//           },
//         ],
//       });
//       allCandidatePosts = personalized.map((p) => ({
//         ...p.toJSON(),
//         isPersonalized: true,
//       }));
//     }

//     // Phase 2: Fallback posts (if needed)
//     const currentlyHave = allCandidatePosts.length;
//     const needed = offset + limit - currentlyHave;
//     console.log("here is needed",needed);

//     if (needed > 0) {
//       const existingIds = new Set(allCandidatePosts.map((p) => p.id));

//       const fallbackWhere =
//         existingIds.size > 0
//           ? {
//               user_id: { [Op.notIn]: [...existingIds] },
//               "$User.user_role$": "COMPANY",
//             }
//           : { "$User.user_role$": "COMPANY" };

//       const fallbackPosts = await FeedPost.findAll({
//         where: fallbackWhere,
//         order: [["created_at", "DESC"]],
//         limit: needed + 50, // over-fetch
//         include: [
//           {
//             model: User,
//             attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//             include: [
//               {
//                 model: UserDetail,
//                 as: "UserDetail",
//                 attributes: ["user_profile_pic"],
//               },
//               {
//                 model: CompanyRecruiterProfile,
//                 as: "CompanyRecruiterProfile",
//                 attributes: ["logo_url"],
//               },
//             ],
//           },
//         ],
//       });

//       const newFallback = fallbackPosts.map((p) => ({
//         ...p.toJSON(),
//         isPersonalized: false,
//       }));
//       allCandidatePosts = [...allCandidatePosts, ...newFallback];
//     }

//     // Score and sort
//     const scored = allCandidatePosts
//       .map((post) => {
//         if (post.isPersonalized) {
//           const baseScore = weightMap.get(post.user_id) || 10;
//           const timeScore = new Date(post.created_at).getTime() / 1e10;
//           return { ...post, score: baseScore + timeScore };
//         } else {
//           // Lower than any personalized (max base = 100, so 5 is safe)
//           return {
//             ...post,
//             score: 5 + new Date(post.created_at).getTime() / 1e10,
//           };
//         }
//       })
//       .sort((a, b) => b.score - a.score);

//     // Total for pagination
//     const totalPosts = scored.length;
//     const paginatedPosts = scored.slice(offset, offset + limit);

//     // Stop early if truly no posts
//     if (totalPosts === 0) {
//       return res.status(200).json({
//         totalPosts: 0,
//         currentPage: page,
//         totalPages: 0,
//         posts: [],
//       });
//     }

//     // ==============================
//     // STEP 3: Batch enrichment (with safety)
//     // ==============================
//     const postIds = paginatedPosts.map((p) => p.id).filter((id) => id);
//     const userIds = paginatedPosts.map((p) => p.User?.id).filter((id) => id);

//     // Likes
//     let likedPostIds = new Set();
//     if (postIds.length > 0) {
//       try {
//         const likes = await PostLikes.findAll({
//           where: { post_id: postIds, user_id: studentUserId },
//           attributes: ["post_id"],
//           raw: true,
//         });
//         likedPostIds = new Set(likes.map((l) => l.post_id));
//       } catch (e) {
//         console.warn("Feed: Error fetching likes", e.message);
//       }
//     }

//     // Followers count (safe batch)
//     const followersCountMap = new Map();
//     for (const userId of userIds) {
//       try {
//         const count = await Follow.count({ where: { followed_id: userId } });
//         followersCountMap.set(userId, count);
//       } catch (e) {
//         followersCountMap.set(userId, 0);
//       }
//     }

//     // Comments
//     let commenterMap = {};
//     try {
//       const allCommenterIds = Array.from(
//         new Set(
//           paginatedPosts.flatMap((p) => {
//             try {
//               const comments = p.comments ? JSON.parse(p.comments) : [];
//               return comments
//                 .map((c) => parseInt(c.user_id))
//                 .filter((id) => id);
//             } catch {
//               return [];
//             }
//           })
//         )
//       ).filter((id) => id);

//       if (allCommenterIds.length > 0) {
//         const commenters = await User.findAll({
//           where: { id: allCommenterIds },
//           attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
//           include: [
//             {
//               model: UserDetail,
//               as: "UserDetail",
//               attributes: ["user_profile_pic"],
//             },
//             {
//               model: CompanyRecruiterProfile,
//               as: "CompanyRecruiterProfile",
//               attributes: ["logo_url"],
//             },
//           ],
//         });
//         commenterMap = Object.fromEntries(
//           commenters.map((u) => {
//             const pic =
//               u.user_role === "COMPANY"
//                 ? u.CompanyRecruiterProfile?.logo_url
//                 : u.UserDetail?.user_profile_pic;
//             return [
//               u.id,
//               {
//                 first_name: u.first_name || "",
//                 last_name: u.last_name || "",
//                 profile_pic: pic || null,
//                 uuid: u.uuid || null,
//               },
//             ];
//           })
//         );
//       }
//     } catch (e) {
//       console.warn("Feed: Error enriching comments", e.message);
//     }

//     // Final enrichment
//     const finalPosts = paginatedPosts.map((post) => {
//       // Profile pic
//       let profilePic = null;
//       if (post.User?.user_role === "COMPANY") {
//         profilePic = post.User.CompanyRecruiterProfile?.logo_url || null;
//       } else {
//         profilePic = post.User?.UserDetail?.user_profile_pic || null;
//       }

//       // Clean up
//       delete post.User?.UserDetail;
//       delete post.User?.CompanyRecruiterProfile;

//       return {
//         ...post,
//         User: {
//           ...post.User,
//           profile_pic: profilePic,
//           followersCount: followersCountMap.get(post.User?.id) || 0,
//         },
//         isLiked: likedPostIds.has(post.id),
//         comments: post.comments
//           ? (() => {
//               try {
//                 return JSON.parse(post.comments).map((c) => ({
//                   ...c,
//                   ...(commenterMap[c.user_id] || {}),
//                 }));
//               } catch {
//                 return [];
//               }
//             })()
//           : [],
//       };
//     });

//     // ==============================
//     // Response
//     // ==============================
//     return res.status(200).json({
//       totalPosts: scored.length,
//       currentPage: page,
//       totalPages: Math.ceil(scored.length / limit),
//       posts: finalPosts,
//     });
//   } catch (error) {
//     console.error("Critical feed error:", error);
//     return res
//       .status(500)
//       .json({ message: "Unable to load feed. Please try again." });
//   }
// };


// Delete a feed post


const deleteFeedPost = async (req, res) => {
  try {
    const { id } = req.params; // post ID from URL
    const loggedInUserId = req.user?.id;

    if (!loggedInUserId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: user not found in token",
        });
    }

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Post ID is required" });
    }

    const post = await FeedPost.findByPk(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Feed post not found" });
    }

    // Only allow deletion if the logged-in user owns the post
    if (post.user_id !== loggedInUserId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: You can only delete your own posts",
        });
    }

    await post.destroy();

    return res.status(200).json({ success:true,message: "Feed post deleted successfully" });
  } catch (error) {
    console.error('Error deleting feed post:', error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const post_id = req.params.id;
    const { user_id } = req.body; // removed action as it was not required

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const post = await FeedPost.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await PostLikes.findOne({ where: { post_id, user_id } });

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      post.like_count = Math.max((post.like_count || 0) - 1, 0);
      isLiked = false;
    } else {
      // Like
      await PostLikes.create({ post_id, user_id });
      post.like_count = (post.like_count || 0) + 1;
      isLiked = true;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post like status updated',
      isLiked,
      like_count: post.like_count
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const commentOnPost = async (req, res) => {
  try {
    const post_id = req.params.id;
    const user_id=req.user?.id;
    const { comment } = req.body;

    if (!user_id ) {
      return res.status(400).json({
        success: false,
        message: "token is missing",
      });
    }

    if (user_id && !comment) {
      return res.status(400).json({
        success: false,
        message: "comment is missing from the body",
      });
    }

    const post = await FeedPost.findByPk(post_id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create comment in new table
    const newComment = await PostComments.create({
      post_id: post.id,
      user_id,
      comment,
      // parent_comment_id: null, // optional for top-level
    });

    // Increment comment_count
    await post.increment("comment_count");

    // Fetch ALL comments for this post (including new one)
    const comments = await PostComments.findAll({
      where: { post_id: post.id },
      order: [["created_at", "DESC"]], // same as unshift (newest first)
    });

    // Enrich comments with user data (same logic as before)
    const enrichedComments = await Promise.all(
      comments.map(async (cmt) => {
        const user = await User.findByPk(cmt.user_id, {
          attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
        });
        if (!user) {
          return {
            ...cmt.get({ plain: true }), // ← important: use .get()
            userName: "User",
            first_name: "User",
            last_name: null,
            user_role: null,
            profile_pic: null,
          };
        }

        let profile_pic = null;
        const userName =
          `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

        if (user.user_role === "STUDENT") {
          const detail = await UserDetail.findOne({
            where: { user_id: user.id },
          });
          profile_pic = detail?.user_profile_pic || null;
        } else if (user.user_role === "COMPANY") {
          const detail = await CompanyRecruiterProfile.findOne({
            where: { user_id: user.id },
          });
          profile_pic = detail?.logo_url || null;
        } else if (user.user_role === "UNIVERSITY") {
          const detail = await UniversityDetail.findOne({
            where: { user_id: user.id },
          });
          profile_pic = detail?.university_logo_url || null;
        }

        return {
          ...cmt.get({ plain: true }), 
          userName,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          user_role: user.user_role || null,
          profile_pic,
          uuid: user.uuid || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Comment added",
      comments: enrichedComments,
      comment_count: enrichedComments.length,
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params; // comment ID
  const userId = req.user.id;

  const comment = await PostComments.findByPk(id);
  if (!comment)
    return res
      .status(404)
      .json({ success: false, message: "Comment not found" });

  // Only owner can delete
  if (comment.user_id !== userId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  await comment.destroy();
  await FeedPost.decrement("comment_count", { where: { id: comment.post_id } });

  return res.json({ success: true, message: "Comment deleted successfully" });
};

// api for follow / unfollow user
const toggleFollowUser = async (req, res) => {
  const follower_id=req.user.id;
  const { followed_id } = req.body;

  if (!followed_id || isNaN(followed_id)) {
    return res.status(400).json({ message: "Invalid followed_id provided" });
  }

  if (follower_id === Number(followed_id)) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  try {
    const existingFollow = await Follow.findOne({
      where: { follower_id, followed_id },
    });

    let message;
    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      message="Unfollowed successfully";
    } else {
      // Follow
      await Follow.create({ follower_id, followed_id });
      message="Followed successfully" ;
    }

    // returning current follow status for immediate UI update
    const isFollowing = !existingFollow;
    return res.status(200).json({
      message,
      is_following: isFollowing,
    });
  } catch (err) {
    console.error("Error toggling follow:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get api followers/following
const getUserFollows = async (req, res) => {
  const { user_id, type } = req.params;
  const currentUserId = req.user?.id; // Optional: for is_following flag

  const validTypes = ["followers", "following"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: "Invalid type. Use 'followers' or 'following'",
    });
  }

  const whereCondition =
    type === "followers" ? { followed_id: user_id } : { follower_id: user_id };

  const includeAlias = type === "followers" ? "Follower" : "Followed";

  try {
    const follows = await Follow.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: includeAlias,
          attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
        },
      ],
    });

    // Helper to get profile pic based on role
    const getProfilePic = async (user) => {
      if (user.user_role === "STUDENT") {
        const detail = await UserDetail.findOne({
          where: { user_id: user.id },
          attributes: ["user_profile_pic"],
        });
        return detail?.user_profile_pic || null;
      } else if (user.user_role === "COMPANY") {
        const detail = await CompanyRecruiterProfile.findOne({
          where: { user_id: user.id },
          attributes: ["logo_url"],
        });
        return detail?.logo_url || null;
      } else if (user.user_role === "UNIVERSITY") {
        const detail = await UniversityDetail.findOne({
          where: { user_id: user.id },
          attributes: ["university_logo_url"],
        });
        return detail?.university_logo_url || null;
      }
      return null;
    };

    // Build enriched result with profile pic and is_following
    const result = [];
    for (const follow of follows) {
      const user = follow[includeAlias];
      const profile_pic = await getProfilePic(user);

      let is_following = false;
      if (currentUserId && currentUserId !== user.id) {
        const existing = await Follow.findOne({
          where: { follower_id: currentUserId, followed_id: user.id },
        });
        is_following = !!existing;
      }

      result.push({
        id: user.id,
        uuid: user.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        user_role: user.user_role,
        profile_pic,
        is_following,
      });
    }

    return res.status(200).json({
      count: result.length,
      [type]: result,
    });
  } catch (err) {
    console.error("Error fetching follows:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};





const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const loggedInUserId = req.user?.id;
    if (!loggedInUserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not found in token" });
    }

    const post = await FeedPost.findOne({
      where: { slug: slug },
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
            attributes: ["id", "user_id", "comment", "created_at", "updated_at", "parent_comment_id"],
          }
      ],
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postData = post.toJSON();

    // Attach profile_pic based on role
    if (postData.User.user_role === "COMPANY") {
      postData.User.profile_pic =
        postData.User.CompanyRecruiterProfile?.logo_url || null;
    } else if (postData.User.user_role === "UNIVERSITY") {
      postData.User.profile_pic =
        postData.User.UniversityDetail?.university_logo_url || null;
    }
     else {
      postData.User.profile_pic =
        postData.User.UserDetail?.user_profile_pic || null;
    }

    // Cleanup
    delete postData.User.UserDetail;
    delete postData.User.CompanyRecruiterProfile;

    

    // Add followers count
    const followersCount = await Follow.count({
      where: { followed_id: postData.User.id },
    });
    postData.User.followersCount = followersCount;

    // Check if liked
    const liked = await PostLikes.findOne({
      where: { post_id: postData.id, user_id: loggedInUserId },
    });
    postData.isLiked = !!liked;

    // Check if logged-in user is following the post author
    const isFollowing = await Follow.findOne({
      where: {
        follower_id: loggedInUserId,
        followed_id: postData.User.id,
      },
    });
    postData.User.isFollowing = !!isFollowing;

    // Enrich comments
    if (postData.comments.length > 0) {
      const commenterUserIds = postData.comments
        .map((c) => parseInt(c.user_id))
        .filter(Boolean);

      if (commenterUserIds.length > 0) {
        const commenters = await User.findAll({
          where: { id: commenterUserIds },
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
        });

        const commenterMap = Object.fromEntries(
          commenters.map((u) => {
            let profile_pic = null;
            if (u.user_role === "COMPANY") {
              profile_pic = u.CompanyRecruiterProfile?.logo_url || null;
            } else if (u.user_role === "UNIVERSITY") {
              profile_pic = u.UniversityDetail?.university_logo_url || null;
            } else {
              profile_pic = u.UserDetail?.user_profile_pic || null;
            }
            return [
              u.id,
              {
                first_name: u.first_name,
                last_name: u.last_name,
                profile_pic,
                uuid: u.uuid || null,
              },
            ];
          })
        );

        postData.comments = postData.comments.map((comment) => ({
          ...comment,
          first_name:
            commenterMap[parseInt(comment.user_id)]?.first_name || null,
          last_name: commenterMap[parseInt(comment.user_id)]?.last_name || null,
          profile_pic:
            commenterMap[parseInt(comment.user_id)]?.profile_pic || null,
          uuid: commenterMap[parseInt(comment.user_id)]?.uuid || null,
        }));
      }
    }

    return res.status(200).json(postData);
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//get a user's all posts
// get all feed post
const getUserPosts = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Get user_id from JWT (set by authMiddleware)
    const loggedInuser_id = req.user && req.user.id;
    if (!loggedInuser_id) {
      return res.status(401).json({ message: "Unauthorized: user not found in token" });
    }

    const { count, rows: rawPosts } = await FeedPost.findAndCountAll({
      where: { user_id: req.params.id },
      order: [["created_at", "DESC"]],
      limit,
      offset,
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
        },
      ],
    });

    const posts = await Promise.all(rawPosts.map(async post => {
      const postData = post.toJSON();

      // Attach user profile_pic
      if (postData.User.user_role === 'COMPANY') {
        postData.User.profile_pic = postData.User.CompanyRecruiterProfile?.logo_url || null;
      } else if (postData.User.user_role === "UNIVERSITY") {
        postData.User.profile_pic =
          postData.User.UniversityDetail?.university_logo_url || null;
      } else {
        postData.User.profile_pic =
          postData.User.UserDetail?.user_profile_pic || null;
      }

      // Remove nested models
      delete postData.User.UserDetail;
      delete postData.User.CompanyRecruiterProfile;

      const comments = postData.comments || [];
      postData._commenteruser_ids = comments
        .map((c) => parseInt(c.user_id))
        .filter(Boolean);

      // Get followers count
      const followersCount = await Follow.count({
        where: { followed_id: postData.User.id }
      });
      postData.User.followersCount = followersCount;

      // Check if logged-in user has liked this post
      const liked = await PostLikes.findOne({
        where: { post_id: postData.id, user_id: loggedInuser_id }
      });
      postData.isLiked = !!liked;

      return postData;
    }));

    // Batch fetch all unique commenter user_ids across all posts
    const allCommenteruser_ids = Array.from(new Set(posts.flatMap(p => p._commenteruser_ids)));
    let commenterUserMap = {};
    if (allCommenteruser_ids.length > 0) {
      const commenters = await User.findAll({
        where: { id: allCommenteruser_ids },
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
      });
      commenterUserMap = Object.fromEntries(commenters.map(u => {
        let profile_pic = null;
        if (u.user_role === 'COMPANY') {
          profile_pic = u.CompanyRecruiterProfile?.logo_url || null;
        } else if (u.user_role === "UNIVERSITY") {
          profile_pic = u.UniversityDetail?.university_logo_url || null;
        } else {
          profile_pic = u.UserDetail?.user_profile_pic || null;
        }
        return [u.id, {
          first_name: u.first_name,
          last_name: u.last_name,
          profile_pic,
          uuid:u.uuid || null
        }];
      }));
    }

    // Enrich comments with user info
    posts.forEach(post => {
      post.comments = post.comments.map(comment => {
        const userInfo = commenterUserMap[parseInt(comment.user_id)] || {};
        return {
          ...comment,
          first_name: userInfo.first_name || null,
          last_name: userInfo.last_name || null,
          profile_pic: userInfo.profile_pic || null,
          uuid: userInfo.uuid || null
        };
      });
      delete post._commenteruser_ids; // cleanup
    });

    return res.status(200).json({
      totalPosts: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      posts,
    });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


  const getImageUrl = (path, req) => {
    if (!path) return `${req.protocol}://${req.get('host')}/default-og-image.jpg`;
    if (path.startsWith('http')) return path;
    return `${req.protocol}://${req.get('host')}/uploads/${path}`;
  };

  const getSocialPreview = async (req, res) => {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).send('Missing slug parameter');
    }

    try {
      const post = await FeedPost.findOne({
        where: { slug },
        include: [
          {
          model: User,
          attributes: ["id", "first_name", "last_name", "user_role"],
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
          }
          ]
          }
        ]
      });

      if (!post) {
        return res.status(404).send('Post not found');
      }

      // Build absolute URLs
      const imageUrl = "https://media.istockphoto.com/id/1973365581/vector/sample-ink-rubber-stamp.jpg?s=612x612&w=0&k=20&c=_m6hNbFtLdulg3LK5LRjJiH6boCb_gcxPvRLytIz0Ws=" ;
      const postUrl = `${process.env.FRONTEND_URL}/feed-post/${slug}`;
      const title = post.caption?.slice(0, 60) || 'Check out this post!';
      const description = post.caption?.slice(0, 160) || 'A post shared from our platform.';

      // Generate HTML with Open Graph tags
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${postUrl}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="${imageUrl}" />
        <meta http-equiv="refresh" content="2;url=${postUrl}" />
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 3rem; background: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Loading Post...</h2>
          <p style="color: #666;">You’ll be redirected shortly.</p>
          <p style="margin-top: 1rem;"><a href="${postUrl}" style="color: #0066cc; text-decoration: none;">Click here if not redirected</a></p>
        </div>
      </body>
      </html>
      `;

      
      res.set('Content-Type', 'text/html');
      res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache 1 hour
      res.send(html);

    } catch (error) {
      console.error('Error generating social preview:', error);
      res.status(500).send('Server Error');
    }
  };


// const db = require("../models"); // assuming all models exported here


// // Optional: Safe limit to prevent huge IN clauses
// const MAX_FOLLOWED_IDS = 1500;

// const getFeedPosts = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { cursor } = req.query; // cursor = "score:created_at" e.g., "95:2024-05-20T10:30:00.000Z"
//     const LIMIT = 20;

//     // === STEP 1: Fetch user role and context in parallel ===
//     const [user, followedUsers, userSkills, educations, appliedJobIds] = await Promise.all([
//       User.findByPk(userId, {
//         attributes: ["id", "user_role", "first_name", "last_name"],
//       }),
//       // Get IDs of users this user follows (max 1500 to prevent SQL overload)
//       Follow.findAll({
//         where: { follower_id: userId },
//         attributes: ["followed_id"],
//         raw: true,
//         limit: MAX_FOLLOWED_IDS,
//       }).then(rows => rows.map(r => r.followed_id)),

//       // Student skills (if student)
//       UserSkill.findAll({
//         where: { user_id: userId },
//         attributes: ["skill_id"],
//         raw: true,
//       }).then(rows => rows.map(r => r.skill_id)),

//       // Education (for college/course context)
//       Education.findAll({
//         where: { user_detail_id: userId },
//         attributes: ["school_college_id", "course_id"],
//         raw: true,
//       }).then(rows => rows),

//       // Jobs user applied to (boost relevance)
//       Application.findAll({
//         where: { user_id: userId },
//         attributes: ["job_post_id"],
//         raw: true,
//       }).then(rows => rows.map(r => r.job_post_id)),
//     ]);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { user_role } = user;
//     const followedUserIds = followedUsers;
//     const userSkillIds = userSkills;
//     const userColleges = [...new Set(educations.map(e => e.school_college_id).filter(Boolean))];
//     const userCourses = [...new Set(educations.map(e => e.course_id).filter(Boolean))];

//     // Parse cursor (format: "{score}:{isoDate}")
//     let lastScore = Infinity;
//     let lastCreatedAt = new Date();

//     if (cursor) {
//       const [scoreStr, dateStr] = cursor.split(":");
//       lastScore = parseFloat(scoreStr) || 0;
//       lastCreatedAt = new Date(decodeURIComponent(dateStr));
//       if (isNaN(lastCreatedAt.getTime())) {
//         lastCreatedAt = new Date();
//       }
//     }

//     // === STEP 2: Build UNION query for feed (posts + jobs) ===
//     // Use raw SQL for performance & UNION control
//     const feedQuery = `
//       WITH 
//         -- Followed users (safe for IN)
//         followed AS (SELECT ?::INTEGER[] AS ids),

//         -- Skill-matching job IDs (precomputed CTE for reuse)
//         skill_matched_jobs AS (
//           SELECT DISTINCT jps.job_post_id
//           FROM job_post_skills jps
//           WHERE jps.skill_id = ANY(?::INTEGER[])
//         ),
        
//         -- College-matched job IDs
//         college_matched_jobs AS (
//           SELECT DISTINCT jpc.job_post_id
//           FROM job_post_colleges jpc
//           WHERE jpc.college_id = ANY(?::INTEGER[])
//         ),
        
//         -- Course-matched job IDs
//         course_matched_jobs AS (
//           SELECT DISTINCT jpc.job_post_id
//           FROM job_post_courses jpc
//           WHERE jpc.course_id = ANY(?::INTEGER[])
//         )

//       -- Feed Posts
//       SELECT 
//         'post' AS type,
//         fp.id,
//         fp.user_id AS author_id,
//         fp.caption,
//         fp.image,
//         fp.like_count,
//         fp.comment_count,
//         fp.created_at,
//         u.first_name,
//         u.last_name,
//         u.user_role AS author_role,
//         CASE 
//           WHEN fp.user_id = ? THEN 110   -- own post (highest)
//           WHEN fp.user_id = ANY((SELECT ids FROM followed)) THEN 100
//           ELSE 50 
//         END AS relevance_score

//       FROM feed_posts fp
//       INNER JOIN users u ON u.id = fp.user_id
//       WHERE fp.user_id = ? 
//          OR fp.user_id = ANY((SELECT ids FROM followed))

//       UNION ALL

//       -- Job Posts
//       SELECT 
//         'job' AS type,
//         jp.job_id AS id,
//         crp.user_id AS author_id,
//         jp.job_description AS caption,
//         NULL AS image,
//         0 AS like_count,
//         0 AS comment_count,
//         jp.created_at,
//         u.first_name,
//         u.last_name,
//         'COMPANY' AS author_role,
//         (
//           CASE WHEN crp.user_id = ? THEN 98 
//                WHEN crp.user_id = ANY((SELECT ids FROM followed)) THEN 95 
//                ELSE 0 END +
//           CASE WHEN jp.job_id = ANY(?::INTEGER[]) THEN 85 ELSE 0 END +  -- applied
//           CASE WHEN jp.job_id IN (SELECT job_post_id FROM skill_matched_jobs) THEN 80 ELSE 0 END +
//           CASE WHEN jp.job_id IN (SELECT job_post_id FROM college_matched_jobs) THEN 75 ELSE 0 END +
//           CASE WHEN jp.job_id IN (SELECT job_post_id FROM course_matched_jobs) THEN 70 ELSE 0 END +
//           10  -- base boost for active jobs
//         ) AS relevance_score

//       FROM job_posts jp
//       INNER JOIN company_recruiter_profiles crp ON crp.id = jp.company_recruiter_profile_id
//       INNER JOIN users u ON u.id = crp.user_id
//       WHERE jp.active_status = 1  -- only active jobs
//         AND jp.payment_type = 'free'  -- per your "free for 1 year" rule

//       -- Final filtering & sorting
//       ORDER BY relevance_score DESC, created_at DESC
//       LIMIT ?
//     `;

//     // Prepare params for query (order matters!)
//     const queryParams = [
//       // followed.ids
//       followedUserIds.length ? followedUserIds : [0],
//       // skill IDs
//       userSkillIds.length ? userSkillIds : [0],
//       // college IDs
//       userColleges.length ? userColleges : [0],
//       // course IDs
//       userCourses.length ? userCourses : [0],
//       // self user ID (for own post boost)
//       userId,
//       // own post filter
//       userId,
//       // crp.user_id comparison (self + followed)
//       userId,
//       // applied job IDs
//       appliedJobIds.length ? appliedJobIds : [0],
//       // limit
//       LIMIT + 1, // +1 to detect "hasNextPage"
//     ];

//     // Add cursor condition if exists
//     let finalQuery = feedQuery;
//     if (cursor) {
//       finalQuery += `
//         OFFSET 0
//       `;
//       // Append WHERE for cursor (after UNION, before LIMIT)
//       // We'll filter in JS for simplicity and safety (avoid complex SQL cursor handling)
//     }

//     const feedItems = await sequelize.query(finalQuery, {
//       type: sequelize.QueryTypes.SELECT,
//       replacements: queryParams,
//     });

//     // === STEP 3: Apply cursor filtering in JS (safer & clearer) ===
//     let filteredItems = feedItems;
//     if (cursor) {
//       filteredItems = feedItems.filter(item => {
//         const score = parseFloat(item.relevance_score);
//         const createdAt = new Date(item.created_at);
//         return score < lastScore || (score === lastScore && createdAt < lastCreatedAt);
//       });
//     }

//     // Apply limit after cursor filtering
//     const items = filteredItems.slice(0, LIMIT);
//     const hasNextPage = filteredItems.length > LIMIT;
//     const lastItem = items.length > 0 ? items[items.length - 1] : null;
//     const nextCursor = lastItem
//       ? `${lastItem.relevance_score}:${encodeURIComponent(lastItem.created_at)}`
//       : null;

//     // === STEP 4: Enrich items (optional: attach company/college names, etc.) ===
//     // (You can skip if frontend only needs basics)
//     const enrichedItems = items.map(item => ({
//       id: item.id,
//       type: item.type,
//       author: {
//         id: item.author_id,
//         name: `${item.first_name} ${item.last_name}`.trim(),
//         role: item.author_role,
//       },
//       content: item.caption,
//       image: item.image,
//       metrics: {
//         likes: parseInt(item.like_count) || 0,
//         comments: parseInt(item.comment_count) || 0,
//       },
//       created_at: item.created_at,
//       relevance_score: parseFloat(item.relevance_score),
//     }));

//     return res.json({
//       success: true,
//       data: enrichedItems,
//       pagination: {
//         hasNextPage,
//         nextCursor,
//       },
//     });

//   } catch (error) {
//     console.error("Feed error:", error);
//     return res.status(500).json({ error: "Failed to fetch feed", message: error.message });
//   }
// };



module.exports = {
  createFeedPost,
  editFeedPost,
  getFeedPosts,
  likeUnlikePost,
  commentOnPost,
  toggleFollowUser,
  getUserFollows,
  getPostBySlug,
  getSocialPreview,
  getUserPosts,
  deleteFeedPost,
  deleteComment
};
