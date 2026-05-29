import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import SignUpChooseRole from "../pages/auth/SignUpChooseRole";
import SignUp from "../pages/auth/SignUp";
import TermsAndConditions from "../pages/auth/TermsAndConditions";
import SignUpVerifyOtpEmail from "../pages/auth/SignUpVerifyOtpEmail";
import StudentFillAccountDetails from "../pages/student/studentFillAccountDetails/StudentFillAccountDetails";

import RecruiterPostJobInternDetails from "../pages/recruiter/RecruiterPostJobInternDetails";
import UniversityFillDetails from "../pages/university/UniversityFillDetails";
import AllJObs from "../pages/student/jobSection/AllJObs";
import JobDetailsPage from "../pages/student/jobSection/JobDetailsPage";
import LoginVerifyOtpEmail from "../pages/auth/LoginVerifyOtpEmail";
import LoginSendOtpEmail from "../pages/auth/LoginSendOtpEmail";
import CompanyRecruiterProfile from "../pages/recruiter/CompanyRecruiterProfile";
import FeedPage from "../pages/student/feed/FeedPage";
import FeedPostDetail from "../pages/student/feed/FeedPostDetail"
import FeedUserActivity from "../pages/student/feed/FeedUserActivity";
import FeedMyProfile from "../pages/student/feed/FeedMyProfile";
import FeedView from "../pages/student/feed/FeedView";
import FeedPublicProfile from "../pages/student/feed/FeedPublicProfile";
import FeedPublicProfilePage from "../pages/student/feed/FeedPublicProfilePage";



import FeedTerms from "../pages/student/feed/FeedTerms";
import FeedResume from "../pages/student/feed/FeedResume";
import FeedTicket from "../pages/student/feed/FeedTicket";
import Feedprofile from "../pages/student/feed/Feedprofile";
import FeedChangeEmail from "../pages/student/feed/FeedchangeEmail";
import FeedChangePassword from "../pages/student/feed/FeedChangePassword";
import FeedYourSkills from "../pages/student/feed/FeedYourSkills";
import FeedYourEducation from "../pages/student/feed/FeedYourEducation";
import FeedYourExprience from "../pages/student/feed/FeedYourExprience";
import FeedDashBoard from "../pages/student/feed/FeedDashBoard";
import FeedAuthentication from "../pages/student/feed/FeedAuthentication";
import FeedFaq from "../pages/student/feed/FeedFaq";
import MyMassage from "../pages/student/application/MyMassage";
import MyNotification from "../pages/student/application/MyNotification";
import ResumeTemplateSelector from "../pages/student/resume/ResumeTemplateSelector";
import ResumeTemplate1 from "../pages/student/resume/ResumeTemplate1";
import ResumeTemplate2 from "../pages/student/resume/ResumeTemplate2";
import ResumeTemplate3 from "../pages/student/resume/ResumeTemplate3";
import ResumeTemplate4 from "../pages/student/resume/ResumeTemplate4";
import ResumeTemplate5 from "../pages/student/resume/ResumeTemplate5";
// import ResumeMaker from "../pages/student/resume/ResumeMaker";
import ResumeBuilder from "../pages/student/resume/ResumeBuilder";
import GSTTestPage from "../pages/GSTTestPage";
import OfflineAadharKYC from "../pages/OfflineAadhaarKYC";


