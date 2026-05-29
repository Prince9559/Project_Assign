// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   ChevronRight,
//   User,
//   FileText,
//   Bell,
//   Settings,
//   LogOut,
//   Mail,
//   Lock,
//   Trash2,
//   HelpCircle,
//   Shield,
// } from 'lucide-react';
// import { HiOutlineEye } from 'react-icons/hi';
// import RecruiterRightSidebarWithoutJobPost from './RecruiterRightSidebarWithoutJobPost';   
// import FeedRightSidebar from "../../student/feed/FeedRightSidebar"
// import MainLayout from '../../../components/layout/MainLayout';
// import { useDispatch,useSelector } from 'react-redux';
// import { logout } from '../../../redux/feature/authSlice';
// import { getImageUrl } from '../../../../utils';
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg"


// const  RecruiterProfile = () => {
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const toggleDropdown = (id) => {
//     setActiveDropdown(activeDropdown === id ? null : id);
//   };
//   const {user,token}= useSelector((state)=> state.auth);

//   const profileOptions = [
//     {
//       id: 'profile',
//       icon: <User size={20} />,
//       title: 'Company Details',
//       subtitle: 'View Company Profile',
//       hasChevron: true,
//       action: () => navigate('/recruiter-profile-edit'),
//     },
//     {
//       id: 'employees',
//       icon: <Users size={20} />,
//       title: 'Employees',
//       subtitle: 'Manage employees and their approvals',
//       hasChevron: true,
//       action: () => navigate('/recruiter/employees'),
//     },
//     // {
//     //   id: 'terms',
//     //   icon: <Shield size={20} />,
//     //   title: 'Terms & Conditions',
//     //   hasChevron: true,
//     //   action: () => navigate('/recruiter-terms'),
//     // },
//     {
//       id: 'help',
//       icon: <HelpCircle size={20} />,
//       title: 'Help & Support',
//       hasChevron: true,
//       action: () => navigate('/recruiter-faq'),
//       // no navigate here → handled by toggleDropdown
//     },
//     {
//       id: 'manage',
//       icon: <Settings size={20} />,
//       title: 'Manage Account',
//       hasChevron: true,
//       // no navigate here → handled by toggleDropdown
//     },
//     // {
//     //   id: 'notifications',
//     //   icon: <Bell size={20} />,
//     //   title: 'Notifications',
//     //   hasChevron: true,
//     //   action: () => navigate('/notifications'),
//     // },
//     {
//       id: 'billing',
//       icon: <HelpCircle size={20} />,
//       title: 'Manage Plans and Billing',
//       hasChevron: true,
//       action: () => navigate('/recruiter/billing/dashboard'),
//       // no navigate here → handled by toggleDropdown
//     },
//     {
//       id: 'teams',
//       icon: <HelpCircle size={20} />,
//       title: 'Manage Roles and Permissions',
//       hasChevron: true,
//       action: () => navigate('/recruiter/settings/team'),
//       // no navigate here → handled by toggleDropdown
//     },
//     {
//       id: 'logout',
//       icon: <LogOut size={20} />,
//       title: 'Log out',
//       subtitle: 'Further secure your account for safety',
//       hasChevron: true,
//       action: () => {
//         dispatch(logout());
//         navigate('/login');
//       },
//     },
//   ];

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block "></div>
//         <section className="w-full  h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
//           {/* Profile Header */}
//           <div className="bg-[#002B6B] text-white p-3 sm:p-4 lg:p-4 flex flex-col sm:flex-row sm:items-center justify-between rounded-[5px] gap-3 sm:gap-4">
//             <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4">
//               {/* <img
//                 src={user.user_profile_pic ? getImageUrl(user.user_profile_pic) : dummyProfile3}
//                 alt="avatar"
//                 className="flex-shrink-0 object-cover w-12 h-12 rounded-md sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18"
//               /> */}
//               <div className="flex-1 min-w-0">
//                 <h1 className="text-base font-semibold truncate sm:text-lg md:text-xl lg:text-2xl">Settings and Access Panel</h1>
//                 {/* <h1 className="text-base font-semibold truncate sm:text-lg md:text-xl lg:text-2xl">{user.first_name + " " + user.last_name}</h1> */}
//                 {/* <p className="text-xs text-gray-200 truncate sm:text-sm">{user.email}</p>
//                 <p className="text-xs text-gray-200 truncate sm:text-sm">{user.user_role}</p> */}
//               </div>
//             </div>
//             {/* <button
//               className="border bg-white border-white rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-[#002B6B] transition-colors flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto whitespace-nowrap min-h-[44px] sm:min-h-[40px]"
//               onClick={() => navigate('/recruiter-profile-edit')}
//             >
//               <HiOutlineEye size={14} className="sm:w-4 sm:h-4" />
//               <span className="hidden xs:inline">Profile</span>
//               <span className="xs:hidden">View</span>
//             </button> */}
//           </div>

//           {/* Main Content */}
//           <div className="p-3 sm:p-4 lg:p-6 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 sm:space-y-2">
//             {profileOptions.map((option) => (
//               <div key={option.id}>
//                 <button
//                   onClick={() => {
//                     if (option.id === 'manage') {
//                       toggleDropdown(option.id);
//                     } else {
//                       option.action?.();
//                     }
//                   }}
//                   className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 min-h-[60px] sm:min-h-[64px] md:min-h-[72px]"
//                 >
//                   <div className="flex items-center w-[641px] h-[40px] gap-[15px] opacity-100">
//                     <div className="w-[40px] h-[40px] opacity-100 bg-gray-100 rounded-full flex items-center justify-center">
//                       <div className="text-gray-600 w-[40px] h-[40px] flex items-center justify-center opacity-100">
//                         {option.icon}
//                       </div>
//                     </div>
//                     <div className="flex flex-col w-auto text-left opacity-100">
//                       <span className="text-sm font-medium text-gray-900 sm:text-base md:text-medium lg:text-medium">
//                         {option.title}
//                       </span>
//                       {option.subtitle && (
//                         <span className="text-xs text-gray-400 sm:text-sm md:text-base">
//                           {option.subtitle}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {option.hasChevron && (
//                     <ChevronRight size={18} className="flex-shrink-0 ml-2 text-gray-400 sm:ml-3" />
//                   )}
//                 </button>

//                 {/* Dropdowns */}
//                 {activeDropdown === option.id && (
//                     <div className="mt-1 ml-10 space-y-1 sm:ml-12 md:ml-14 lg:ml-16 sm:mt-2 sm:space-y-2">
//                       {(activeDropdown === 'help'
//                         ? [
//                             {
//                               icon: <Settings size={16} />,
//                               label: 'Raise a ticket',
//                               action: () => navigate('/recruiter-ticket'),
//                             },
//                             {
//                               icon: <Settings size={16} />,
//                               label: 'Chat with us!',
//                               action: () => navigate('/feed-help'),
//                             },
//                           ]
//                         : [
//                             // {
//                             //   icon: <Mail size={16} />,
//                             //   label: 'Change email',
//                             //   action: () => navigate('/recruiter-change-email'),
//                             // },
//                             {
//                               icon: <Lock size={16} />,
//                               label: 'Change password',
//                               action: () => navigate('/feed-change-password'),
//                             },
//                             {
//                               icon: <Trash2 size={16} />,
//                               label: 'Delete my account',
//                               action: () => console.log('Delete account'),
//                             },
//                           ]
//                       ).map((item, i) => (
//                         <button
//                           key={i}
//                           onClick={item.action}
//                           className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px] sm:min-h-[52px]"
//                         >
//                           <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-600 bg-gray-100 rounded-full sm:w-10 sm:h-10">
//                             <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
//                               {item.icon}
//                             </div>
//                           </div>
//                           <span className="text-sm font-medium text-gray-900 truncate sm:text-base md:text-lg">
//                             {item.label}
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   )}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Profile Card */}
//         {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside> */}
//         {/* Right Spacer */}
//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default RecruiterProfile;











