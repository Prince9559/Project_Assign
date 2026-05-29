//backend/services/emailAlertCron.js
const cron = require("node-cron");
const { sendDigestEmailToRecruiters } = require("./emailAlertService");

const scheduleEmailAlerts = () => {
  console.log("[CRON] Initializing email alert scheduler...");

  // Schedule daily at 8 AM IST
  cron.schedule("0 8 * * *", async () => {
    console.log("[CRON JOB FIRED] Daily email alert trigger at 8 AM IST");
    try {
      await sendDigestEmailToRecruiters();
      console.log("Email alerts sent successfully.");
    } catch (error) {
      console.error("Error sending email alerts:", error);
    }
  }, {
    timezone: "Asia/Kolkata" 
  });

  console.log("Email alert scheduler active. Will run daily at 8 AM IST.");
};

module.exports = { scheduleEmailAlerts };