import RecruiterDashboard from "../pages/recruiter/dashboard/RecruiterDashboard";
import RecruiterTotalJobPost from "../pages/recruiter/dashboard/RecruiterTotalJobPost";
import RecruiterApplication from "../pages/recruiter/dashboard/RecruiterApplication";
import RecruiterViewApplicationDetails from "../pages/recruiter/dashboard/RecruiterViewApplicationDetails";
import RecruiterApplicationData from "../pages/recruiter/dashboard/RecruiterApplicationData";
import RecruiterSendAssignment from "../pages/recruiter/dashboard/RecruiterSendAssignment";
import RecruiterScheduleInterview from "../pages/recruiter/dashboard/RecruiterScheduleInterview";
import RecruiterApproval from "../pages/recruiter/dashboard/RecruiterApproval";
import RecruitePipeline from "../pages/recruiter/dashboard/RecruiterPipeline";
import RecruiterUpcomingInterviews from "../pages/recruiter/dashboard/RecruiterUpcomingInterviews";
import RecruiterPendingTask from "../pages/recruiter/dashboard/RecruiterPendingTask";
import RecruiterAllEmployees from "../pages/recruiter/dashboard/RecruiterAllEmployees";
import RecruiterPendingEmployeeApprovals from "../pages/recruiter/dashboard/RecruiterPendingEmployeeApprovals";
import RecruiterEmployeeManagement from "../pages/recruiter/dashboard/RecruiterEmployeeManagement";
import RecruiterProfile from "../pages/recruiter/profile/RecruiterProfile";
import RecruiterTerms from "../pages/recruiter/profile/RecruiterTerms";
import RecruiterView from "../pages/recruiter/profile/RecruiterView";
import RecruiterFaq from "../pages/recruiter/profile/RecruiterFaq";
import RecruiterTicket from "../pages/recruiter/profile/RecruiterTicket";
import RecruiterPayment from "../pages/recruiter/profile/RecruiterPayment";
import RecruiterPricing from "../pages/recruiter/profile/RecruiterPricing";
import RecruiterPricingPage from "../pages/recruiter/profile/RecruiterPricingPage";

import RecruiterPaymentMethod from "../pages/recruiter/profile/RecruiterPaymentMethod";
import RecruiterChangePassword from "../pages/recruiter/profile/RecruiterChangePassword";
import RecruiterChangeEmail from "../pages/recruiter/profile/RecruiterChangeEmail";
import RecruiterEmailAlertSettings from "../pages/recruiter/dashboard/RecruiterEmailAlertSettings";

import RecruiterBillingDashboard from "../pages/payments/billing/RecruiterBillingDashboard"

//payments
import PaymentTestPage from "../pages/payments/PaymentTestPage";
import RecruiterCheckoutPage from "../pages/payments/RecruiterCheckoutPage";
import PaymentSuccessPage from "../pages/payments/PaymentSuccessPage";

import CreditPacksPage from "../pages/recruiter/payment/CreditPacksPage";
import CreditPurchaseSuccess from "../pages/recruiter/payment/CreditPurchaseSuccess";

import JobPostingPlanPage from "../pages/recruiter/payment/JobPostingPlanPage";



//subscriptions
import SubscriptionTestPage from "../pages/payments/subscriptions/SubscriptionTestPage";





import RecruiterPaymentSuccessPage from "../pages/recruiter/payment/RecruiterPaymentSuccessPage";
import RecruiterPostOpportunitySelector from "../pages/recruiter/jobs/RecruiterPostOpportunitySelector";
import RecruiterJobDetailPage from "../pages/recruiter/jobs/RecruiterJobDetailPage";

//settings page recruiter
// Settings Pages
import TeamOverviewPage from "../pages/recruiter/settings/TeamOverviewPage";
import TeamRolesPage from "../pages/recruiter/settings/TeamRolesPage";
import EmailAlertSettingsPage from "../pages/recruiter/settings/EmailAlertSettingsPage";
import ProfileSettingsPage from "../pages/recruiter/settings/ProfileSettingsPage";
import SecuritySettingsPage from "../pages/recruiter/settings/SecuritySettingsPage";
import CompanySettingsPage from "../pages/recruiter/settings/CompanySettingsPage";
import AuditLogPage from "../pages/recruiter/settings/AuditLogPage";
import JobAccessPage from "../pages/recruiter/settings/JobAccessPage";