import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  User,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  Mail,
  Lock,
  Trash2,
  HelpCircle,
  Shield,
} from 'lucide-react';
import MainLayout from '../../../components/layout/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../redux/feature/authSlice';

// Imported the UI components to match UniversityProfile
import SettingsHeader from "../../../components/jobs/SettingsHeader.jsx";
import SettingsOptionCard from "../../../components/jobs/SettingOptionCard.jsx";

const RecruiterProfile = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  const { user, token } = useSelector((state) => state.auth);

  const profileOptions = [
    {
      id: 'profile',
      icon: <User size={20} />,
      title: 'Company Details',
      subtitle: 'View Company Profile',
      hasChevron: true,
      action: () => navigate('/recruiter-profile-edit'),
    },
    {
      id: 'employees',
      icon: <Users size={20} />,
      title: 'Employees',
      subtitle: 'Manage employees and their approvals',
      hasChevron: true,
      action: () => navigate('/recruiter/employees'),
    },
    {
      id: 'help',
      icon: <HelpCircle size={20} />,
      title: 'Help & Support',
      hasChevron: true,
      action: () => toggleDropdown('help'),
    },
    {
      id: 'manage',
      icon: <Settings size={20} />,
      title: 'Manage Account',
      hasChevron: true,
      action: () => toggleDropdown('manage'),
    },
    {
      id: 'billing',
      icon: <HelpCircle size={20} />,
      title: 'Manage Plans and Billing',
      hasChevron: true,
      action: () => navigate('/recruiter/billing/dashboard'),
    },
    {
      id: 'teams',
      icon: <HelpCircle size={20} />,
      title: 'Manage Roles and Permissions',
      hasChevron: true,
      action: () => navigate('/recruiter/settings/team'),
    },
    {
      id: 'logout',
      icon: <LogOut size={20} />,
      title: 'Log out',
      subtitle: 'Further secure your account for safety',
      hasChevron: true,
      action: () => {
        dispatch(logout());
        navigate('/login');
      },
    },
  ];

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-50 lg:px-8">
        {/* Left Spacer */}
        <div className="flex-grow hidden lg:block"></div>

        <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-4 sm:p-5 lg:p-6 rounded-2xl border border-gray-100 bg-white flex flex-col shadow-sm gap-4 mt-4 mx-auto mb-10">
          
          <SettingsHeader title="Settings and Access Panel" />

          <div className="p-1 sm:p-2 overflow-y-auto space-y-4">
            {profileOptions.map((option) => (
              <div key={option.id}>
                
                <SettingsOptionCard
                  icon={option.icon}
                  title={option.title}
                  subtitle={option.subtitle}
                  showChevron={option.hasChevron}
                  onClick={() => {
                    if (option.action) {
                      option.action();
                    }
                  }}
                />

                {/* Dropdowns Menu (Matching the exact styling from University Profile) */}
                {activeDropdown === option.id && (
                  <div className="mt-3 ml-4 sm:ml-16 pl-4 border-l-2 border-gray-100 space-y-2">
                    {(option.id === 'help'
                      ? [
                          {
                            icon: <Settings size={16} />,
                            label: 'Raise a ticket',
                            action: () => navigate('/recruiter-ticket'),
                          },
                          {
                            icon: <Settings size={16} />,
                            label: 'Chat with us!',
                            action: () => navigate('/feed-help'),
                          },
                        ]
                      : [
                          {
                            icon: <Lock size={16} />,
                            label: 'Change password',
                            action: () => navigate('/feed-change-password'),
                          },
                          {
                            icon: <Trash2 size={16} />,
                            label: 'Delete my account',
                            action: () => console.log('Delete account'),
                          },
                        ]
                    ).map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#9bc87c]/50 hover:bg-[#9bc87c]/5 active:bg-gray-100 transition-colors min-h-[48px] sm:min-h-[52px] group shadow-sm"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-[#1e1e2d] bg-gray-50 border border-gray-100 group-hover:border-[#9bc87c]/50 group-hover:bg-white rounded-lg transition-colors">
                          <div
                            className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                              item.label === "Delete my account"
                                ? "text-red-500"
                                : "group-hover:text-[#1DB32F]"
                            }`}
                          >
                            {item.icon}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold truncate transition-colors ${
                            item.label === "Delete my account"
                              ? "text-red-500"
                              : "text-[#1e1e2d] group-hover:text-[#1DB32F]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right Spacer */}
        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default RecruiterProfile;