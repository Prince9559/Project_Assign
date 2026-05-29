// import React, { useState } from 'react';
// import { Input, Button } from '../../../components/ui';
// import MainLayout from '../../../components/layout/MainLayout';
// import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
// import FeedRightSidebar from '../feed/FeedRightSidebar';
// import { userProfileApi } from '../../../api/userProfileApi';
// import { useSelector } from 'react-redux';

// const FeedChangePassword = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [retypePassword, setRetypePassword] = useState('');
//   const [showOldPassword, setShowOldPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showRetypePassword, setShowRetypePassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   //  Get token from Redux store
//   const token = useSelector((state) => state.auth.token);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess(false);

//     //  Validation
//     if (!oldPassword.trim() || !newPassword.trim() || !retypePassword.trim()) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError('New password must be at least 6 characters long.');
//       return;
//     }

//     if (newPassword !== retypePassword) {
//       setError('New password and retype password do not match.');
//       return;
//     }

//     setLoading(true);
//     try {
//       //  Only send what backend expects
//       const payload = { oldPassword, newPassword };

//       await userProfileApi.changePassword(payload, token);

//       setSuccess(true);
//       // Clear form
//       setOldPassword('');
//       setNewPassword('');
//       setRetypePassword('');
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ||
//         err?.message ||
//         'Failed to change password. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="flex justify-between min-h-screen gap-2 px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block"></div>

//         {/* Password Change Section */}
//         <section className="bg-white rounded-[10px] p-5 shadow-lg mt-2 w-[780px] h-[500px] opacity-100 gap-[10px]">
//           <h2 className="mb-1 text-2xl font-bold sm:text-3xl">Change password</h2>
//           <p className="mb-4 text-xs text-gray-500 sm:text-sm">
//             Please enter your current password and choose a new password to update your account security.
//           </p>

//           <form className="flex flex-col flex-1 gap-4" onSubmit={handleSubmit}>
//             {/* Old Password Input */}
//             <div className="relative">
//               <Input
//                 label="Old password"
//                 type={showOldPassword ? 'text' : 'password'}
//                 value={oldPassword}
//                 onChange={e => setOldPassword(e.target.value)}
//                 placeholder="Enter your current password"
//                 required
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 bg-white bottom-2.5 text-gray-400 hover:text-gray-700 focus:outline-none"
//                 tabIndex={-1}
//                 onClick={() => setShowOldPassword((prev) => !prev)}
//               >
//                 {showOldPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
//               </button>
//             </div>

//             {/* New Password Input */}
//             <div className="relative">
//               <Input
//                 label="New password"
//                 type={showNewPassword ? 'text' : 'password'}
//                 value={newPassword}
//                 onChange={e => setNewPassword(e.target.value)}
//                 placeholder="Enter your new password"
//                 required
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 bg-white bottom-2.5 text-gray-400 hover:text-gray-700 focus:outline-none"
//                 tabIndex={-1}
//                 onClick={() => setShowNewPassword((prev) => !prev)}
//               >
//                 {showNewPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
//               </button>
//             </div>

//             {/* Retype Password Input */}
//             <div className="relative">
//               <Input
//                 label="Retype password"
//                 type={showRetypePassword ? 'text' : 'password'}
//                 value={retypePassword}
//                 onChange={e => setRetypePassword(e.target.value)}
//                 placeholder="Confirm your new password"
//                 required
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 bg-white bottom-2.5 text-gray-400 hover:text-gray-700 focus:outline-none"
//                 tabIndex={-1}
//                 onClick={() => setShowRetypePassword((prev) => !prev)}
//               >
//                 {showRetypePassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
//               </button>
//             </div>

//             {/* Messages */}
//             {error && <div className="text-xs text-red-500">{error}</div>}
//             {success && <div className="text-xs text-green-600">Password changed successfully!</div>}
            
//             {/* Submit Button */}
//             <div className="flex justify-center mt-2">
//               <Button
//                 type="submit"
//                 className="w-full sm:w-[180px] h-[44px] sm:h-[48px] text-base rounded-full bg-[#F44336] hover:bg-[#d32f2f]"
//                 loading={loading}
//               >
//                 Save Changes
//               </Button>
//             </div>
//           </form>
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

// export default FeedChangePassword;





















import React, { useState } from 'react';
import { Input, Button } from '../../../components/ui';
import MainLayout from '../../../components/layout/MainLayout';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import FeedRightSidebar from '../feed/FeedRightSidebar';
import { userProfileApi } from '../../../api/userProfileApi';
import { useSelector } from 'react-redux';

const FeedChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  //  Get token from Redux store
  const token = useSelector((state) => state.auth.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    //  Validation
    if (!oldPassword.trim() || !newPassword.trim() || !retypePassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== retypePassword) {
      setError('New password and retype password do not match.');
      return;
    }

    setLoading(true);
    try {
      //  Only send what backend expects
      const payload = { oldPassword, newPassword };

      await userProfileApi.changePassword(payload, token);

      setSuccess(true);
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setRetypePassword('');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between min-h-screen gap-2 px-4 bg-gray-50 lg:px-8 custom-form-wrapper">
        {/* Left Spacer */}
        <div className="flex-grow hidden lg:block"></div>

        {/* Password Change Section */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mt-6 w-full max-w-[780px] h-fit mb-10">
          <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl text-[#1e1e2d]">Change password</h2>
          <p className="mb-6 text-sm font-medium text-gray-500 sm:text-base">
            Please enter your current password and choose a new password to update your account security.
          </p>

          <form className="flex flex-col flex-1 gap-5 custom-inputs" onSubmit={handleSubmit}>
            {/* Old Password Input */}
            <div className="relative">
              <Input
                label="Old password"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute text-gray-400 bg-white right-3 top-[34px] p-1 rounded-md hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowOldPassword((prev) => !prev)}
              >
                {showOldPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            {/* New Password Input */}
            <div className="relative">
              <Input
                label="New password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute text-gray-400 bg-white right-3 top-[34px] p-1 rounded-md hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            {/* Retype Password Input */}
            <div className="relative">
              <Input
                label="Retype password"
                type={showRetypePassword ? 'text' : 'password'}
                value={retypePassword}
                onChange={e => setRetypePassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute text-gray-400 bg-white right-3 top-[34px] p-1 rounded-md hover:text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowRetypePassword((prev) => !prev)}
              >
                {showRetypePassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm font-medium text-[#1DB32F] bg-[#1DB32F]/10 border border-[#1DB32F]/20 rounded-lg">
                Password changed successfully!
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex mt-2">
              <Button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 text-base font-bold rounded-xl shadow-sm submit-btn-override"
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* Profile Card (only on large screens) */}
        {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}

        {/* Right Spacer */}
        <div className="flex-grow hidden lg:block"></div>
      </div>

      {/* Force-Override CSS for Custom UI Components */}
      <style>{`
        /* Force Input Focus states to Scilienttech Green */
        .custom-inputs input:hover {
          border-color: #9bc87c !important;
        }

        .custom-inputs input:focus,
        .custom-inputs input:focus-visible {
          outline: none !important;
          border-color: #9bc87c !important;
          box-shadow: 0 0 0 2px rgba(155, 200, 124, 0.3) !important;
        }

        /* Force Button colors to override default variants */
        .submit-btn-override {
          background-color: #9bc87c !important;
          color: white !important;
          border: none !important;
        }

        .submit-btn-override:hover {
          background-color: #8ab76b !important;
        }
      `}</style>
    </MainLayout>
  );
};

export default FeedChangePassword;