// backend/services/notificationService.js
const { notifyUser, incrementUnreadCount } = require('../socket/socketHandler');
const { Notification } = require('../models');

// Helper: Normalize role to lowercase for templates
const normalizeRole = (role) => {
  if (!role) return null;
  return role.toLowerCase(); // "STUDENT" → "student"
};

class NotificationService {
  
  static async send(userId, userRole, type, payload = {}) {
    // Validate role
    const validRoles = ["STUDENT", "COMPANY", "UNIVERSITY"];
    if (!validRoles.includes(userRole)) {
      throw new Error(`Invalid userRole: ${userRole}`);
    }

    // Prefer explicit payload.title/body, else fall back to template
    let title = payload.title;
    let body = payload.body;
    let actionUrl = payload.actionUrl;

    if (!title || !body) {
      const template = this.getTemplate(type, payload);
      if (!template) {
        throw new Error(
          `No template or payload.title/body for notification type: "${type}"`
        );
      }
      title = template.title;
      body = template.body;
      actionUrl = template.actionUrl;
    }

    
    const notification = await Notification.create({
      user_id: userId,
      user_role: userRole,
      type,
      title: title, 
      body: body, 
      action_url: actionUrl, 
      metadata: payload,
    });

    notifyUser(userId, "notification:new", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      action_url: notification.action_url,
      is_read: false,
      created_at: notification.created_at,
      metadata: notification.metadata,
    });

