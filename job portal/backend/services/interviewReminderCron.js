// backend/services/interviewReminderCron.js
const cron = require('node-cron');
const {InterviewInvitation,Application, JobPost, CompanyRecruiterProfile, User,UserDetail, JobRole} = require('../models');

const { Op } = require('sequelize');
const NotificationService = require('./notificationService');
const { sendInterviewEmail } = require('./emailService');


const runInterviewReminderJob = async () => {
  console.log("Interview reminder job running");
  try {
    const now = new Date();

    // Fetch all interview invitations where:
    // - schedule confirmation was sent (scheduled_notification_sent_at IS NOT NULL)
    // - reminder has NOT been sent yet
    const interviews = await InterviewInvitation.findAll({
      where: {
        scheduled_notification_sent_at: { [Op.ne]: null },
        reminder_notification_sent_at: null,
      },
      include: [
        {
          model: Application,
          as: 'Application', // ← default alias (no `as` in InterviewInvitation.belongsTo)
          include: [
            {
              model: UserDetail,
              as: 'user', // ← from Application.belongsTo(UserDetail, { as: 'user' })
              include: [
                {
                  model: User,
                  as: 'User', // ← default alias (no `as` in UserDetail.belongsTo(User))
                  attributes: ['id', 'email', 'first_name', 'last_name'],
                },
              ],
            },
            {
              model: JobPost,
              as: 'jobPost', // ← explicit alias from Application.belongsTo(JobPost, { as: 'jobPost' })
              include: [
                {
                  model: CompanyRecruiterProfile,
                  as: 'CompanyRecruiterProfile', // ← default alias (no `as` in JobPost.belongsTo)
                  attributes: ['company_name'],
                  include: [
                    {
                      model: User,
                      as: 'user', // ← explicit alias from CompanyRecruiterProfile.belongsTo(User, { as: 'user' })
                      attributes: ['id', 'email', 'first_name', 'last_name'],
                    },
                  ],
                },
                {
                  model: JobRole,
                  as: 'JobRole', // ← default alias (no `as` in JobPost.belongsTo(JobRole))
                  attributes: ['title'],
                },
              ],
            },
          ],
        },
      ],
    });

    // Filter in JS for interview time ∈ [now - 1hr, now + 0] (i.e., within next hour, but not past)
    const toRemind = interviews.filter(inv => {
      const interviewTime = new Date(`${inv.interview_date}T${inv.start_time}`);
      const oneHourBefore = new Date(interviewTime.getTime() - 60 * 60 * 1000); // 1 hour before interview

      return now >= oneHourBefore && now < interviewTime;
    });

    for (const inv of toRemind) {
      try {
        //  Extract nested data safely
        const app = inv.Application; // PascalCase!
        if (!app) {
          console.warn(`Skipping interview ${inv.id}: missing Application`);
          continue;
        }

        const userDetail = app.user; // UserDetail instance
        const studentUser = userDetail?.User; // PascalCase! → actual User model
        const jobPost = app.jobPost;
        const recruiterProfile = jobPost?.CompanyRecruiterProfile; // PascalCase!
        const recruiterUser = recruiterProfile?.user; // lowercase 'user' (explicit alias)
        const jobRole = jobPost?.JobRole; // PascalCase!

        if (!studentUser || !recruiterUser || !jobRole) {
          console.warn(`Skipping interview ${inv.id}: missing user/job data`);
          continue;
        }

        //  Format time in IST
        const interviewTime = new Date(`${inv.interview_date}T${inv.start_time}`);
        const timeStr = interviewTime.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        //  Build payload
        const payload = {
          jobTitle: jobRole.title || 'the role',
          studentName: `${studentUser.first_name} ${studentUser.last_name}`.trim(),
          companyName: recruiterProfile.company_name || 'the company',
          time: timeStr,
          interviewType: inv.interview_type,
          videoLink: inv.video_link,
          phoneNumber: inv.phone_number,
          officeAddress: inv.office_address,
          applicationId: app.id,
        };

        console.log(`Preparing reminder for interview #${inv.id}`, {
          student: studentUser.email,
          recruiter: recruiterUser.email,
          time: timeStr,
        });

        //  Notify Student
        await NotificationService.send(
          studentUser.id,
          'STUDENT',
          'interview_reminder_student',
          { ...payload, applicationId: app.id }
        );

        //  Notify Recruiter
        await NotificationService.send(
          recruiterUser.id,
          'COMPANY',
          'interview_reminder_recruiter',
          {
            ...payload,
            studentName: payload.studentName,
            applicationId: app.id,
          }
        );

        //  Email Student
        await sendInterviewEmail(
          studentUser.email,
          'reminder',
          { ...payload, name: studentUser.first_name, isRecruiter: false }
        );

        //  Email Recruiter
        await sendInterviewEmail(
          recruiterUser.email,
          'reminder',
          { 
            ...payload, 
            name: recruiterUser.first_name, 
            studentName: payload.studentName, 
            isRecruiter: true 
          }
        );

        //  Mark reminder as sent
        await inv.update({ reminder_notification_sent_at: new Date() });

        console.log(` Reminder sent for interview #${inv.id}`);

      } catch (err) {
        console.error(` Failed to process reminder for interview ${inv.id}:`, err.message, err.stack);
      }
    }

    console.log(`Interview reminder job completed. Processed ${toRemind.length}/${interviews.length} reminders.`);

  } catch (err) {
    console.error('[CRON] Interview reminder job failed:', err);
  }
};

const setupInterviewReminderCron = () => {
  console.log('[CRON] Setting up interview reminder job (runs every 10 mins)');
  
  // Run every 10 minutes — balances accuracy & load
  cron.schedule('*/10 * * * *', runInterviewReminderJob, {
    timezone: 'Asia/Kolkata',
  });
};

module.exports = { setupInterviewReminderCron };