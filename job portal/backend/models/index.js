const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Models that export a function (old style)
const UserModel = require('./user');
const UserDetailModel = require('./userdetail');
const UniversityDetailModel = require('./universitydetail');
const SkillModel = require('./skill');
const UserSkillModel = require('./userSkill');
const JobPostModel = require('./jobpost');
const CompanyRecruiterProfileModel = require('./companyRecruiterProfile');
const ExperienceModel = require('./experience');
const ApplicationModel = require('./application');
const AssignmentModel = require('./Assignment');
const InterviewInvitationModel = require('./interviewInvitation');
const FeedPostModel = require('./feedPost');
const FollowModel = require('./follow');
const DomainModel = require('./domain');
const PostLikesModel = require('./postLikes');
const JobRoleModel = require('./jobrole');
const PostCommentsModel = require("./postComments");
// Models that export the model directly (new style)
const EducationModel = require('./education');
const SchoolCollegeModel = require('./schoolCollege');
const CourseModel = require('./course');
const SpecializationModel = require('./specialization');
const LocationModel = require('./location');
const FAQModel = require('./faq');
const LanguageModel = require('./language');
// SupportTicket model
const SupportTicketModel = require('./ticket');
const FilterOptionModel = require('./filterOption');
const JobPostCollegeModel = require('./jobPostColleges');
const JobPostCourseModel = require('./jobPostCourse');
const JobPostCityModel = require('./jobPostCities');
const JobPostSkillModel = require('./jobPostSkills');
const OTPModel = require('./otp');
const IndustryModel = require('./industry');
const UniversityCourseModel = require('./university_course');
const AuthorityModel = require("./authority");

const AssignmentSubmissionModel = require("./AssignmentSubmission");

//CHAT Models
const ConversationModel = require("./conversation");
const ConversationParticipantModel = require("./conversationParticipant");
const MessageModel = require("./message");
const MessageAttachmentModel = require("./messageAttachment");

const NotificationModel = require("./notification");
const BlogsModel = require("./blogs");
const AboutModel = require("./about");
const SupportModel = require("./support");
const StudentModel = require("./students");
const TermsModel = require("./terms");
const RecruiterModel = require("./recruiter");
const UniversityModel = require("./university");
const HomePlatformModel = require("./home_platform");
const HomeSuccessModel = require("./home_success");

// New  payment models
const OneTimePurchaseModel = require('./oneTimePurchase');
const PlanModel = require('./plan');
const PaymentOrderModel = require('./paymentOrder');
const PaymentTransactionModel = require('./paymentTransaction');

const CompanySubscriptionModel = require("./companySubscription");
const SubscriptionCreditLogModel = require("./subscriptionCreditLog");


//University Credits model

const UniversityCreditPackageModel = require('./universityCreditPackage');
const UniversityCreditOrderModel = require('./universityCreditOrder');
const UniversityCreditBatchModel = require('./universityCreditBatch');
const ContactUnlockModel = require('./contactUnlock');
const CreditLogModel = require('./creditLog');
const UniversityBroadcastModel = require('./UniversityBroadcast');
const UniversityNotificationCreditModel = require("./universityNotificationCredit");
const UniversityNotificationRequestModel = require("./universityNotificationRequest");
const UniversityNotificationCourseModel = require("./universityNotificationCourse");
const UniversityNotificationLogModel = require("./universityNotificationLog");
const UniversityNotificationPaymentModel = require("./universityNotificationPayment");


//Role- Permissions Model
const AccessScopeModel = require("./accessScope");
const UserAccessMembershipModel = require("./userAccessMembership");
const AccessRoleModel = require("./accessRole");
const PermissionModel = require("./permission");
const RolePermissionModel = require("./rolePermission");
const AuditLogModel = require("./auditLog");
const JobAccessModel = require("./jobAccess");

//Analytics Model 
const ProfileViewModel = require("./profileView");

