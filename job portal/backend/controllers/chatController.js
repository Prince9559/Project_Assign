// File Path: /server/controllers/chatController.js

const {
  Conversation,
  ConversationParticipant,
  Message,
  User,
  MessageAttachment,
  UserDetail,
  Application,
  JobPost,
  CompanyRecruiterProfile,
  JobRole,
  Assignment,
  InterviewInvitation,
  AssignmentSubmission,
  AccessScope,
  JobAccess,
  UserAccessMembership
} = require("../models");
const { Op } = require("sequelize");
const db = require("../models");
const sequelize = db.sequelize;


const NotificationService = require('../services/notificationService');
const { sendInterviewEmail } = require('../services/emailService'); 

const { hasJobAccess } = require("../utils/jobAccessService");


// =============== HELPERS FOR NOTIFICATIONS ===============

// Tier 1: Critical (notify always, even if online)
const TIER_1_TYPES = ['assignment', 'interview_invite', 'offer', 'rejection'];
// Tier 2: Actionable (notify if offline)
const TIER_2_TYPES = ['assignment_submission', 'document', 'image'];

const getMessageTier = (messageType) => {
  if (TIER_1_TYPES.includes(messageType)) return 1;
  if (TIER_2_TYPES.includes(messageType)) return 2;
  return 3; // text, etc.
};

// Helper: Get unread text count in last 60 mins (for batching)
const getUnreadTextCountInWindow = async (userId, conversationId, windowMinutes = 60) => {
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
  return await Message.count({
    where: {
      conversation_id: conversationId,
      sender_id: { [Op.ne]: userId },
      message_type: 'text',
      created_at: { [Op.gte]: cutoff },
      is_deleted: false,
    },
  });
};


// =============== CHAT NOTIFICATION DISPATCHER ===============
const notifyParticipantsOnMessage = async (message, conversationId, io) => {
  if (!io || !message) return;

  //  Extract sender from `message.sender` — NOT from participant
  const sender = message.sender; // Already included via Message.findByPk(..., { include: [{ model: User, as: "sender" }] })
  if (!sender) {
    console.warn(`[Chat] Message ${message.id} has no sender — skipping notifications`);
    return;
  }

  const senderName = `${sender.first_name} ${sender.last_name || ""}`.trim();

  // Fetch all *active* participants (excluding sender)
  const participants = await ConversationParticipant.findAll({
    where: {
      conversation_id: conversationId,
      user_id: { [Op.ne]: message.sender_id }, // ← exclude sender
      is_active: true,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "user_role", "first_name", "last_name"],
      },
    ],
  });

  if (!participants.length) return;

  // Get users currently in this conversation room (socket presence)
  const roomName = `conversation_${conversationId}`;
  const roomSockets = io.sockets.adapter.rooms.get(roomName) || new Set();
  const userIdsInRoom = new Set();
  for (const socketId of roomSockets) {
    const socket = await io.in(socketId).fetchSockets();
    if (socket[0]?.userId) {
      userIdsInRoom.add(socket[0].userId);
    }
  }

  const tier = getMessageTier(message.message_type);

  for (const p of participants) {
    const userId = p.user_id;
    const userRole = p.user?.user_role || "STUDENT";

    const isOnlineInRoom = userIdsInRoom.has(userId);
    if (isOnlineInRoom && tier === 3) continue; // skip real-time text

    //  Build role-aware message body
    let notificationType = "chat:new_message";
    let title = `💬 New message`;
    let body = `"${senderName}": "${(message.content || "").substring(0, 50)}"`;
    let actionUrl = `/chat/${conversationId}`;
    let unreadCount=null;
    let metadata = message.metadata;

    // If it's a string, parse it
    if (typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
    }

    let jobTitle=metadata.job_title || "the role";


    //  Special handling per message_type + receiver role

    if (message.message_type === "assignment") {
      notificationType = "chat:assignment_sent";
      if (userRole === "STUDENT") {
        title = `📝 Assignment received`;
        body = `"${senderName}" sent you an assignment for "${jobTitle}"`;

      } else if (userRole === "COMPANY") {
        title = `📄 Assignment sent`;
        body = `"${senderName}" sent an assignment to the candidate`;
      }
    } else if (message.message_type === "interview_invite") {
      notificationType = "chat:interview_invite";
      if (userRole === "STUDENT") {
        title = `🎯 Interview scheduled`;
        body = `"${senderName}" invited you to interview for "${jobTitle}"`;
      } else if (userRole === "COMPANY") {
        title = `📞 Interview scheduled`;
        body = `"${senderName}" scheduled an interview with the candidate`;
      }
    } else if (message.message_type === "assignment_submission") {
      notificationType = "chat:assignment_submitted";
      if (userRole === "COMPANY") {
        title = `✅ Assignment submitted`;
        body = `"${senderName}" submitted their assignment for "${jobTitle}"`;
      } else if (userRole === "STUDENT") {
        title = `📤 Assignment submitted`;
        body = `You submitted your assignment for "${jobTitle}"`;
      }
    } else if (message.message_type === "text" && tier === 3) {
      unreadCount = await getUnreadTextCountInWindow(userId, conversationId, 60);
      if (unreadCount >= 5) {
        notificationType = "chat:batch_new_messages";
        title = `✉️ ${unreadCount} new messages`;
        body = `from "${senderName}": "${(message.content || "").substring(0, 50)}"`;
      }
    }

    try {
      await NotificationService.send(userId, userRole, notificationType, {
        senderName,
        preview: (message.content || "").substring(0, 50),
        conversationId,
        jobTitle: jobTitle,
        count: unreadCount,
      });
    } catch (err) {
      console.warn(`[Chat] Failed to notify user ${userId}:`, err.message);
    }
  }
};





