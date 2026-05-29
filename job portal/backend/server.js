require('dotenv').config();
const { app, server, io } = require('./app');
const db = require('./models');
const PORT = process.env.PORT || 5009;


(async () => {
  try {
    // Authenticate database connection
    await db.sequelize.authenticate();
    // await db.sequelize.sync({ alter: true });
    console.log(" Database connected");

    // Initialize OTP cleanup job (runs every hour by default)
    if (
      process.env.NODE_ENV !== "test" &&
      db.OTP &&
      typeof db.OTP.setupCleanupJob === "function"
    ) {
      db.OTP.setupCleanupJob(process.env.OTP_CLEANUP_INTERVAL_MINUTES || 60);
      console.log("OTP cleanup job initialized");
    }

    //  START EMAIL ALERT CRON JOB HERE
    const { scheduleEmailAlerts } = require("./services/emailAlertCron");
    scheduleEmailAlerts();

      //Start interview alert cron
    const {
      setupInterviewReminderCron,
    } = require("./services/interviewReminderCron");
    // setupInterviewReminderCron(); //currently stopped 

    // const server = app.listen(PORT, () => {
    //   console.log(` Server running on http://localhost:${PORT}`);
    // });

    //now using http server instead of app to support socket.io
    server.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Socket.IO initialized`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully");
      server.close(() => {
        console.log("HTTP server closed");
        // Clear the OTP cleanup interval if it exists
        if (db.OTP && db.OTP.cleanupInterval) {
          clearInterval(db.OTP.cleanupInterval);
          console.log("OTP cleanup job stopped");
        }
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(' Server startup failed:', err);
    process.exit(1);
  }
})();