//Ai-prdiction model
const LearningResourceModel = require("./learningResource");
const ResourceSkillModel = require("./resourceSkill");
const UserPathwayModel = require("./userPathway");
const PathwayStepModel = require("./pathwayStep");
const UserPathwayPreferenceModel = require("./userPathwayPreference");
const AiPathwayStepModel = require("./aiPathwayStep");
const AiPathwayProgressModel = require("./aiPathwayProgress");


const JobRoleDomainModel = require("./jobRoleDomain")

const NeedAssistanceModel = require("./needAssistance");








// Initialize basic models first
const Education = EducationModel(sequelize, DataTypes);
const JobPost = JobPostModel(sequelize, DataTypes);
const Specialization = SpecializationModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const UniversityCourse = UniversityCourseModel(sequelize, DataTypes);

// Initialize other models
const User = UserModel(sequelize, DataTypes);
const UserDetail = UserDetailModel(sequelize, DataTypes);
const UniversityDetail = UniversityDetailModel(sequelize, DataTypes);
const Skill = SkillModel(sequelize, DataTypes);
const UserSkill = UserSkillModel(sequelize, DataTypes);
const CompanyRecruiterProfile = CompanyRecruiterProfileModel(sequelize, DataTypes);
const Experience = ExperienceModel(sequelize, DataTypes);
const FeedPost = FeedPostModel(sequelize, DataTypes);
const Follow = FollowModel(sequelize, DataTypes);
const Domain = DomainModel(sequelize, DataTypes);
const JobRole = JobRoleModel(sequelize, DataTypes);
const Location = LocationModel(sequelize, DataTypes);
const SchoolCollege = SchoolCollegeModel(sequelize, DataTypes);
const Application = ApplicationModel(sequelize, DataTypes);
const Assignment = AssignmentModel(sequelize, DataTypes);
const InterviewInvitation = InterviewInvitationModel(sequelize, DataTypes);
const PostLikes = PostLikesModel(sequelize, DataTypes);
const PostComments = PostCommentsModel(sequelize, DataTypes);
const FAQ = FAQModel(sequelize, DataTypes);
const FilterOption = FilterOptionModel(sequelize, DataTypes);
const SupportTicket = SupportTicketModel(sequelize, DataTypes);
const JobPostCollege = JobPostCollegeModel(sequelize, DataTypes);
const JobPostCourse = JobPostCourseModel(sequelize, DataTypes);
const Language = LanguageModel(sequelize, DataTypes);
const JobPostCity = JobPostCityModel(sequelize, DataTypes);
const JobPostSkill = JobPostSkillModel(sequelize, DataTypes);
const OTP = OTPModel(sequelize, DataTypes);
const Industry = IndustryModel(sequelize, DataTypes);
const Authority = AuthorityModel(sequelize, DataTypes);
const AssignmentSubmission = AssignmentSubmissionModel(sequelize, DataTypes);

const Conversation = ConversationModel(sequelize, DataTypes);
const ConversationParticipant = ConversationParticipantModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);
const MessageAttachment = MessageAttachmentModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);

// Initialize payment models
const OneTimePurchase = OneTimePurchaseModel(sequelize, DataTypes);
const Plan = PlanModel(sequelize, DataTypes);
const PaymentOrder = PaymentOrderModel(sequelize, DataTypes);
const PaymentTransaction = PaymentTransactionModel(sequelize, DataTypes);

const CompanySubscription = CompanySubscriptionModel(sequelize, DataTypes);
const SubscriptionCreditLog = SubscriptionCreditLogModel(sequelize, DataTypes);