import UniversityProfile from "../pages/university/universityProfile/UniversityProfile";
import UniversityChangeEmail from "../pages/university/universityProfile/UniversityChangeEmail";
import UniversityChangePassword from "../pages/university/universityProfile/UniversityChangePassword";
import UniversityFaq from "../pages/university/universityProfile/UniversityFaq";
import UniversityView from "../pages/university/universityProfile/UniversityView";
import UniversityTerms from "../pages/university/universityProfile/UniversityTerms";
import UniversityTicket from "../pages/university/universityProfile/UniversityTicket";
import UniversityPricing from "../pages/university/universityProfile/UniversityPricing";
import UniversityPayment from "../pages/university/universityProfile/UniversityPayment";
import UniversityPaymentMethod from "../pages/university/universityProfile/UniversityPaymentMethod";
import UniversityApproval from "../pages/university/universityProfile/UniversityApproval";
import UniversityJobs from "../pages/university/dashboard/UniversityJobs";
import UniversityJobDetail from "../pages/university/dashboard/UniversityJobDetail";
import UniversityAllStudents from "../pages/university/dashboard/UniversityAllStudents";
import UniversityPendingApprovals from "../pages/university/dashboard/UniversityPendingApprovals";
import CreditPaymentSuccessPage from "../pages/university/payments/CreditPaymentSuccessPage";
import CreditsPricingPage from "../pages/university/payments/UniversityCreditsPricingPage";
import UnlockedContactsPage from "../pages/university/payments/UnlockedContactsPage";
import CreditDashboardPage from "../pages/university/payments/CreditDashboardPage";
import CreditTransactionHistory from "../pages/university/payments/CreditTransactionHistory";





import AiProfile from "../pages/aiprediction/AiProfile";
import AiGettingStarted from "../pages/aiprediction/AiGettingStarted";
import AiAllJobs from "../pages/aiprediction/AiAllJobs";
import AllJObsPart from "../pages/aiprediction/AiAllJobsPart";

import AiCompanyRoleSetup from "../pages/aiprediction/AiCompanyRoleSetup";
import AiLearningPage from "../pages/aiprediction/AiLearningPage";
import ManagePathwayPage from "../pages/aiprediction/ManagePathwayPage";

import MyPathway from "../pages/MyPathway";
import StudentDashboard from "../pages/StudentDashboard";
import PathwayDetailView from "../pages/PathwayDetailView";
import ResourceDetailPage from "../pages/ResourceDetailPage";




import CompanyProfileEdit from "../pages/recruiter/CompanyProfileEdit";
import CompanyAuthentication from "../pages/recruiter/CompanyAuthentication";
import MyApplication6 from "../pages/student/application/Myapplication6";
import MyApplication5 from "../pages/student/application/Myapplication5";
import MyApplication4 from "../pages/student/application/Myapplication4";
import GeneratingPathway from "../pages/student/application/GeneratingPathway";
import MyApplication2 from "../pages/student/application/Myapplication2";
import MyApplication1 from "../pages/student/application/Myapplication1";
import StudentApplications from "../pages/student/application/studentApplications";
import UniversityProfileEdit from "../pages/university/universityProfile/UniversityProfileEdit";
import UniversityPublicProfile from "../pages/university/universityProfile/UniversityPublicProfile";
import OfflineAadhaarKYC from "../pages/OfflineAadhaarKYC";
import AccountNotVerified from "../pages/AccountNotVerified";
import UniversityGstAuthentication from "../pages/university/universityProfile/UniversityGstAuthentication";

import ChatPage from "../pages/ChatPage";
import ChatHome from "../pages/chat/ChatHome";
import SubscriptionCheckoutPage from "../pages/payments/subscriptions/SubscriptionCheckoutPage";
import SubscriptionPricingPage from "../pages/payments/subscriptions/SubscriptionPricingPage";
import SubscriptionStatusPage from "../pages/payments/subscriptions/SubscriptionStatusPage";
import SubscriptionSuccessPage from "../pages/payments/subscriptions/SubscriptionSuccessPage";
import PaymentViaSubscriptionSuccess from "../pages/payments/PaymentViaSubscriptionSuccess";

