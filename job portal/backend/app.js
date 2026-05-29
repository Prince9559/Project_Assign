// ========================
// 1. MODULE IMPORTS
// ========================
require('dotenv').config();
const express = require('express');
const http = require("http");
const socketIO = require("socket.io");
const cors = require('cors');
const path = require('path');
const multer = require("multer");
const session = require("express-session");
const passport = require("./config/passport");
const morgan = require("morgan");



const bodyParser = require("body-parser");

// Controllers and Handlers
const {
  uploadSkillController,
  getUserSkillsController,
} = require("./controllers/userSkillController");
const { serveCertificate } = require("./controllers/fileController");
const { initializeSocket } = require("./socket/socketHandler");

// Route Imports
const userRoutes = require('./routes/userRoutes');
const otpRoutes = require('./routes/otpRoutes');
const otpmobileRoutes = require('./routes/otpmobileroute');
const userDetailRoutes = require('./routes/userdetailRoutes');
const jobpostRoute = require('./routes/jobpostroute');
const companyRecruiterProfileRoutes = require('./routes/companyRecruiterProfileRoutes');
const interviewInvitationRoutes = require('./routes/interviewInvitationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const feedRoutes = require('./routes/feedRoutes');
const skillRoutes = require('./routes/skillRoutes');
const universityRoutes = require('./routes/universitydetailRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const profileRoutes = require("./routes/profileRoutes");
const faqRoutes = require('./masterRoutes/faqRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const pricingRoutes = require("./routes/pricingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const universityCreditRoutes = require("./routes/universityCreditRoutes");
const blogRoutes = require("./routes/blogRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const supportRoutes = require("./routes/supportRoutes");
const studentRoutes = require("./routes/studentRoutes");
const termsRoutes = require("./routes/termsRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const universityHomeRoutes = require("./routes/universityRoutes");
const homePlatformRoutes = require("./routes/homePatformRoutes");
const homeSuccessRoutes = require("./routes/homeSuccessRoutes");

const teamRoutes = require("./routes/teamRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiPredictionRoutes = require("./routes/aiPredictionRoutes");
const pathwayRoutes = require("./routes/pathwayRoutes");
const pathwayNewRoutes = require("./routes/pathwayNewRoutes");
const aiPathwayLearningRoutes = require("./routes/aiPathwayLearningRoutes");

const needAssitanceRoutes = require('./routes/needAssistanceRoutes')
const educationApprovalRoutes = require("./routes/educationApprovalRoutes");
const experienceApprovalRoutes = require("./routes/experienceApprovalRoutes");


// =====================
// Master Routes Imports
const courseRoutes = require('./masterRoutes/courseRoutes');
const companyRoutes = require('./masterRoutes/companyRoutes');
const schoolCollegeRoutes = require('./masterRoutes/schoolCollegeRoutes');
const collegesRoutes = require('./routes/collegesRoutes');
const specializationRoutes = require('./masterRoutes/specializationRoutes');
const locationRoutes = require('./masterRoutes/locationRoutes');
const adminDurationRoutes = require('./masterRoutes/adminDurationRoutes');
const adminAllowedCitiesRoutes = require('./masterRoutes/adminAllowedCitiesRoutes');
const adminPerksRoutes = require('./masterRoutes/adminPerksRoutes');
const jobRolesRoutes = require('./masterRoutes/jobRolesRoute')
const languageRoutes = require('./masterRoutes/languageRoute')
const domainRoutes = require('./masterRoutes/domainRoutes')
const skillByDomainRoutes = require('./masterRoutes/skillRoutes')
const allMasterDataRoutes = require('./masterRoutes/allMasterDataRoute')
const industryRoutes = require('./masterRoutes/industryRoutes')


// ========================
// 2. EXPRESS APP & SERVER SETUP
// ========================



// ------------------ CORS CONFIG ----------------
// ------------------ FIXED CORS CONFIG ----------------

// Allow multiple domains from .env
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean)
  .map(origin => new RegExp(`^${origin.replace(/\./g, "\\.").replace("*", ".*")}$`));

const isDev = process.env.NODE_ENV === "development";

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server / curl

    const isLocalDev =
      isDev &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    const isAllowed =
      isLocalDev || allowedOrigins.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  // exposedHeaders: ["Upgrade", "Connection"], 
};







const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach io to app for controller access
app.set("io", io);


// ========================
// 3. MIDDLEWARE
// ========================

// Session & Auth
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: process.env.NODE_ENV === "production",
      secure: false, //currently false but fix them
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 mins for OAuth flow
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//  Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}



// JSON Parsing (with strict validation)
app.use(
  express.json({
    limit: '50mb',
    strict: true,
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error('Invalid JSON');
      }
    }
  })
);

// URL-encoded parsing
app.use(express.urlencoded({ extended: true }));

// Global error handler for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: err.message,
    });
  }
  next();
});