const emitNewMessageToConversation = async (message, conversationId, io) => {
  if (!io || !message) return;

  console.log("emitting new message to conversation function runing", message);

  try {
    // Fetch sender
    const sender = await User.findByPk(message.sender_id, {
      attributes: ["id", "first_name", "last_name", "email"],
    });

    // Fetch attachments (if any)
    let attachments = [];
    if (["document", "image", "assignment"].includes(message.message_type)) {
      attachments = await MessageAttachment.findAll({
        where: { message_id: message.id },
        attributes: ["id", "file_name", "file_path", "file_type", "file_size"],
      });
    }

    const payload = {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender_type: message.sender_type,
      message_type: message.message_type,
      content: message.content,
      metadata: message.metadata,
      created_at: message.created_at,
      is_deleted: message.is_deleted || false,
      //  Full sender object
      sender: sender
        ? {
            id: sender.id,
            first_name: sender.first_name,
            last_name: sender.last_name,
            email: sender.email,
          }
        : null,
      //  Attachments included
      attachments: attachments.map((att) => att.toJSON()),
    };

    console.log("emmiting for", payload.content);

    io.to(`conversation_${conversationId}`).emit("new_message", payload);
  } catch (error) {
    console.error("Error emitting message:", error);
  }
};

// ==================== CREATE OR GET CONVERSATION ====================


// ==================== GET USER'S CONVERSATIONS (ENHANCED) ====================
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch conversations with participants, messages, and linked application/job data
    const conversationsResult = await Conversation.findAndCountAll({
      where: { is_archived: false },
      include: [
        // Ensure user is a participant
        // {
        //   model: ConversationParticipant,
        //   as: "participants",
        //   where: { user_id: userId, is_active: true },
        //   required: true,
        // },
        // Include all participants + their user info
        {
          model: ConversationParticipant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email"],
            },
          ],
        },
        // Latest message
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["created_at", "DESC"]],
          separate: true,
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "first_name", "last_name", "email"],
            },
          ],
        },
        //  Link to Application → JobPost → JobRole + CompanyRecruiterProfile
        {
          model: Application,
          as: "application", // Ensure your Conversation model has 'application' association via job_application_id
          attributes: ["id", "status"],
          include: [
            {
              model: JobPost,
              as: "jobPost",
              attributes: ["job_id", "job_role_id"],
              include: [
                {
                  model: JobRole,
                  as: "JobRole",
                  attributes: ["title"],
                },
                {
                  model: CompanyRecruiterProfile,
                  as: "CompanyRecruiterProfile",
                  include: [
                    {
                      model: User,
                      as: "user",
                      attributes: ["id", "first_name", "last_name", "email"],
                    },
                  ],
                },
              ],
            },
            {
              model: UserDetail,
              as: "user", // matches Application.belongsTo(UserDetail, { as: 'user' })
              attributes: ["user_id"], // we don't need UserDetail fields if name is in User
              include: [
                {
                  model: User,
                  as: "User", // matches UserDetail.belongsTo(User, { as: 'user' })
                  attributes: ["id", "first_name", "last_name", "email"],
                },
              ],
            },
          ],
        },
      ],
      order: [["last_message_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });


    // filter: only keep conversations where user is an active participant
    const validConversations = conversationsResult.rows.filter((conv) =>
      conv.participants.some((p) => p.user_id === userId && p.is_active)
    );

    // Enrich each conversation with contextual metadata
    const enrichedConversations = await Promise.all(
      validConversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.user_id === userId);
        const otherParticipant = conv.participants.find(
          (p) => p.user_id !== userId
        );

        if (!participant || !otherParticipant) {
          // Should not happen due to filter, but be safe
          return null;
        }
        // Unread count
        const unreadCount = await Message.count({
          where: {
            conversation_id: conv.id,
            sender_id: { [Op.ne]: userId },
            created_at: {
              [Op.gt]: participant.last_read_at || new Date(0),
            },
            is_deleted: false,
          },
        });

        // Extract job/application context
        let jobRoleTitle = null;
        let companyName = null;
        let applicantName = null;
        let recruiterName = null;
        let jobPostId = null;
        let applicationStatus = conv.application?.status || null;

        if (conv.application) {
          jobRoleTitle =
            conv.application.jobPost?.JobRole?.title ||
            conv.application.jobPost?.title ||
            "N/A";
          jobPostId = conv.application.jobPost?.job_id || null;

          // Recruiter info
          const recruiterUser =
            conv.application.jobPost?.CompanyRecruiterProfile?.user;
          recruiterName = recruiterUser
            ? `${recruiterUser.first_name} ${recruiterUser.last_name}`
            : "Recruiter";

          companyName =
            conv.application.jobPost?.CompanyRecruiterProfile?.company_name || "N/A";

          // Applicant info
          // const applicantUser = conv.application?.user?.User; // UserDetail.user → User
          const userDetail = conv.application?.user; // This is UserDetail instance
          const applicantUser = userDetail?.User;
          const applicantName = applicantUser
            ? `${applicantUser.first_name} ${applicantUser.last_name}`
            : "Applicant";
        }

        // Determine display name based on user role
        const displayName =
          req.user.role === "STUDENT" ? recruiterName : applicantName;

        return {
          ...conv.toJSON(),
          unreadCount,
          context: {
            jobRoleTitle,
            jobPostId,
            applicationStatus,
            otherParticipant: {
              id: otherParticipant?.user_id,
              name: displayName,
              email: otherParticipant?.user?.email || null,
            },
            applicant: {
              id: conv.application?.user?.id,
              name: applicantName,
              email: conv.application?.user?.email,
            },
            recruiter: {
              id: conv.application?.jobPost?.CompanyRecruiterProfile?.user?.id,
              name: recruiterName,
              email:
                conv.application?.jobPost?.CompanyRecruiterProfile?.user?.email,
            },
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations: enrichedConversations,
      total: conversationsResult.count,
      page: parseInt(page),
      totalPages: Math.ceil(conversationsResult.count / limit),
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
};

// ==================== GET MESSAGES ====================
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.findAndCountAll({
      where: {
        conversation_id: conversationId,
        is_deleted: false,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: MessageAttachment,
          as: "attachments",
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      messages: messages.rows.reverse(), // Reverse to show oldest first
      total: messages.count,
      page: parseInt(page),
      totalPages: Math.ceil(messages.count / limit),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// ==================== SEND MESSAGE (REST API BACKUP) ====================
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      content,
      messageType = "text",
      metadata = null,
    } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;

    // Verify participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
        is_active:true,
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send message",
      });
    }

    // Create message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: req.user.role,
      message_type: messageType,
      content: content,
      metadata: metadata,
    });

    // Update conversation
    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id: conversationId } }
    );

    // Fetch message with details
     const messageWithDetails = await Message.findByPk(message.id, {
       include: [
         {
           model: User,
           as: "sender",
           attributes: ["id", "first_name", "last_name"],
         },
         { model: MessageAttachment, as: "attachments" },
       ],
     });

     const io = req.app.get("io");
     if (io) {
       emitNewMessageToConversation(messageWithDetails, conversationId, io);

       console.log("sending a notification", messageWithDetails);
       await notifyParticipantsOnMessage(
         messageWithDetails,
         conversationId,
         io
       );
     }

    res.status(201).json({
      success: true,
      message: messageWithDetails,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ==================== MARK CONVERSATION AS READ ====================
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await ConversationParticipant.update(
      { last_read_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          user_id: userId,
          is_active:true
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as read",
      error: error.message,
    });
  }
};

