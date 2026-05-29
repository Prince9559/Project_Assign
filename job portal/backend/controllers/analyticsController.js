const { User, ProfileView, CompanyRecruiterProfile, JobRole, UniversityDetail, UserDetail} = require("../models");
const { Op } = require("sequelize");

exports.getMyProfileViews = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get last 30 days of views
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const views = await ProfileView.findAll({
      where: {
        viewed_user_id: userId,
        viewed_at: { [Op.gte]: thirtyDaysAgo },
      },
      include: [
        {
          model: User,
          as: "viewer",
          attributes: [
            "id",
            "uuid",
            "first_name",
            "last_name",
            "user_role",
            "created_at",
          ],
        },
      ],
      order: [["viewed_at", "DESC"]],
      limit: 100, // for MVP
    });

    // Group stats
    const totalViews = views.length;
    const uniqueViewers = [...new Set(views.map(v => v.viewer_user_id))].length;

    // Enrich viewer with role-specific info (optional — for dashboard)
   // Inside exports.getMyProfileViews — replace the `enrichedViews` mapping with this:
const enrichedViews = await Promise.all(
  views.map(async (view) => {
    const viewer = view.viewer;
    let viewer_profile = {};

    if (viewer.user_role === "COMPANY") {
      const company = await CompanyRecruiterProfile.findOne({
        where: { user_id: viewer.id },
        attributes: ["company_name", "designation_id", "logo_url", "profile_pic"],
        include: [
          { 
            model: JobRole,
            as: "designation", 
            attributes: ["title"] 
          },
        ],
      });
      viewer_profile = {
        type: "company",
        name: company?.company_name || "Company",
        designation: company?.designation?.title,
        profile_pic: company?.logo_url || company?.profile_pic, // ← prioritize logo, fallback to profile_pic
      };
    } else if (viewer.user_role === "UNIVERSITY") {
      const univ = await UniversityDetail.findOne({
        where: { user_id: viewer.id },
        attributes: ["college_name", "university_logo_url", "profile_pic"],
      });
      viewer_profile = {
        type: "university",
        name: univ?.college_name || "University",
        profile_pic: univ?.university_logo_url || univ?.profile_pic,
      };
    } else if (viewer.user_role === "STUDENT") {
      const student = await UserDetail.findOne({
        where: { user_id: viewer.id },
        attributes: ["user_profile_pic"],
      });
      viewer_profile = {
        type: "student",
        profile_pic: student?.user_profile_pic,
      };
    }

    return {
      viewer_id: viewer.id,
      viewer_uuid: viewer.uuid,
      name: `${viewer.first_name} ${viewer.last_name}`.trim(),
      role: viewer.user_role,
      viewed_at: view.viewed_at,
      source: view.source,
      viewer,           // raw viewer (for debugging)
      viewer_profile,   //  consistent shape for frontend
    };
  })
);

    res.json({
      meta: {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        period: "last_30_days",
      },
      views: enrichedViews,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};