//University credit models
const UniversityCreditPackage = UniversityCreditPackageModel(sequelize, DataTypes);
const UniversityCreditOrder = UniversityCreditOrderModel(sequelize, DataTypes);
const UniversityCreditBatch = UniversityCreditBatchModel(sequelize, DataTypes);
const ContactUnlock = ContactUnlockModel(sequelize, DataTypes);
const CreditLog = CreditLogModel(sequelize, DataTypes);
const UniversityBroadcast = UniversityBroadcastModel(sequelize, DataTypes);
const UniversityNotificationCredit = UniversityNotificationCreditModel(sequelize, DataTypes);
const UniversityNotificationRequest = UniversityNotificationRequestModel(sequelize, DataTypes);
const UniversityNotificationCourse = UniversityNotificationCourseModel(sequelize, DataTypes);
const UniversityNotificationLog = UniversityNotificationLogModel(sequelize, DataTypes);
const UniversityNotificationPayment = UniversityNotificationPaymentModel(sequelize, DataTypes);

//blogs
const Blog = BlogsModel(sequelize, DataTypes);
const About = AboutModel(sequelize, DataTypes);
const Support = SupportModel(sequelize, DataTypes);
const Students = StudentModel(sequelize, DataTypes);
const Terms = TermsModel(sequelize, DataTypes);
const Recruiter = RecruiterModel(sequelize, DataTypes);
const University = UniversityModel(sequelize, DataTypes);
const HomePlatform = HomePlatformModel(sequelize, DataTypes);
const HomeSuccess = HomeSuccessModel(sequelize, DataTypes);

//Role based models
const AccessScope = AccessScopeModel(sequelize, DataTypes);
const UserAccessMembership = UserAccessMembershipModel(sequelize, DataTypes);
const AccessRole = AccessRoleModel(sequelize, DataTypes);
const Permission = PermissionModel(sequelize, DataTypes);
const RolePermission = RolePermissionModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const JobAccess = JobAccessModel(sequelize, DataTypes);

//analytics model
const ProfileView = ProfileViewModel(sequelize, DataTypes);

//ai PRediction models
const LearningResource = LearningResourceModel(sequelize, DataTypes);
const ResourceSkill = ResourceSkillModel(sequelize, DataTypes);
const UserPathway = UserPathwayModel(sequelize, DataTypes);
const PathwayStep = PathwayStepModel(sequelize, DataTypes);
const UserPathwayPreference = UserPathwayPreferenceModel(sequelize, DataTypes);
const AiPathwayStep = AiPathwayStepModel(sequelize, DataTypes);
const AiPathwayProgress = AiPathwayProgressModel(sequelize, DataTypes);

const JobRoleDomain = JobRoleDomainModel(sequelize, DataTypes);

const NeedAssistance = NeedAssistanceModel(sequelize, DataTypes);





// Create models object with all models
const models = {
  Course,
  Specialization,
  Language,
  Industry,
  UniversityCourse,
  User,
  UserDetail,
  UniversityDetail,
  UserSkill,
  JobPost,
  CompanyRecruiterProfile,
  Experience,
  FeedPost,
  Follow,
  Domain,
  Skill,
  Application,
  Assignment,
  InterviewInvitation,
  PostLikes,
  PostComments,
  Education,
  SchoolCollege,
  Location,
  FAQ,
  SupportTicket,
  FilterOption,
  JobRole,
  JobPostCollege,
  JobPostCourse,
  JobPostCity,
  JobPostSkill,
  OTP,
  Authority,
  AssignmentSubmission,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  Notification,
  // Payment Models
  OneTimePurchase,
  Plan,
  PaymentOrder,
  PaymentTransaction,
  CompanySubscription,
  SubscriptionCreditLog,
  //University payment crdits model
  UniversityCreditPackage,
  UniversityCreditOrder,
  UniversityCreditBatch,
  ContactUnlock,
  CreditLog,
  UniversityBroadcast,
  UniversityNotificationCredit,
  UniversityNotificationRequest,
  UniversityNotificationCourse,
  UniversityNotificationLog,
  UniversityNotificationPayment,
  Blog,
  About,
  Support,
  Students,
  Terms,
  Recruiter,
  University,
  HomePlatform,
  HomeSuccess,

  //Role  based access models
  AccessScope,
  UserAccessMembership,
  AccessRole,
  Permission,
  RolePermission,
  AuditLog,
  JobAccess,

  //Analytics Model
  ProfileView,

  //Ai prediction models
  LearningResource,
  ResourceSkill,
  UserPathway,
  PathwayStep,
  UserPathwayPreference,
  AiPathwayStep,
  AiPathwayProgress,

  JobRoleDomain,

  NeedAssistance,
};