// ==================== GET UNREAD COUNT ====================
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations user is part of
    const conversations = await ConversationParticipant.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ["conversation_id", "last_read_at"],
    });

    let totalUnread = 0;

    for (const conv of conversations) {
      const unreadCount = await Message.count({
        where: {
          conversation_id: conv.conversation_id,
          sender_id: { [Op.ne]: userId },
          created_at: {
            [Op.gt]: conv.last_read_at || new Date(0),
          },
          is_deleted: false,
        },
      });
      totalUnread += unreadCount;
    }

    res.status(200).json({
      success: true,
      unreadCount: totalUnread,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

// ==================== UPLOAD CHAT FILE ====================
const uploadChatFile = async (req, res) => {
  try {
    
    //  File is already parsed by multer middleware (from routes)
    const file = req.files?.find((f) => f.fieldname === "chatFile");
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No chatFile uploaded",
      });
    }

    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    const userId = req.user.id;

    //  Verify user is a participant in the conversation
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
        is_active: true,
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload files to this conversation",
      });
    }

    //  Create message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      sender_type: req.user.role,
      message_type: "document",
      content: file.originalname,
      metadata: {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // 📎 Create attachment record
    await MessageAttachment.create({
      message_id: message.id,
      file_name: file.originalname,
      file_path: file.path,
      file_type: file.mimetype,
      file_size: file.size,
    });

    const messageWithDetails = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "first_name", "last_name"],
        },
        { model: MessageAttachment, as: "attachments" },
      ],
    });

    const io = req.app.get("io");
    if (io) {
      emitNewMessageToConversation(messageWithDetails, conversationId, io);
      console.log("sending a notification", messageWithDetails);
      await notifyParticipantsOnMessage(messageWithDetails, conversationId, io);
    }

    //  Return full metadata
    return res.status(201).json({
      success: true,
      message: messageWithDetails,
      data: {
        messageId: message.id,
        fileUrl: file.path.replace(/\\/g, "/"),
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error in uploadChatFile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload chat file",
      error: error.message,
    });
  }
};