// Apply CORS to all routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options(/.*/, cors(corsOptions));


// Error handling for JSON parsing
// app.use(express.json({
//   strict: true
// }));

// app.use(bodyParser.json({
//   limit: '50mb',
//   strict: true,
//   verify: (req, res, buf, encoding) => {
//     try {
//       JSON.parse(buf.toString());
//     } catch (e) {
//       throw new Error('Invalid JSON');
//     }
//   }
// }));

// app.use(bodyParser.urlencoded({ extended: true }));




// ========================
// 4. ROUTES
// ========================

//  API Routes
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegesRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/mobileotp', otpmobileRoutes);
app.use('/api/user-details', userDetailRoutes);
app.use('/api/company-recruiter', companyRecruiterProfileRoutes);
app.use('/api/interview-invitations', interviewInvitationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/gst', require('./routes/gstGovRoutes'));
app.use("/api/kyc", require("./routes/kycRoutes"));
app.use("/api/ai", aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/university", universityCreditRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", aiPredictionRoutes);
app.use("/api/pathways/v4", pathwayNewRoutes);
app.use("/api/pathways/learning", aiPathwayLearningRoutes);
app.use("/api/pathways", pathwayRoutes);
app.use("/api/need-assistance", needAssitanceRoutes); //faq assistance
app.use("/api", educationApprovalRoutes);
app.use("/api", experienceApprovalRoutes);

app.use("/api", universityRoutes); //also mount this
app.use("/api", blogRoutes); //blog routes
app.use("/api", aboutRoutes); //about routes
app.use("/api", supportRoutes); //suppport routes
app.use("/api", studentRoutes); //student routes
app.use("/api", termsRoutes); //student routes
app.use("/api", recruiterRoutes); //recruiter routes
app.use("/api", universityHomeRoutes); //university routes
app.use("/api", homePlatformRoutes); //home platform routes
app.use("/api", homeSuccessRoutes); //home success routes
app.use("/", jobpostRoute); //not ounted to mount

//master routes
app.use('/api/master/all', allMasterDataRoutes);
app.use('/api/master/courses', courseRoutes);
app.use('/api/master/location', locationRoutes);
app.use('/api/master/school-college', schoolCollegeRoutes);
app.use('/api/master/specialization', specializationRoutes);
app.use('/api/master/faqs', faqRoutes);
app.use('/api/master/duration', adminDurationRoutes);
app.use('/api/master/cities', adminAllowedCitiesRoutes);
app.use('/api/master/perks', adminPerksRoutes);
app.use('/api/master/job-roles', jobRolesRoutes)
app.use('/api/master/languages', languageRoutes)
app.use('/api/master/companies', companyRoutes)
app.use('/api/master/domains', domainRoutes)
app.use('/api/master/skill', skillByDomainRoutes)
app.use('/api/master/industries', industryRoutes);

//  File upload and static serving
const upload = multer({ dest: 'uploads/' });
app.use('/api', uploadRoutes);

app.post('/api/upload-skill', upload.any(), uploadSkillController);

// Get user skills with certificate URLs
app.get('/api/user-skills/:user_id', getUserSkillsController);

//  Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

//  Specific route for certificate files with better error handling
app.get('/api/certificates/:filename', serveCertificate);



// ========================
// 5. SOCKET.IO INITIALIZATION
// ========================

initializeSocket(io);


// ========================
// 6. ERROR HANDLING
// ========================




// Final catch-all error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

//make a 404 fallback


// ========================
// 7. EXPORTS
// ========================
module.exports = { app, server, io };