import NotificationPage from "../pages/notifications/NotificationCenterPage";
import UniversityCreditDashboard from "../pages/university/payments/UniversityCreditDashboard";

import CollegeSpecificCheckoutPage from "../pages/recruiter/CollegeSpecificCheckoutPage";

//for public accessible routes

import Main from "../components/home/main";
import Students from "../components/home/Students";
import Recruiter from "../components/home/Recruiter.jsx/Recruiter";   
import University from "../components/home/University/University";
import About from "../components/home/About/About";
import Blogs from "../components/home/Blogs/Blogs";
import Blog2 from "../components/home/Blogs2/Blog2";
import Support from "../components/home/Support/Support";
import Privacy from "../components/home/TermsAndCondition/Privacy";
import FAQ from "../components/home/FAQ/FAQ";
import CreateRolePage from "../pages/recruiter/settings/CreateRolePage";
import EditRolePage from "../pages/recruiter/settings/EditRolePage";
import MemberDetailPage from "../pages/recruiter/settings/MemberDetailPage";
import AddMemberPage from "../pages/recruiter/settings/AddMemberPage";
import NotificationUniversityPage from "../pages/university/dashboard/NotificationUniversity";
import UniversityNotificationBoostPage from "../pages/university/dashboard/UniversityNotificationBoostPage";