// ==================== SEND ASSIGNMENT VIA CHAT ====================
const sendAssignmentViaChat = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      application_id,
      message,
      deadline,
      assignment_url,
      file_name,
      file_type,
      file_size,
    } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Validation
    if (currentUserRole !== "COMPANY") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Only recruiters can send assignments",
      });
    }

    if (!application_id || !message || !assignment_url || !file_name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: application_id, message, assignment_url, file_name",
      });
    }

    // Fetch application with job post and recruiter
    const application = await Application.findOne({
      where: { id: application_id },
      include: [
        {
          model: JobPost,
          as: "jobPost",
          include: [
            {
              model: CompanyRecruiterProfile,
              as: "CompanyRecruiterProfile",
              attributes: ["id","user_id"],
            },
            {
                      model: JobRole,
                      attributes: ["title"],
                    },
          ],
        },
      ],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!application.jobPost?.CompanyRecruiterProfile) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Job post or recruiter profile not found",
      });
    }


    const recruiterUserId = application.jobPost.CompanyRecruiterProfile.user_id;
    if (req.user.role === "COMPANY") {
      const access = await hasJobAccess(currentUserId, application.job_post_id);
      if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to send assignment",
        });
      }
    }

    const applicant = await User.findOne({
      where: { id: application.user_id },
    });
    if (!applicant) {
      return res
        .status(400)
        .json({ error: "Invalid user associated with the application" });
    }

    const fullName = `${applicant.first_name} ${
      applicant.last_name || ""
    }`.trim();
    const applicantEmail = applicant.email;

    // 1. Create Assignment
    const assignment = await Assignment.create(
      {
        user_id: application.user_id,
        job_post_id: application.job_post_id,
        application_id: application.id,
        message,
        deadline,
        assignment_url,
        name: fullName, // or fetch applicant name if needed
      },
      { transaction }
    );

    await application.update({ status: "Send Assignment" }, { transaction });

    // 2. Get or create conversation
    let conversation = await Conversation.findOne({
      where: { job_application_id: application_id },
      transaction,
    });

    if (!conversation) {
      conversation = await Conversation.create(
        {
          type: "job_application",
          job_application_id: application_id,
          last_message_at: new Date(),
        },
        { transaction }
      );
    }

    
    // adding all thembers who have permisison to the job
    //  Get job access participants + owner + applicant
    const companyId = application.jobPost?.CompanyRecruiterProfile?.id;
    const job_id = application.job_post_id;
    const jobTitle= application.jobPost?.JobRole?.title;

    let participantUserIds = [application.user_id]; // Applicant

    // Add owner
    const owner = await UserAccessMembership.findOne({
      where: { scope_id: companyId, is_primary: true, status: "active" },
      attributes: ["user_id"],
      transaction,
    });
    if (owner) participantUserIds.push(owner.user_id);

    // Add job_access users
    const accessUsers = await JobAccess.findAll({
      where: { job_id },
      attributes: ["user_id"],
      transaction,
    });
    participantUserIds = [
      ...new Set([
        ...participantUserIds,
        ...accessUsers.map((a) => a.user_id),
        currentUserId, // ensure current user is included
      ]),
    ];

    // Add missing participants
    const existing = await ConversationParticipant.findAll({
      where: {
        conversation_id: conversation.id,
        user_id: { [Op.in]: participantUserIds },
      },
      attributes: ["user_id"],
      transaction,
    });

    const existingIds = new Set(existing.map((p) => p.user_id));
    const toAdd = participantUserIds
      .filter((id) => !existingIds.has(id))
      .map((id) => ({
        conversation_id: conversation.id,
        user_id: id,
        user_type: id === application.user_id ? "STUDENT" : "COMPANY",
        last_read_at: id === application.user_id ? null : new Date(),
        is_active: true,
      }));

    if (toAdd.length > 0) {
      await ConversationParticipant.bulkCreate(toAdd, { transaction });
    }

    // 3. Create assignment message
    const assignmentMessage = await Message.create(
      {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        sender_type: "COMPANY",
        message_type: "assignment",
        content: message,
        metadata: {
          assignment_id: assignment.id,
          deadline,
          assignment_url,
          file_name,
          file_type: file_type || "application/octet-stream",
          file_size: file_size || null,
          job_title:jobTitle
        },
      },
      { transaction }
    );

    await transaction.commit();

    // 4. Update conversation timestamp
    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id: conversation.id } },
      // { transaction }
    );

    // Fetch message with sender for response
    const messageWithSender = await Message.findByPk(assignmentMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "first_name", "last_name"],
        },
        { model: MessageAttachment, as: "attachments" },
      ],
    });

    const io = req.app.get("io");
    if (io) {
      emitNewMessageToConversation(messageWithSender, conversation.id, io);
      console.log("sending a notification", messageWithSender);
      await notifyParticipantsOnMessage(messageWithSender, conversation.id, io);
    }
  

    return res.status(201).json({
      success: true,
      message: messageWithSender,
      assignment_id: assignment.id,
    });
  } catch (error) {
    
    console.error("Error in sendAssignmentViaChat:", error);
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Failed to send assignment via chat",
      error: error.message,
    });
  }
};

// ==================== SEND INTERVIEW INVITE VIA CHAT ====================

