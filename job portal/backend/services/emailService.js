// services/emailService.js
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const handlebars = require("handlebars");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const templateCache = {};

const compileTemplate = async (templateName) => {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const templatePath = path.join(__dirname, "../templates/email", `${templateName}.hbs`);
  const source = await fs.readFile(templatePath, "utf8");
  const compiled = handlebars.compile(source);
  templateCache[templateName] = compiled;
  return compiled;
};

// Verify connection
transporter.verify((err, success) => {
  if (err) console.error("[EMAIL] Transporter config error:", err);
  else console.log("[EMAIL] Transporter ready ");
});

exports.sendDigestEmail = async (
  toEmail,
  frequency,
  groupedData,
  totalApps
) => {
  try {
    // Format date for display
    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN");

    // Build HTML per job
    let jobsHtml = "";
    for (const jobId in groupedData) {
      const job = groupedData[jobId];
      let applicantsHtml = "";

      job.applicants.forEach((app) => {
        applicantsHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              app.name
            }</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(
              app.appliedAt
            )}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              ${
                app.resume_url
                  ? `<a href="${process.env.BACKEND_URL}/${app.resume_url}" style="color: #ef4444; text-decoration: none;">📄 Resume</a>`
                  : `<span style="color: #9ca3af;">📄 No Resume</span>`
              }
            </td>
          </tr>
        `;
      });

      jobsHtml += `
        <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;"> ${job.jobTitle || "Untitled Job"}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left;">Applied</th>
                <th style="padding: 8px; text-align: left;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${applicantsHtml}
            </tbody>
          </table>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #111827; margin: 0 0 16px 0;"> ${
            frequency.charAt(0).toUpperCase() + frequency.slice(1)
          } Applications Digest</h2>
          <p style="color: #4b5563; margin: 0 0 24px 0;">You have <strong>${totalApps}</strong> new applicant${
      totalApps !== 1 ? "s" : ""
    } since last alert.</p>

          ${jobsHtml}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/recruiter/jobs" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
               View All Applications in Portal
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

          <div style="text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 4px 0;">
              <a href="${
                process.env.FRONTEND_URL
              }/recruiter-email-alert-settings" style="color: #ef4444; text-decoration: none;">Adjust Frequency</a> 
              | 
              <a href="#" style="color: #ef4444; text-decoration: none;">Unsubscribe</a>
            </p>
            <p style="margin: 4px 0;">© 2025 Apna Job Portal. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Your Job Portal" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `You have ${totalApps} new applicant${
        totalApps !== 1 ? "s" : ""
      } this ${frequency}!`,
      html: html,
    });

    console.log(`Email sent to ${toEmail}`, info);
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error);
    throw new Error(`Email sending failed: ${error.message || error}`);
  }
};



// Compile templates once (or cache)
let interviewScheduledTemplate, interviewReminderTemplate;

const initTemplates = async () => {
  if (!interviewScheduledTemplate) {
    const scheduledSrc = await fs.readFile(
      path.join(__dirname, "../templates/email/interviewScheduled.hbs"),
      "utf8"
    );
    interviewScheduledTemplate = handlebars.compile(scheduledSrc);
  }
  if (!interviewReminderTemplate) {
    const reminderSrc = await fs.readFile(
      path.join(__dirname, "../templates/email/interviewReminder.hbs"),
      "utf8"
    );
    interviewReminderTemplate = handlebars.compile(reminderSrc);
  }
};

exports.sendInterviewEmail = async (toEmail, type, data) => {
  try {
    await initTemplates();

    let html, subject;
    const commonData = {
      ...data,
      frontendUrl: process.env.FRONTEND_URL,
    };

    if (type === "scheduled") {
      html = interviewScheduledTemplate(commonData);
      subject = `🎯 Interview Scheduled for ${data.jobTitle}`;
    } else if (type === "reminder") {
      html = interviewReminderTemplate(commonData);
      subject = `⏰ Interview Starts in 1 Hour — ${data.jobTitle}`;
    } else {
      throw new Error(`Unknown email type: ${type}`);
    }

    const info = await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`[EMAIL] Interview ${type} sent to ${toEmail}`, info.messageId);
    return info;
  } catch (error) {
    console.error(
      `Failed to send interview ${type} email to ${toEmail}:`,
      error
    );
    throw new Error(`Email sending failed: ${error.message || error}`);
  }
};


exports.sendTeamInvitation = async (options) => {
  const {
    toEmail,
    firstName,
    companyName,
    roleName,
    invitedBy,
    temporaryPassword,
    loginUrl,
    adminEmail
  } = options;

  try {
    const template = await compileTemplate("teamInvitation");
    const html = template({
      firstName,
      email: toEmail,
      companyName,
      roleName,
      invitedBy,
      temporaryPassword,
      loginUrl: loginUrl || process.env.FRONTEND_URL + "/login",
      adminEmail: adminEmail || process.env.ADMIN_EMAIL,
      year: new Date().getFullYear()
    });

    const info = await transporter.sendMail({
      from: `"${companyName} Portal" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `You have been added to ${companyName} - Login Credentials Inside`,
      html
    });

    console.log(`[EMAIL] Team invitation sent to ${toEmail}`, info.messageId);
    return info;
  } catch (error) {
    console.error(`[EMAIL] Failed to send team invitation to ${toEmail}:`, error);
    throw new Error(`Email sending failed: ${error.message || error}`);
  }
};


exports.sendStatusChangeNotification = async (options) => {
  const {
    toEmail,
    firstName,
    companyName,
    roleName,
    isActive,
    updatedBy,
    updatedAt,
    loginUrl,
    adminEmail
  } = options;

  try {
    const template = await compileTemplate("statusChanged");
    const html = template({
      firstName,
      email: toEmail,
      companyName,
      roleName,
      isActive,
      updatedBy,
      updatedAt: updatedAt ? new Date(updatedAt).toLocaleString() : new Date().toLocaleString(),
      loginUrl: loginUrl || process.env.FRONTEND_URL + "/login",
      adminEmail: adminEmail || process.env.ADMIN_EMAIL,
      year: new Date().getFullYear()
    });

    const info = await transporter.sendMail({
      from: `"${companyName} Portal" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `${companyName} - Account Status ${isActive ? "Activated" : "Deactivated"}`,
      html
    });

    console.log(`[EMAIL] Status change notification sent to ${toEmail}`, info.messageId);
    return info;
  } catch (error) {
    console.error(`[EMAIL] Failed to send status notification to ${toEmail}:`, error);
    throw new Error(`Email sending failed: ${error.message || error}`);
  }
};




/**
 * Generic email sender for future use.
 * Maintains backward compatibility — does NOT break existing calls.
 * @param {Object} options - { to, subject, html, text (optional), from (optional) }
 */
exports.sendEmail = async ({ to, subject, html, text, from }) => {
  const mailOptions = {
    from: from || `"Job Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text, // optional plain-text fallback
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] to ${to} | Subject: "${subject}" | ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL FAILED] to ${to} | Subject: "${subject}"`, error);
    throw new Error(`Email sending failed: ${error.message || error}`);
  }
};