const ProtectedRoute = ({
  children,
  allowedRoles,
  requireProfileCompletion = true,
}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const universityAccountStatus =
    user?.accountStatus || user?.verification_status || "not_verified";
  const isUniversityVerified =
    user?.user_role === "UNIVERSITY" && universityAccountStatus === "verified";

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user.user_role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If profile is incomplete (status === 1), only allow access to the correct fill-details page
  if (user.profile_status === 1 && requireProfileCompletion) {
    let expectedPath;
    switch (user.user_role) {
      case "STUDENT":
        expectedPath = "/student-fill-account-details";
        break;
      case "COMPANY":
        expectedPath = "/recruiter-fill-account-details";
        break;
      case "UNIVERSITY":
        expectedPath = "/university-fill-account-details";
        break;
      default:
        expectedPath = "/login";
    }

    // If user is NOT on the expected path, redirect them there
    if (location.pathname !== expectedPath) {
      return <Navigate to={expectedPath} replace />;
    }
  }

  // University re-verification gate
  if (
    user?.user_role === "UNIVERSITY" &&
    user?.profile_status === 2 &&
    user?.verification_status === "not_verified"
  ) {
    const allowedWhileNotVerified = new Set([
      "/account-not-verified",
      "/university-fill-account-details",
      "/university-change-email",
      "/university-change-password",
    ]);
    if (!allowedWhileNotVerified.has(location.pathname)) {
      return <Navigate to="/account-not-verified" replace />;
    }
  }

  // Verified university users cannot access onboarding/edit routes anymore.
  if (isUniversityVerified) {
    const restrictedForVerifiedUniversity = new Set([
      "/university-fill-account-details",
      "/university-profile-edit",
      "/account-not-verified",
    ]);
    if (restrictedForVerifiedUniversity.has(location.pathname)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If profile_status is 2 or requireProfileCompletion is false, allow access
  return children;
};

// Public Route Wrapper Component
// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const location = useLocation();


//   // Don't redirect if:
//   // - it's the OTP page, OR
//   // - user just came from signup and is in OTP flow
//   if (location.pathname === "/signup-verify-otp-email") {
//     return children;
//   }

//   // Redirect authenticated users as before
//   if (isAuthenticated && user.profile_status===1) {
//     switch (user?.user_role) {
//       case "STUDENT":
//         return <Navigate to="/student-fill-account-details" replace />;
//       case "COMPANY":
//         return <Navigate to="/recruiter-fill-account-details" replace />;
//       case "UNIVERSITY":
//         return <Navigate to="/university-fill-account-details" replace />;
//       default:
//         return <Navigate to="/" replace />;
//     }
//   }
//   if (isAuthenticated && user.profile_status===2) {
//     switch (user?.user_role) {
//       case "STUDENT":
//         return <Navigate to="/all-jobs" replace />;
//       case "COMPANY":
//         return <Navigate to="/recruiter-dashboard" replace />;
//       case "UNIVERSITY":
//         return <Navigate to="/university-profile" replace />;
//       default:
//         return <Navigate to="/" replace />;
//     }
//   }

//   return children;
// };



// List of routes that should remain accessible even after login
const OPEN_PUBLIC_ROUTES = [
  "/home",
  "/terms-and-conditions",
  "/contact",
  "/privacy-policy", "/about", "/students", "/recruiter", "/university",
  "/blogs", "/blog2", "/support", "/privacy", "/faq","/companyHome","/universityHome", "candidateHome"
  // Add others as needed
];

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const universityAccountStatus =
    user?.accountStatus || user?.verification_status || "not_verified";

  // Allow open public routes for everyone (even logged-in users)
  if (OPEN_PUBLIC_ROUTES.includes(location.pathname)) {
    return children;
  }

  // For auth-locked routes (e.g., login/signup), prevent access if authenticated
  if (isAuthenticated) {
    // If profile incomplete, go to required fill-details
    if (user?.profile_status === 1) {
      switch (user?.user_role) {
        case "STUDENT":
          return <Navigate to="/student-fill-account-details" replace />;
        case "COMPANY":
          return <Navigate to="/recruiter-fill-account-details" replace />;
        case "UNIVERSITY":
          return <Navigate to="/university-fill-account-details" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }

    // If profile complete, go to role dashboard
    switch (user?.user_role) {
      case "STUDENT":
        return <Navigate to="/all-jobs" replace />;
      case "COMPANY":
        return <Navigate to="/recruiter-dashboard" replace />;
      case "UNIVERSITY":
        if (universityAccountStatus === "not_verified") {
          return <Navigate to="/account-not-verified" replace />;
        }
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Not authenticated → allow access
  return children;
};

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RoleBasedDashboardRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <PublicRoute>
        <Main />
      </PublicRoute>
    ),
  },
 
  {
    path: "/account-not-verified",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]} requireProfileCompletion={false}>
        <AccountNotVerified />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />,
      </PublicRoute>
    ),
  },
  {
    path: "/login-send-otp-email",
    element: (
      <PublicRoute>
        <LoginSendOtpEmail />
      </PublicRoute>
    ),
  },
  {
    path: "/login-verify-otp-email",
    element: (
      <PublicRoute>
        <LoginVerifyOtpEmail />,
      </PublicRoute>
    ),
  },
  {
    path: "/signup-choose-role",
    element: (
      <PublicRoute>
        <SignUpChooseRole />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignUp />,
      </PublicRoute>
    ),
  },
  {
    path: "/terms-and-conditions",
    element: (
      <PublicRoute>
        <TermsAndConditions />,
      </PublicRoute>
    ),
  },
  {
    path: "/signup-verify-otp-email",
    element: (
      <PublicRoute>
        <SignUpVerifyOtpEmail />,
      </PublicRoute>
    ),
  },
  {
    path: "/student-fill-account-details",
    element: (
      <ProtectedRoute requireProfileCompletion={false}>
        <StudentFillAccountDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-template-selector",
    element: (
      <ProtectedRoute>
        <ResumeTemplateSelector />
      </ProtectedRoute>
    ),
  },
  {
    path: "/gst",
    element: (
      <ProtectedRoute>
        <GSTTestPage />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/aadhar",
    element: (
      <ProtectedRoute>
        <OfflineAadhaarKYC />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-builder/:templateId",
    element: (
      <ProtectedRoute>
        <ResumeBuilder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-template1",
    element: (
      <ProtectedRoute>
        <ResumeTemplate1 />
      </ProtectedRoute>
    ),
  },

  {
    path: "/resume-template2",
    element: (
      <ProtectedRoute>
        <ResumeTemplate2 />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/resume-builder",
  //   element: (
  //     <ProtectedRoute>
  //       <ResumeMaker />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: "/resume-template3",
    element: (
      <ProtectedRoute>
        <ResumeTemplate3 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-template4",
    element: (
      <ProtectedRoute>
        <ResumeTemplate4 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/resume-template5",
    element: (
      <ProtectedRoute>
        <ResumeTemplate5 />
      </ProtectedRoute>
    ),
  },

  {
    path: "/all-jobs",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <AllJObs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs/:job_id",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <JobDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-post/:slug",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedPostDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-user-activity",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedUserActivity />
      </ProtectedRoute>
    ),
  },

  {
    path: "/feed-my-profile",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedMyProfile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/public-profile/:uuid",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        {/* <FeedPublicProfile />  this is the old one */}
        <FeedPublicProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/public_profile/:uuid",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedPublicProfilePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/feed-view",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-authentication",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedAuthentication />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-authentication",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <CompanyAuthentication />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-authentication",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityGstAuthentication />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-terms",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedTerms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-resume",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedResume />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-ticket",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedTicket />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-profile",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <Feedprofile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-change-email",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedChangeEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-change-password",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT", "COMPANY", "UNIVERSITY"]}>
        <FeedChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-your-skills",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedYourSkills />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-your-education",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedYourEducation />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-your-experience",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedYourExprience />
      </ProtectedRoute>
    ),
  },

  {
    path: "/feed-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedDashBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feed-faq",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedFaq />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-application1",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyApplication1 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-application2",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyApplication2 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/generating-pathway",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <GeneratingPathway />
      </ProtectedRoute>
    ),
  },



  {
    path: "/my-application4",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyApplication4 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-application5",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyApplication5 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-application6",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyApplication6 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application-mymassage",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyMassage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/application-mynotification",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyNotification />
      </ProtectedRoute>
    ),
  },

  // the newly generated pathway pages
  {
    path: "/student-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mypathway",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <MyPathway />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pathways/resource/:id",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        < ResourceDetailPage />
      </ProtectedRoute>
    ),
  },
 
  {
    path: "/pathways/:id",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        < PathwayDetailView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-prediction/manage-pathway/:pathwayId",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <ManagePathwayPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/feed-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <FeedDashBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student-applications",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <StudentApplications />
      </ProtectedRoute>
    ),
  },

  // Recruiter related routes
  {
    path: "/recruiter-view",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-profile",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterProfile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-fill-account-details",
    element: (
      <ProtectedRoute
        requireProfileCompletion={false}
        allowedRoles={["COMPANY"]}
      >
        <CompanyRecruiterProfile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-dashboard",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-profile-edit",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <CompanyProfileEdit />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-post-job-intern-details",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPostJobInternDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/campus-hiring/create-job",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPostJobInternDetails />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-post-opportunity-selector",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPostOpportunitySelector />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-authentication",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <CompanyAuthentication />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterTotalJobPost />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/jobs/:job_id",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterJobDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-view-applications/:job_id",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterApplication />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-application-details/:job_id/:application_id",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterViewApplicationDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-application-data",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterApplicationData />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-send-assignment/:job_id/:application_id",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterSendAssignment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-schedule-interview/:job_id/:id",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterScheduleInterview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-pipeline",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruitePipeline />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-upcoming-interview",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterUpcomingInterviews />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-pending-task",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPendingTask />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/all-employees",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterAllEmployees />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/pending-employee-approvals",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPendingEmployeeApprovals />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/employees",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterEmployeeManagement />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-view",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-terms",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterTerms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-faq",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterFaq />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-ticket",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterTicket />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-pricing-page",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-pricing",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPricing />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter-payment-method",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPaymentMethod />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-payment-password",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-payment-success",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPaymentSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-change-email",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterChangeEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-payment",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterPayment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter-email-alert-settings",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <RecruiterEmailAlertSettings />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter/credits/pricing",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <CreditPacksPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter/credits/success",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <CreditPurchaseSuccess />
      </ProtectedRoute>
    ),
  },


  //Recruiter teams routes

  {
    path: "/recruiter/settings",
    element: <Navigate to="/recruiter/settings/team" replace />,
  },

  //  Team Members — requires `user.view.list`
  {
    path: "/recruiter/settings/team",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.view.list"]}
      >
        <TeamOverviewPage />
      </ProtectedRoute>
    ),
  },

   {
    path: "/recruiter/settings/team/add",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.view.list"]}
      >
        <AddMemberPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/settings/team/:membershipId",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.view.list"]}
      >
        <MemberDetailPage />
      </ProtectedRoute>
    ),
  },

  // Roles & Permissions — requires `user.manage.roles`
  {
    path: "/recruiter/settings/roles",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.manage.roles"]}
      >
        <TeamRolesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/settings/roles/create",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.manage.roles"]}
      >
        <CreateRolePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter/settings/roles/:roleId/edit",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.manage.roles"]}
      >
        <EditRolePage />
      </ProtectedRoute>
    ),
  },

  //  Email Alerts — personal setting, no extra permission needed
  {
    path: "/recruiter/settings/email-alerts",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <EmailAlertSettingsPage />
      </ProtectedRoute>
    ),
  },

  //  Profile — personal
  {
    path: "/recruiter/settings/profile",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <ProfileSettingsPage />
      </ProtectedRoute>
    ),
  },

  //  Security — personal (all COMPANY users can access)
  {
    path: "/recruiter/settings/security",
    element: (
      <ProtectedRoute allowedRoles={["COMPANY"]}>
        <SecuritySettingsPage />
      </ProtectedRoute>
    ),
  },

  // Company Info — typically Owner/Admin only (use `company.update.info` or `user.manage.roles`)
  {
    path: "/recruiter/settings/company",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["user.manage.roles"]} // or ["company.update.info"]
      >
        <CompanySettingsPage />
      </ProtectedRoute>
    ),
  },

  // Audit Log — Owner/Admin only
  {
    path: "/recruiter/settings/audit",
    element: (
      <ProtectedRoute
        allowedRoles={["COMPANY"]}
        requiredPermissions={["audit.view"]}
      >
        <AuditLogPage />
      </ProtectedRoute>
    ),
  },
  {
  path: "/recruiter/settings/job-access",
  element: (
    <ProtectedRoute
      allowedRoles={["COMPANY"]}
      requiredPermissions={["job.manage.access", "user.manage.roles"]} 
    >
      <JobAccessPage />
    </ProtectedRoute>
  ),
},


  // University related routes------------------------------------------------------------------------------------

  {
    path: "/university-fill-account-details",
    element: (
      <ProtectedRoute
        requireProfileCompletion={false}
        allowedRoles={["UNIVERSITY"]}
      >
        <UniversityFillDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-profile",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-profile-edit",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityProfileEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-public-profile",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityPublicProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-view",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-change-email",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityChangeEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-change-password",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityChangeEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-faq",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityFaq />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-terms",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityTerms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-view",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-ticket",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityTicket />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-pricing",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityPricing />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-payment",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityPayment />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-payment-method",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityPaymentMethod />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university-approval",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityApproval />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/jobs",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/jobs/:job_id",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityJobDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/all-students",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityAllStudents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/pending-approvals",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityPendingApprovals />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/credits/success",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <CreditPaymentSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/credits/pricing",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <CreditsPricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/credits/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        {/* <UniversityCreditDashboard /> */}
        <CreditDashboardPage />
      </ProtectedRoute>
    ),
  },
   {
    path: "/university/notifications",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        
        <NotificationUniversityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/notification-boost",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UniversityNotificationBoostPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/university/credits/transactions",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <CreditTransactionHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/university/credits/unlocked-contacts",
    element: (
      <ProtectedRoute allowedRoles={["UNIVERSITY"]}>
        <UnlockedContactsPage />
      </ProtectedRoute>
    ),
  },

  // Ai prediction related routes

  {
    path: "/ai-prediction",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        {/* <AiProfile /> */}
        <MyPathway/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-prediction/get-started",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AiGettingStarted />
      </ProtectedRoute>
    ),
  },
  {
    path: "/all-jobs-part",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AllJObsPart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-prediction/all-jobs",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AiAllJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-prediction/recommendations",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AiAllJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-company-role",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AiCompanyRoleSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ai-learning",
    element: (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <AiLearningPage />
      </ProtectedRoute>
    ),
  },


  //chat related routes
  {
    path: "/chat-home",
    element: (
      <ProtectedRoute>
        <ChatHome />
      </ProtectedRoute>
    ),
  },
  
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-test",
    element: (
      <ProtectedRoute>
        <PaymentTestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription-test",
    element: (
      <ProtectedRoute>
        <SubscriptionTestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/checkout",
    element: (
      <ProtectedRoute>
        <RecruiterCheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/checkout/college-specific",
    element: (
      <ProtectedRoute>
        <CollegeSpecificCheckoutPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/recruiter/job-posting/plan",
    element: (
      <ProtectedRoute>
        <JobPostingPlanPage />
      </ProtectedRoute>
    ),
  },

  
  {
    path: "/recruiter/payment-success",
    element: (
      <ProtectedRoute>
        <PaymentSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/billing/dashboard",
    element: (
      <ProtectedRoute>
        <RecruiterBillingDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "/pricing",
    element: (
      <ProtectedRoute>
        <SubscriptionPricingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout/subscription",
    element: (
      <ProtectedRoute>
        <SubscriptionCheckoutPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription/status",
    element: (
      <ProtectedRoute>
        <SubscriptionStatusPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subscription/success",
    element: (
      <ProtectedRoute>
        <SubscriptionSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recruiter/job-post-success",
    element: (
      <ProtectedRoute>
        <PaymentViaSubscriptionSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <NotificationPage />
      </ProtectedRoute>
    ),
  },


  // Public-facing marketing/info pages — accessible to all

{
  path: "/students",
  element: (
    <PublicRoute>
      <Students />
    </PublicRoute>
  ),
},
{
  path: "/recruiter",
  element: (
    <PublicRoute>
      <Recruiter />
    </PublicRoute>
  ),
},
// {
//   path: "/university",
//   element: (
//     <PublicRoute>
//       <University />
//     </PublicRoute>
//   ),
// },
// {
//   path: "/about",
//   element: (
//     <PublicRoute>
//       <About />
//     </PublicRoute>
//   ),
// },
{
  path: "/blogs",
  element: (
    <PublicRoute>
      <Blogs />
    </PublicRoute>
  ),
},
{
  path: "/blog2",
  element: (
    <PublicRoute>
      <Blog2 />
    </PublicRoute>
  ),
},
{
  path: "/support",
  element: (
    <PublicRoute>
      <Support />
    </PublicRoute>
  ),
},
{
  path: "/privacy",
  element: (
    <PublicRoute>
      <Privacy />
    </PublicRoute>
  ),
},
{
  path: "/faq",
  element: (
    <PublicRoute>
      <FAQ />
    </PublicRoute>
  ),
},

]);

function RoleBasedDashboardRedirect() {
  const { user } = useSelector((state) => state.auth);
  const universityAccountStatus =
    user?.accountStatus || user?.verification_status || "not_verified";

  if (user?.user_role === "STUDENT") return <Navigate to="/all-jobs" replace />;
  if (user?.user_role === "COMPANY") return <Navigate to="/recruiter-dashboard" replace />;
  if (user?.user_role === "UNIVERSITY") {
    if (universityAccountStatus === "not_verified") {
      return <Navigate to="/account-not-verified" replace />;
    }
    return <Navigate to="/university-profile" replace />;
  }
  return <Navigate to="/login" replace />;
}