const sendInterviewViaChat = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      application_id,
      message,
      interview_type,
      interview_date,
      start_time,
      end_time,
      video_link,
      phone_number,
      office_address,
    } = req.body;

    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // === 1. Authorization & Input Validation ===
    if (currentUserRole !== "COMPANY") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Only recruiters can send interview invites",
      });
    }

    if (
      !application_id ||
      !message ||
      !interview_type ||
      !interview_date ||
      !start_time
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: application_id, message, interview_type, interview_date, start_time",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(interview_date)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "interview_date must be in YYYY-MM-DD format",
      });
    }

    // Validate time format (24h HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start_time)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "start_time must be in 24-hour HH:mm format (e.g., '14:30')",
      });
    }
    // Optional: validate end_time if provided
    if (end_time && !timeRegex.test(end_time)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "end_time must be in 24-hour HH:mm format (e.g., '15:30')",
      });
    }

    // === 2. Fetch Application with FULL includes ===
    const application = await Application.findOne({
      where: { id: application_id },
      include: [
        {
          model: JobPost,
          as: "jobPost",
          include: [
            {
              model: CompanyRecruiterProfile,
              as: "CompanyRecruiterProfile",
              attributes: ["id","user_id", "company_name"],
            },
            {
              model: JobRole,
              as: "JobRole",
              attributes: ["title"],
            },
          ],
        },
        {
          model: UserDetail,
          as: "user",
          attributes: ["first_name", "last_name"],
          include: [
            {
              model: User,
              attributes: ["email"], // ← CRITICAL: needed for email
            },
          ],
        },
      ],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (req.user.role === "COMPANY") {
      const access = await hasJobAccess(req.user.id, application.job_post_id);
      if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to schedule interviews",
        });
      }
    }

    // === 3. Extract & normalize data ===
    const user = application.user;
    const jobPost = application.jobPost;
    const userEmail = user?.User?.email;
    const fullName = `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim();

    // Guard: email is mandatory for email + notification
    if (!userEmail) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Candidate email not found. Cannot proceed.",
      });
    }

    // Normalize interview type
    let cleanInterviewType = (interview_type || "").trim().toLowerCase();
    if (cleanInterviewType.includes("video")) cleanInterviewType = "Video call";
    else if (
      cleanInterviewType.includes("phone") ||
      cleanInterviewType.includes("call")
    )
      cleanInterviewType = "Phone";
    else if (
      cleanInterviewType.includes("office") ||
      cleanInterviewType.includes("in")
    )
      cleanInterviewType = "In-office";
    else cleanInterviewType = "In-office";

    // Conditional field validation
    if (
      cleanInterviewType === "Video call" &&
      (!video_link || !video_link.trim())
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "video_link is required for Video call interviews.",
      });
    }
    if (
      cleanInterviewType === "Phone" &&
      (!phone_number || !phone_number.trim())
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "phone_number is required for Phone interviews.",
      });
    }
    if (
      cleanInterviewType === "In-office" &&
      (!office_address || !office_address.trim())
    ) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "office_address is required for In-office interviews.",
      });
    }

    // === 4. Create Interview Invitation (in transaction) ===
    const interview = await InterviewInvitation.create(
      {
        application_id: application.id,
        name: fullName,
        message,
        interview_type: cleanInterviewType,
        interview_date,
        start_time,
        end_time: end_time || null,
        video_link:
          cleanInterviewType === "Video call" ? video_link?.trim() : null,
        phone_number:
          cleanInterviewType === "Phone" ? phone_number?.trim() : null,
        office_address:
          cleanInterviewType === "In-office" ? office_address?.trim() : null,
      },
      { transaction }
    );

    // Update application status
    await application.update({ status: "Interview" }, { transaction });

    // === 5. Conversation setup ===
    let conversation = await Conversation.findOne({
      where: { job_application_id: application_id },
      transaction,
    });

    if (!conversation) {
      conversation = await Conversation.create(
        {
          type: "job_application",
          job_application_id: application_id,
          last_message_at: new Date(),
        },
        { transaction }
      );
    }

    
    // Now will crate bulk members in the chat
    //  Get job access participants + owner + applicant
    const companyId = application.jobPost.CompanyRecruiterProfile?.id;
    const job_id = application.job_post_id;

    let participantUserIds = [application.user_id]; // Applicant

    // Add owner
    const owner = await UserAccessMembership.findOne({
      where: { scope_id: companyId, is_primary: true, status: "active" },
      attributes: ["user_id"],
      transaction,
    });
    if (owner) participantUserIds.push(owner.user_id);

    // Add job_access users
    const accessUsers = await JobAccess.findAll({
      where: { job_id },
      attributes: ["user_id"],
      transaction,
    });
    participantUserIds = [
      ...new Set([
        ...participantUserIds,
        ...accessUsers.map((a) => a.user_id),
        currentUserId, // ensure current user is included
      ]),
    ];

    // Add missing participants
    const existing = await ConversationParticipant.findAll({
      where: {
        conversation_id: conversation.id,
        user_id: { [Op.in]: participantUserIds },
      },
      attributes: ["user_id"],
      transaction,
    });

    const existingIds = new Set(existing.map((p) => p.user_id));
    const toAdd = participantUserIds
      .filter((id) => !existingIds.has(id))
      .map((id) => ({
        conversation_id: conversation.id,
        user_id: id,
        user_type: id === application.user_id ? "STUDENT" : "COMPANY",
        last_read_at: id === application.user_id ? null : new Date(),
        is_active: true,
      }));

    if (toAdd.length > 0) {
      await ConversationParticipant.bulkCreate(toAdd, { transaction });
    }

    // === 6. Build message metadata ===
    const metadata = {
      interview_id: interview.id,
      interview_type: cleanInterviewType,
      interview_date,
      start_time,
      end_time: end_time || null,
      name: fullName,
      job_title:jobPost?.JobRole?.title || "Job Role",
    };
    if (cleanInterviewType === "Video call")
      metadata.video_link = video_link?.trim();
    if (cleanInterviewType === "Phone")
      metadata.phone_number = phone_number?.trim();
    if (cleanInterviewType === "In-office")
      metadata.office_address = office_address?.trim();

    // Create message
    const interviewMessage = await Message.create(
      {
        conversation_id: conversation.id,
        sender_id: currentUserId,
        sender_type: "COMPANY",
        message_type: "interview_invite",
        content: message,
        metadata,
      },
      { transaction }
    );

    await transaction.commit();

    // === 7. Prepare formatted date/time (safe) ===
    const interviewTime = new Date(`${interview_date}T${start_time}`);
    // Double-check validity (shouldn’t fail now due to validation, but safe)
    if (isNaN(interviewTime.getTime())) {
      console.error("Invalid interview datetime constructed:", {
        interview_date,
        start_time,
      });
      return res.status(500).json({
        success: false,
        message:
          "Failed to format interview time. Please check date/time format.",
      });
    }

    const formattedDate = interviewTime.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }); // e.g., "5 Dec 2025"
    const formattedTime = interviewTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // e.g., "02:30 PM"

    // === 8. Services: Safe data passing ===
    const jobTitle = jobPost?.JobRole.title || "the position";
    const companyName =
      jobPost?.CompanyRecruiterProfile?.company_name || "the company";

    //  Push Notification
    await NotificationService.send(
      application.user_id,
      "STUDENT",
      "interview_scheduled_student",
      {
        jobTitle,
        date: interview_date,
        time: formattedTime,
        applicationId: application.id,
      }
    );

    //  Email (all fields now safe)
    await sendInterviewEmail(userEmail, "scheduled", {
      studentName: fullName || "Candidate",
      companyName,
      jobTitle,
      date: formattedDate,
      time: formattedTime,
      interviewType: cleanInterviewType,
      videoLink:
        cleanInterviewType === "Video call" ? video_link?.trim() : undefined,
      phoneNumber:
        cleanInterviewType === "Phone" ? phone_number?.trim() : undefined,
      officeAddress:
        cleanInterviewType === "In-office" ? office_address?.trim() : undefined,
      applicationId: application.id,
    });

    // Optional audit: mark email sent (non-transactional)
    await interview.update({ scheduled_notification_sent_at: new Date() });

    // Update conversation timestamp (outside tx)
    await Conversation.update(
      { last_message_at: new Date() },
      { where: { id: conversation.id } }
    );

    // Real-time emit
    const messageWithSender = await Message.findByPk(interviewMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    const io = req.app.get("io");
    if (io && messageWithSender && conversation) {
      emitNewMessageToConversation(messageWithSender, conversation.id, io);
      console.log("sending a notification", messageWithSender);
      notifyParticipantsOnMessage(messageWithSender, conversation.id, io);
    }

    return res.status(201).json({
      success: true,
      data: {
        interview_id: interview.id,
        message_id: interviewMessage.id,
        conversation_id: conversation.id,
      },
      message: messageWithSender,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Critical error in sendInterviewViaChat:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send interview invite",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// =========================Submit assignment via chat (student)============
// File: /controllers/assignmentSubmissionController.js
const submitAssignment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      assignment_id,
      text_response,
      file_url,     // ← pre-uploaded URL (from /api/upload)
      file_name,    // optional, for metadata
      file_type,    // e.g., "application/pdf"
      file_size,    // in bytes
    } = req.body;

    const studentId = req.user.id;
    const studentRole = req.user.role;

    //  Validation
    if (studentRole !== 'STUDENT') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments',
      });
    }

    if (!assignment_id) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'assignment_id is required',
      });
    }

    //  Fetch assignment with full context
    const assignment = await Assignment.findByPk(assignment_id, {
      include: [
        {
          model: Application,
          include: [
            {
              model: JobPost,
              as: 'jobPost',
              include: [
                {
                  model: CompanyRecruiterProfile,
                  as: 'CompanyRecruiterProfile',
                },
                {
                  model:JobRole,
                  attributes: ["id", "title"]
                }
              ],
            },
            {
              model: Conversation,
              as: 'conversation',
            },
          ],
        },
      ],
      transaction,
    });

    if (!assignment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.user_id !== studentId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit this assignment',
      });
    }

    const application = assignment.Application;
    const jobPost = application.jobPost;
    const recruiterProfile = jobPost?.CompanyRecruiterProfile;
    const recruiterUserId = recruiterProfile?.user_id;
    const jobTitle= jobPost?.JobRole?.title;

    if (!recruiterUserId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Recruiter user ID not found for this assignment',
      });
    }

    // 1. Save submission
    const submission = await AssignmentSubmission.create(
      {
        assignment_id: assignment.id,
        student_id: studentId,
        text_response: text_response || null,
        file_url: file_url || null,
      },
      { transaction }
    );

    //  2. Get or create conversation
    let conversation = application.conversation;
    if (!conversation) {
      conversation = await Conversation.create(
        {
          type: 'job_application',
          job_application_id: application.id,
          last_message_at: new Date(),
        },
        { transaction }
      );

      // Add participants using `user_id` (student + recruiter)
      await ConversationParticipant.bulkCreate(
        [
          {
            conversation_id: conversation.id,
            user_id: studentId,
            user_type: 'STUDENT',
            last_read_at: null,
          },
          {
            conversation_id: conversation.id,
            user_id: recruiterUserId, //  user_id, not company_id
            user_type: 'COMPANY',
            last_read_at: null,
          },
        ],
        { transaction }
      );
    }

    //  3. Create submission message
    const submissionMessage = await Message.create(
      {
        conversation_id: conversation.id,
        sender_id: studentId,
        sender_type: 'STUDENT',
        message_type: 'assignment_submission',
        content: text_response || 'Submitted assignment.',
        metadata: {
          submission_id: submission.id,
          assignment_id: assignment.id,
          file_url: file_url || null,
          file_name: file_name || null,
          file_type: file_type || null,
          file_size: file_size || null,
          job_title: jobTitle
        },
      },
      { transaction }
    );

    //  4. Update conversation timestamp
    await conversation.update(
      { last_message_at: new Date() },
      { transaction }
    );

    await transaction.commit();

    //  Emit via WebSocket (reuse your `emitNewMessageToConversation`)
    const io = req.app.get('io');
    if (io) {
      const fullMessage = await db.Message.findByPk(submissionMessage.id, {
        include: [
          {
            model: db.User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name'],
          },
        ],
      });
      emitNewMessageToConversation(fullMessage, conversation.id, io);

      console.log("sending a notification", fullMessage);
      await notifyParticipantsOnMessage(fullMessage, conversation.id, io);
    }

    return res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: {
        id: submission.id,
        assignment_id: submission.assignment_id,
        student_id: submission.student_id,
        text_response: submission.text_response,
        file_url: submission.file_url,
        submitted_at: submission.submitted_at,
      },
      message_id: submissionMessage.id,
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error in submitAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message,
    });
  }
};







// ==================== CREATE OR GET CONVERSATION (RACE-PROOF, MYSQL-SAFE) ====================
const createOrGetConversation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { jobApplicationId, type = "job_application" } = req.body; //  future: allow type override
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    if (!jobApplicationId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "jobApplicationId is required",
      });
    }

    // Validate type (allow extensibility, but restrict for now)
    const allowedTypes = ["job_application"];
    if (!allowedTypes.includes(type)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid conversation type. Allowed: ${allowedTypes.join(
          ", "
        )}`,
      });
    }

    // Fetch application with job post and its associations
    const application = await Application.findOne({
      where: { id: jobApplicationId },
      include: [
        {
          model: JobPost,
          as: "jobPost",
          include: [
            {
              model: CompanyRecruiterProfile,
              as: "CompanyRecruiterProfile",
              attributes: ["id", "user_id"],
            },
            {
              model: JobRole,
              as: "JobRole",
              attributes: ["title"],
            },
          ],
        },
      ],
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!application.jobPost) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Job post not found for this application",
      });
    }

    const { jobPost } = application;
    const companyId = jobPost.CompanyRecruiterProfile?.id;
    const applicantId = application.user_id;

    const isStudent = currentUserRole === "STUDENT";
    const isRecruiter = currentUserRole === "COMPANY";

    // Role checks
    if (isStudent && currentUserId !== applicantId) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ success: false, message: "Not your application" });
    }

    if (currentUserRole === "COMPANY") {
      //  NEW: Check job access instead of direct ownership
      const access = await hasJobAccess(currentUserId, jobPost.job_id);
      if (!access.hasAccess) {
        await transaction.rollback();
        return res
          .status(403)
          .json({
            success: false,
            message: "You do not have access to this job application",
          });
      }
    }

    // const checkCompanyAccess = async (userId, jobId) => {
    //   if (req.user.role !== "COMPANY") return true; // Skip for non-COMPANY

    //   const access = await hasJobAccess(userId, jobId);
    //   return access.hasAccess;
    // };

    // let otherParticipantId = null;

    // if (isStudent) {
    //   if (application.user_id !== currentUserId) {
    //     await transaction.rollback();
    //     return res.status(403).json({
    //       success: false,
    //       message: "You are not the applicant for this application",
    //     });
    //   }
    //   otherParticipantId = jobPost.CompanyRecruiterProfile?.user_id;
    // } else if (isRecruiter) {
    //     const hasAccess = await checkCompanyAccess(currentUserId,jobPost.job_id);
    //     if (!hasAccess) {
    //       await transaction.rollback();
    //       return res.status(403).json({
    //         success: false,
    //         message: "You do not have access to this job application",
    //       });
    //     }
    //     otherParticipantId = application.user_id;
    // } else {
    //   await transaction.rollback();
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only students and company recruiters can start chats",
    //   });
    // }

    // if (!otherParticipantId) {
    //   await transaction.rollback();
    //   return res.status(400).json({
    //     success: false,
    //     message: "Could not determine the other participant",
    //   });
    // }

    // RACE-PROOF: Find → Create → Handle Duplicate Key → Retry Find
    let conversation;
    let created = false;

    try {
      //  Step 1: Try to find existing
      conversation = await Conversation.findOne({
        where: {
          job_application_id: jobApplicationId,
          type: type,
        },
        transaction,
      });

      if (conversation) {
        console.log(
          `[Chat] Found existing conversation ${conversation.id} for app ${jobApplicationId}`
        );
        created = false;
      } else {
        //  Step 2: Try to create
        conversation = await Conversation.create(
          {
            type: type,
            job_application_id: jobApplicationId,
            last_message_at: new Date(),
          },
          { transaction }
        );
        created = true;
        console.log(`[Chat] Created new conversation ${conversation.id}`);
      }
    } catch (error) {
      // Step 3: Handle MySQL duplicate key error (code 'ER_DUP_ENTRY')
      if (error.parent && error.parent.code === "ER_DUP_ENTRY") {
        console.warn(
          `[Chat] MySQL duplicate key — conversation created concurrently. Retrying find...`
        );

        // Re-fetch — must exist now
        conversation = await Conversation.findOne({
          where: {
            job_application_id: jobApplicationId,
            type: type,
          },
          transaction,
        });

        if (!conversation) {
          throw new Error(
            "Unique constraint violated but conversation not found — DB inconsistency"
          );
        }
        created = false;
      } else {
        throw error; // re-throw non-duplicate errors
      }
    }

    //  Step 4: Ensure participants exist (robustness)
    // const [currentParticipant, otherParticipantRecord] = await Promise.all([
    //   ConversationParticipant.findOne({
    //     where: { conversation_id: conversation.id, user_id: currentUserId },
    //     transaction,
    //   }),
    //   ConversationParticipant.findOne({
    //     where: { conversation_id: conversation.id, user_id: otherParticipantId },
    //     transaction,
    //   }),
    // ]);

    // const participantsToCreate = [];

    // // Add current user if missing
    // if (!currentParticipant) {
    //   participantsToCreate.push({
    //     conversation_id: conversation.id,
    //     user_id: currentUserId,
    //     user_type: currentUserRole,
    //     last_read_at: new Date(),
    //     is_active: true,
    //   });
    // }

    // // Add other user if missing
    // if (!otherParticipantRecord) {
    //   participantsToCreate.push({
    //     conversation_id: conversation.id,
    //     user_id: otherParticipantId,
    //     user_type: isStudent ? "COMPANY" : "STUDENT",
    //     last_read_at: null,
    //     is_active: true,
    //   });
    // }

    // let recruiterIds = [];

    // if (currentUserRole === "COMPANY") {
    //   // Get scope_id from company_recruiter_profile_id
    //   const scope = await AccessScope.findOne({
    //     where: {
    //       scope_type: "COMPANY",
    //       scope_id: companyId,
    //     },
    //     transaction,
    //   });

    //   if (scope) {
    //     // Get all active members of this company
    //     const memberships = await UserAccessMembership.findAll({
    //       where: {
    //         scope_id: scope.id,
    //         status: "active",
    //       },
    //       attributes: ["user_id"],
    //       transaction,
    //     });
    //     recruiterIds = memberships.map((m) => m.user_id);
    //   }
    // } else {
    //   // Student case: add the main recruiter (for backward compat)
    //   recruiterIds = [jobPost.CompanyRecruiterProfile?.user_id].filter(
    //     Boolean
    //   );
    // }

    // // Ensure current user and applicant are included
    // recruiterIds = [...new Set([...recruiterIds, currentUserId])];
    // const allParticipantIds = [...new Set([...recruiterIds, applicantId])];

    // // Find existing participants
    // const existingParticipants = await ConversationParticipant.findAll({
    //   where: {
    //     conversation_id: conversation.id,
    //     user_id: { [Op.in]: allParticipantIds },
    //   },
    //   attributes: ["user_id"],
    //   transaction,
    // });

    // const existingUserIds = new Set(
    //   existingParticipants.map((p) => p.user_id)
    // );
    // const participantsToCreate = [];

    // allParticipantIds.forEach((userId) => {
    //   if (!existingUserIds.has(userId)) {
    //     const isRecruiter = recruiterIds.includes(userId);
    //     participantsToCreate.push({
    //       conversation_id: conversation.id,
    //       user_id: userId,
    //       user_type: isRecruiter ? "COMPANY" : "STUDENT",
    //       last_read_at: isRecruiter ? new Date() : null,
    //       is_active: true,
    //     });
    //   }
    // });

    //Till here the person has access to the job and to chat and also a converstaion has been created or already exist

    // ✅ CRITICAL: Get ONLY users with job access + Owner + Applicant
    let participantUserIds = [applicantId]; // Always include applicant

    // Add company owner
    const ownerMembership = await UserAccessMembership.findOne({
      where: {
        scope_id: companyId,
        is_primary: true,
        status: "active",
      },
      attributes: ["user_id"],
      transaction,
    });
    if (ownerMembership) {
      participantUserIds.push(ownerMembership.user_id);
    }

    // Add users with explicit job_access
    const jobAccessUsers = await JobAccess.findAll({
      where: { job_id: jobPost.job_id },
      attributes: ["user_id"],
      transaction,
    });
    const accessUserIds = jobAccessUsers.map((ja) => ja.user_id);
    participantUserIds = [
      ...new Set([...participantUserIds, ...accessUserIds]),
    ];

    // Ensure current user is included (for edge cases)
    if (currentUserRole === "COMPANY") {
      participantUserIds = [...new Set([...participantUserIds, currentUserId])];
    }

    // Find existing participants
    const existingParticipants = await ConversationParticipant.findAll({
      where: {
        conversation_id: conversation.id,
        user_id: { [Op.in]: participantUserIds },
      },
      attributes: ["user_id"],
      transaction,
    });

    const existingUserIds = new Set(existingParticipants.map((p) => p.user_id));
    const participantsToCreate = [];

    participantUserIds.forEach((userId) => {
      if (!existingUserIds.has(userId)) {
        const isRecruiter = userId !== applicantId;
        participantsToCreate.push({
          conversation_id: conversation.id,
          user_id: userId,
          user_type: isRecruiter ? "COMPANY" : "STUDENT",
          last_read_at: isRecruiter ? new Date() : null,
          is_active: true,
        });
      }
    });

    if (participantsToCreate.length > 0) {
      console.log(
        `[Chat] Adding ${participantsToCreate.length} missing participants`
      );
      await ConversationParticipant.bulkCreate(participantsToCreate, {
        transaction,
        updateOnDuplicate: ["last_read_at", "user_type", "is_active"], // MySQL only: use ['id'] or omit if no ON DUPLICATE KEY
      });
    }

    //  Final fetch with relations
    const conversationWithDetails = await Conversation.findByPk(
      conversation.id,
      {
        include: [
          {
            model: ConversationParticipant,
            as: "participants",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "first_name", "last_name", "email"],
              },
            ],
          },
        ],
        transaction,
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      conversation: conversationWithDetails,
      created: created, // helpful for frontend logging
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in createOrGetConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create or retrieve conversation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


module.exports = {
  createOrGetConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadChatFile,
  sendAssignmentViaChat,
  sendInterviewViaChat,
  submitAssignment,
};