// Call model associations
if (Industry.associate) Industry.associate(models);
if (SupportTicket.associate) SupportTicket.associate(models);
if (UniversityCourse.associate) UniversityCourse.associate(models);
if (User.associate) User.associate(models);
if (UserDetail.associate) UserDetail.associate(models);
if (UniversityDetail.associate) UniversityDetail.associate(models);
if (JobRole.associate) JobRole.associate(models);
if (JobPost.associate) JobPost.associate(models);
if (UserSkill.associate) UserSkill.associate(models);
if (CompanyRecruiterProfile.associate) CompanyRecruiterProfile.associate(models);
if (Experience.associate) Experience.associate(models);
if (Application.associate) Application.associate(models);
if (Assignment.associate) Assignment.associate(models);
if (InterviewInvitation.associate) InterviewInvitation.associate(models);
if (FeedPost.associate) FeedPost.associate(models);
if (Follow.associate) Follow.associate(models);
if (Skill.associate) Skill.associate(models);
if (PostLikes.associate) PostLikes.associate(models);
if (FilterOption.associate) FilterOption.associate(models);
if (SchoolCollege.associate) SchoolCollege.associate(models);
if (Course.associate) Course.associate(models);
if (Specialization.associate) Specialization.associate(models);
if (Education.associate) Education.associate(models);
if (JobPostCollege.associate) JobPostCollege.associate(models);
if (JobPostCourse.associate) JobPostCourse.associate(models);
if (JobPostCity.associate) JobPostCity.associate(models);
if (JobPostSkill.associate) JobPostSkill.associate(models);
if (OTP.associate) OTP.associate(models);
if (Language.associate) Language.associate(models);
if (Authority.associate) Authority.associate(models);
if (PostComments.associate) PostComments.associate(models);
if (Conversation.associate) Conversation.associate(models);
if (ConversationParticipant.associate) ConversationParticipant.associate(models);
if (Message.associate) Message.associate(models);
if (MessageAttachment.associate) MessageAttachment.associate(models);
if (Notification.associate) Notification.associate(models);
if (AssignmentSubmission.associate) AssignmentSubmission.associate(models);

if (OneTimePurchase.associate) OneTimePurchase.associate(models);
if (Plan.associate) Plan.associate(models);
if (PaymentOrder.associate) PaymentOrder.associate(models);
if (PaymentTransaction.associate) PaymentTransaction.associate(models);

if (CompanySubscription.associate) CompanySubscription.associate(models);
if (SubscriptionCreditLog.associate) SubscriptionCreditLog.associate(models);

if (UniversityCreditPackage.associate) UniversityCreditPackage.associate(models);
if (UniversityCreditOrder.associate) UniversityCreditOrder.associate(models);
if (UniversityCreditBatch.associate) UniversityCreditBatch.associate(models);
if (ContactUnlock.associate) ContactUnlock.associate(models);
if (CreditLog.associate) CreditLog.associate(models);
if (UniversityBroadcast.associate) UniversityBroadcast.associate(models);
if (UniversityNotificationCredit.associate) UniversityNotificationCredit.associate(models);
if (UniversityNotificationRequest.associate) UniversityNotificationRequest.associate(models);
if (UniversityNotificationCourse.associate) UniversityNotificationCourse.associate(models);
if (UniversityNotificationLog.associate) UniversityNotificationLog.associate(models);
if (UniversityNotificationPayment.associate) UniversityNotificationPayment.associate(models);