    incrementUnreadCount(userId);
    return notification;
  }

  //  Notification Templates — Organized by Role
  static getTemplate(type, payload) {
    const templates = {
      // =============== RECRUITER NOTIFICATIONS ===============
      application_received: {
        title: `New application for ${payload.jobTitle}`,
        body: `${payload.applicantName} applied to your job.`,
        actionUrl: `/dashboard/jobs/${payload.jobId}/applicants`,
      },
      job_expiring_soon: {
        title: `Job expires in ${payload.daysLeft} day(s)`,
        body: `"${payload.jobTitle}" will be archived soon. Renew to keep it active.`,
        actionUrl: `/dashboard/jobs/${payload.jobId}/edit`,
      },
      job_filled: {
        title: `Job filled!`,
        body: `"${payload.jobTitle}" has been filled. ${payload.applicantName} accepted the offer.`,
        actionUrl: `/dashboard/jobs/${payload.jobId}`,
      },
      plan_expiring: {
        title: `Subscription ending soon`,
        body: `Your ${payload.planName} plan expires in ${payload.daysLeft} days.`,
        actionUrl: `/dashboard/billing`,
      },
      plan_upgraded: {
        title: ` Plan upgraded!`,
        body: `You’re now on the ${payload.planName} plan. Enjoy unlimited job posts!`,
        actionUrl: `/dashboard/billing`,
      },

      // =============== STUDENT NOTIFICATIONS ===============
      application_submitted: {
        title: ` Application submitted`,
        body: `You applied to "${payload.jobTitle || "Job"}" at ${
          payload.companyName || "Company"
        }.`,
        actionUrl: `/applications/${payload.applicationId}`,
      },
      application_shortlisted: {
        title: ` You’re shortlisted!`,
        body: `${payload.companyName} has shortlisted you for "${
          payload.jobTitle
        }". Next: ${payload.nextStep || "Interview"}`,
        actionUrl: `/applications/${payload.applicationId}`,
      },
      application_rejected: {
        title: ` Application status updated`,
        body: `Your application for "${payload.jobTitle}" was not selected this time.`,
        actionUrl: `/applications/${payload.applicationId}`,
      },
      job_match: {
        title: ` New job match!`,
        body: `"${payload.jobTitle}" at ${payload.companyName} matches your profile.`,
        actionUrl: `/jobs/${payload.jobId}`,
      },
      interview_scheduled: {
        title: ` Interview scheduled`,
        body: `Interview for "${payload.jobTitle}" on ${new Date(
          payload.date
        ).toLocaleDateString()}`,
        actionUrl: `/applications/${payload.applicationId}`,
      },

      // =============== INTERVIEW NOTIFICATIONS ===============
      interview_scheduled_student: {
        title: `🎯 Interview Scheduled`,
        body: `Interview for "${payload.jobTitle}" on ${new Date(
          payload.date
        ).toLocaleDateString("en-IN")}`,
        actionUrl: `/applications/${payload.applicationId}`,
      },
      interview_reminder_student: {
        title: `⏰ Interview in 1 Hour!`,
        body: `Your interview for "${payload.jobTitle}" starts at ${payload.time}.`,
        actionUrl: `/applications/${payload.applicationId}`,
      },
      interview_reminder_recruiter: {
        title: `📞 Interview Reminder`,
        body: `Interview with ${payload.studentName} in 1 hour (${payload.time}).`,
        actionUrl: `/dashboard/applications/${payload.applicationId}`,
      },

      // =============== UNIVERSITY NOTIFICATIONS ===============
      campus_drive_registered: {
        title: ` New campus drive registered`,
        body: `${payload.companyName} registered for a drive at ${payload.universityName}.`,
        actionUrl: `/university/drives/${payload.driveId}`,
      },
      student_placed: {
        title: ` Student placed!`,
        body: `${payload.studentName} placed at ${payload.companyName} (${payload.ctc} LPA).`,
        actionUrl: `/university/placements`,
      },
      drive_report_generated: {
        title: ` Drive report ready`,
        body: `Report for ${payload.driveName} is now available for download.`,
        actionUrl: `/university/drives/${payload.driveId}/report`,
      },
      new_job_for_university: {
        title: ` New job for ${payload.branch} students`,
        body: `${payload.companyName} posted "${payload.jobTitle}" for ${payload.universityName} students.`,
        actionUrl: `/university/jobs/${payload.jobId}`,
      },
      campus_hiring_open: {
        title: "Campus Hiring Open",
        body: `${payload.universityName || "A university"} — ${payload.coursesSummary || "View campus hiring details."}`,
        actionUrl:
          payload.actionUrl ||
          `/recruiter/campus-hiring/create-job?university_id=${payload.universityId || ""}`,
      },

      // =============== SYSTEM NOTIFICATIONS ===============
      welcome_student: {
        title: `👋 Welcome to Job Portal!`,
        body: `Complete your profile to get job matches.`,
        actionUrl: `/profile`,
      },
      welcome_recruiter: {
        title: `👋 Welcome, Recruiter!`,
        body: `Post your first job in 2 minutes.`,
        actionUrl: `/dashboard/jobs/new`,
      },
      welcome_university: {
        title: `👋 Welcome, University Admin!`,
        body: `Register your first campus drive.`,
        actionUrl: `/university/drives/new`,
      },
      maintenance_alert: {
        title: `🔧 Scheduled maintenance`,
        body: `We'll be down for 30 mins on ${payload.date}.`,
        actionUrl: null,
      },

      // =============== CHAT NOTIFICATIONS ===============
      "chat:new_message": {
        title: `💬 New message`,
        body: `{{senderName}}: "{{preview}}"`,
        actionUrl: `/chat/{{conversationId}}`,
      },
      "chat:assignment_sent": {
        title: `📝 Assignment received`,
        body: `{{senderName}} sent you an assignment for "{{jobTitle}}"`,
        actionUrl: `/chat/{{conversationId}}`,
      },
      "chat:interview_invite": {
        title: `🎯 Interview scheduled`,
        body: `{{senderName}} invited you to interview for "{{jobTitle}}"`,
        actionUrl: `/chat/{{conversationId}}`,
      },
      "chat:assignment_submitted": {
        title: `📄 Assignment submitted`,
        body: `{{senderName}} submitted their assignment.`,
        actionUrl: `/chat/{{conversationId}}`,
      },
      "chat:batch_new_messages": {
        title: `✉️ {{count}} new messages`,
        body: `from {{senderName}}: "{{preview}}"`,
        actionUrl: `/chat/{{conversationId}}`,
      },
    };

    

    // return templates[type];
    const template = templates[type];
    if (!template) return null;

    // PLACEHOLDER REPLACEMENT — INSERT HERE
    const replacePlaceholders = (str) => {
      if (typeof str !== "string") return str;
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) =>
        payload[key] != null ? String(payload[key]) : ""
      );
    };

    return {
      title: replacePlaceholders(template.title),
      body: replacePlaceholders(template.body),
      actionUrl: template.actionUrl
        ? replacePlaceholders(template.actionUrl)
        : null,
    };
  }

  // =============== API Methods (for REST Controllers) ===============
  static async markAsRead(id, user_id) {
    return Notification.update({ is_read: true }, { where: { id, user_id } });
  }

  static async markAllAsRead(user_id) {
    return Notification.update(
      { is_read: true },
      { where: { user_id, is_read: false } }
    );
  }

  static async getUnreadCount(userId) {
    return Notification.count({
      where: { user_id: userId, is_read: false, is_archived: false },
    });
  }

  static async getForUser(userId, options = {}) {
    const { page = 1, limit = 20, status = "all", type, role } = options;

    const offset = (page - 1) * parseInt(limit);
    const where = { user_id: userId };

    if (status === "unread") where.is_read = false;
    if (status === "archived") where.is_archived = true;
    if (type) where.type = type;
    if (role) where.user_role = role;

    const result = await Notification.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
      attributes: [
        "id",
        "type",
        "title",
        "body",
        "action_url",
        "is_read",
        "created_at",
        "metadata",
        "user_role",
      ],
    });

    return {
      rows: result.rows,
      count: result.count,
      totalPages: Math.ceil(result.count / limit),
    };
  }
}

module.exports = NotificationService;
