// utils/logProfileView.js
const { ProfileView } = require("../models"); // adjust path
const { Op } = require("sequelize");

// Prevent duplicate views: same viewer → same profile within 1 hour = ignore
const DEDUP_WINDOW_HOURS = 1;

async function logProfileView(viewerUserId, viewedUserId, source = "direct") {
  if (!viewerUserId || !viewedUserId || viewerUserId === viewedUserId) {
    return; // don't log self-views or invalid
  }

  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - DEDUP_WINDOW_HOURS);

  // Check if already viewed in last hour
  const existing = await ProfileView.findOne({
    where: {
      viewer_user_id: viewerUserId,
      viewed_user_id: viewedUserId,
      viewed_at: { [Op.gte]: cutoffTime },
    },
  });

  if (!existing) {
    await ProfileView.create({
      viewer_user_id: viewerUserId,
      viewed_user_id: viewedUserId,
      source,
      viewed_at: new Date(),
    });
  }
}

module.exports = logProfileView;