if (Blog.associate) Blog.associate(models);
if (About.associate) About.associate(models);
if (Support.associate) Support.associate(models);
if (Students.associate) Students.associate(models);
if (Terms.associate) Terms.associate(models);
if (Recruiter.associate) Recruiter.associate(models);
if (University.associate) University.associate(models);
if (HomePlatformModel.associate) HomePlatformModel.associate(models);
if (HomeSuccessModel.associate) HomeSuccessModel.associate(models);


//RBAC models
if (AccessScope.associate) AccessScope.associate(models);
if (UserAccessMembership.associate) UserAccessMembership.associate(models);
if (AccessRole.associate) AccessRole.associate(models);
if (Permission.associate) Permission.associate(models);
if (RolePermission.associate) RolePermission.associate(models);
if (AuditLog.associate) AuditLog.associate(models);
if (JobAccess.associate) JobAccess.associate(models);

//Analytics models
if (ProfileView.associate) ProfileView.associate(models);

//ai prediction models
if (LearningResource.associate) LearningResource.associate(models);
if (ResourceSkill.associate) ResourceSkill.associate(models);
if (UserPathwayPreference.associate) UserPathwayPreference.associate(models);
if (UserPathway.associate) UserPathway.associate(models);
if (PathwayStep.associate) PathwayStep.associate(models);
if (AiPathwayStep.associate) AiPathwayStep.associate(models);
if (AiPathwayProgress.associate) AiPathwayProgress.associate(models);

if (JobRoleDomain.associate) JobRoleDomain.associate(models);

if (NeedAssistance.associate) NeedAssistance.associate(models);


module.exports = {
  sequelize,
  Language,
  User,
  UserDetail,
  UniversityDetail,
  UserSkill,
  JobPost,
  CompanyRecruiterProfile,
  Experience,
  FeedPost,
  Follow,
  Domain,
  Skill,
  Application,
  Assignment,
  InterviewInvitation,
  PostLikes,
  Education,
  SchoolCollege,
  Course,
  Specialization,
  Location,
  FAQ,
  SupportTicket,
  FilterOption,
  JobRole,
  JobPostCollege,
  JobPostCourse,
  JobPostCity,
  JobPostSkill,
  OTP,
  Language,
  Industry,
  UniversityCourse,
  Authority,
  PostComments,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  Notification,
  AssignmentSubmission,
  OneTimePurchase,
  Plan,
  PaymentOrder,
  PaymentTransaction,
  CompanySubscription,
  SubscriptionCreditLog,
  //university credits model
  UniversityCreditPackage,
  UniversityCreditOrder,
  UniversityCreditBatch,
  ContactUnlock,
  CreditLog,
  UniversityBroadcast,
  UniversityNotificationCredit,
  UniversityNotificationRequest,
  UniversityNotificationCourse,
  UniversityNotificationLog,
  UniversityNotificationPayment,
  Blog,
  About,
  Support,
  Students,
  Terms,
  Recruiter,
  University,
  HomePlatform,
  HomeSuccess,

  AccessScope,
  UserAccessMembership,
  AccessRole,
  Permission,
  RolePermission,
  AuditLog,
  JobAccess,

  ProfileView,

  LearningResource,
  ResourceSkill,
  UserPathway,
  PathwayStep,
  UserPathwayPreference,
  AiPathwayStep,
  AiPathwayProgress,

  JobRoleDomain,

  NeedAssistance,
};


{/*
steps to follow registering new models and their associations
1. import the model
2. initialization
3. Models Object 
4. Associations call


ex:

step1:Import
const IndusrtyModel=require('./industry');

step2:
const Industry=IndusrtyModel(sequelize,DataTypes);

step3:
const models={Industry};

step4:
if(Industry.associate) Industry.associate(models);

*/}