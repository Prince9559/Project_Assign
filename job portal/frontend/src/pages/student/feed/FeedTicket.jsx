// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { Input, RadioGroup, Textarea, Button } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { ticketApi } from "../../../api/ticketApi";

// const PRIORITY_OPTIONS = [
//   { label: "High", value: "high" },
//   { label: "Medium", value: "medium" },
//   { label: "Low", value: "low" },
// ];

// const FeedTicket = () => {
//   const { user } = useSelector((state) => state.auth);
//   const userEmail = user?.email || "";

//   const [priority, setPriority] = useState("medium");
//   const [issue_title, setIssueTitle] = useState("");
//   const [body, setBody] = useState("");
//   const [localError, setLocalError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [apiError, setApiError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLocalError("");
//     setApiError("");

//     if (!issue_title.trim()) {
//       setLocalError("Please enter the issue title.");
//       return;
//     }

//     if (!body.trim()) {
//       setLocalError("Please enter the issue details.");
//       return;
//     }

//     const ticketData = {
//       issue_title: issue_title.trim(),
//       issue_detail: body.trim(),
//       role: user.user_role,
//       email: userEmail, 
//       priority,
//     };

//     try {
//       setIsLoading(true);
//       await ticketApi.raiseTicket(ticketData);
      
//       // Reset form on success
//       setIssueTitle("");
//       setBody("");
//       setPriority("medium");
//       setIsSuccess(true);
      
//       // Reset success message after 3 seconds
//       setTimeout(() => {
//         setIsSuccess(false);
//       }, 3000);
//     } catch (error) {
//       console.error("Failed to raise ticket:", error);
//       setApiError(error.message || "Failed to submit ticket. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block "></div>

//         <section className="bg-white rounded-[10px] p-5 shadow-lg mt-2 w-[780px] h-[1000px] opacity-100 gap-[5px]">
//           <h2 className="mb-1 text-2xl font-bold sm:text-3xl">
//             Create Quick Ticket
//           </h2>
//           <p className="mb-4 text-sm text-gray-500 sm:text-base">
//             Write and address new queries and issues
//           </p>
//           <form
//             className="flex flex-col gap-[5px] flex-1"
//             onSubmit={handleSubmit}
//           >
//             <Input
//               label="Customer Email"
//               value={userEmail}
//               disabled
//               className="text-gray-500"
//             />
//             <Input
//               label="Issue Title"
//               placeholder="Enter a brief title for your issue"
//               value={issue_title}
//               onChange={(e) => setIssueTitle(e.target.value)}
//               required
//             />
//             <div className="flex flex-col gap-[15px]">
//               <RadioGroup
//                 label="Ticket Priority"
//                 name="priority"
//                 value={priority}
//                 onChange={(e) => setPriority(e.target.value)}
//                 options={PRIORITY_OPTIONS}
//               />
//               <Textarea
//                 label="Ticket Body"
//                 placeholder="Type issue here"
//                 value={body}
//                 onChange={(e) => setBody(e.target.value)}
//                 rows={3}
//               />
//             </div>
//             {(localError || apiError) && (
//               <div className="text-sm text-red-500">
//                 {localError || apiError}
//               </div>
//             )}
//             {isSuccess && (
//               <div className="text-sm text-green-600">
//                 Ticket submitted successfully!
//               </div>
//             )}
//             <Button
//               type="submit"
//               className="w-full mt-[5px] text-base sm:text-lg py-2 sm:py-3 rounded-xl b"
//               loading={isLoading}
//             >
//               Submit
//             </Button>
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

// export default FeedTicket;



















// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { Input, RadioGroup, Textarea, Button } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { ticketApi } from "../../../api/ticketApi";

// const PRIORITY_OPTIONS = [
//   { label: "High", value: "high" },
//   { label: "Medium", value: "medium" },
//   { label: "Low", value: "low" },
// ];

// const FeedTicket = () => {
//   const { user } = useSelector((state) => state.auth);
//   const userEmail = user?.email || "";

//   const [priority, setPriority] = useState("medium");
//   const [issue_title, setIssueTitle] = useState("");
//   const [body, setBody] = useState("");
//   const [localError, setLocalError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [apiError, setApiError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLocalError("");
//     setApiError("");

//     if (!issue_title.trim()) {
//       setLocalError("Please enter the issue title.");
//       return;
//     }

//     if (!body.trim()) {
//       setLocalError("Please enter the issue details.");
//       return;
//     }

//     const ticketData = {
//       issue_title: issue_title.trim(),
//       issue_detail: body.trim(),
//       role: user.user_role,
//       email: userEmail, 
//       priority,
//     };

//     try {
//       setIsLoading(true);
//       await ticketApi.raiseTicket(ticketData);
      
//       // Reset form on success
//       setIssueTitle("");
//       setBody("");
//       setPriority("medium");
//       setIsSuccess(true);
      
//       // Reset success message after 3 seconds
//       setTimeout(() => {
//         setIsSuccess(false);
//       }, 3000);
//     } catch (error) {
//       console.error("Failed to raise ticket:", error);
//       setApiError(error.message || "Failed to submit ticket. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-4 bg-gray-50 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block "></div>

//         <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mt-6 w-full max-w-[780px] h-fit mb-10">
//           <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl text-[#1e1e2d]">
//             Create Quick Ticket
//           </h2>
//           <p className="mb-6 text-sm font-medium text-gray-500 sm:text-base">
//             Write and address new queries and issues
//           </p>
          
//           <form
//             className="flex flex-col gap-5 flex-1"
//             onSubmit={handleSubmit}
//           >
//             <Input
//               label="Customer Email"
//               value={userEmail}
//               disabled
//               className="text-gray-500 bg-gray-50 font-medium"
//             />
//             <Input
//               label="Issue Title"
//               placeholder="Enter a brief title for your issue"
//               value={issue_title}
//               onChange={(e) => setIssueTitle(e.target.value)}
//               required
//               className="focus:ring-[#9bc87c] focus:border-[#9bc87c]"
//             />
//             <div className="flex flex-col gap-5">
//               <RadioGroup
//                 label="Ticket Priority"
//                 name="priority"
//                 value={priority}
//                 onChange={(e) => setPriority(e.target.value)}
//                 options={PRIORITY_OPTIONS}
//                 className="accent-[#9bc87c]"
//               />
//               <Textarea
//                 label="Ticket Body"
//                 placeholder="Type issue here"
//                 value={body}
//                 onChange={(e) => setBody(e.target.value)}
//                 rows={5}
//                 className="focus:ring-[#9bc87c] focus:border-[#9bc87c]"
//               />
//             </div>
            
//             {(localError || apiError) && (
//               <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
//                 {localError || apiError}
//               </div>
//             )}
            
//             {isSuccess && (
//               <div className="p-3 text-sm font-medium text-[#1DB32F] bg-[#1DB32F]/10 border border-[#1DB32F]/20 rounded-lg">
//                 Ticket submitted successfully!
//               </div>
//             )}
            
//             <Button
//               type="submit"
//               className="w-full mt-2 text-base sm:text-lg font-bold py-2.5 sm:py-3 rounded-xl bg-[#9bc87c] hover:bg-[#8ab76b] text-white transition-colors shadow-sm"
//               loading={isLoading}
//             >
//               Submit
//             </Button>
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

// export default FeedTicket;













import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Input, RadioGroup, Textarea, Button } from "../../../components/ui";
import MainLayout from "../../../components/layout/MainLayout";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import { ticketApi } from "../../../api/ticketApi";

const PRIORITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const FeedTicket = () => {
  const { user } = useSelector((state) => state.auth);
  const userEmail = user?.email || "";

  const [priority, setPriority] = useState("medium");
  const [issue_title, setIssueTitle] = useState("");
  const [body, setBody] = useState("");
  const [localError, setLocalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setApiError("");

    if (!issue_title.trim()) {
      setLocalError("Please enter the issue title.");
      return;
    }

    if (!body.trim()) {
      setLocalError("Please enter the issue details.");
      return;
    }

    const ticketData = {
      issue_title: issue_title.trim(),
      issue_detail: body.trim(),
      role: user.user_role,
      email: userEmail, 
      priority,
    };

    try {
      setIsLoading(true);
      await ticketApi.raiseTicket(ticketData);
      
      // Reset form on success
      setIssueTitle("");
      setBody("");
      setPriority("medium");
      setIsSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to raise ticket:", error);
      setApiError(error.message || "Failed to submit ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-4 bg-gray-50 lg:px-8 ticket-page-wrapper">
        {/* Left Spacer */}
        <div className="flex-grow hidden lg:block "></div>

        <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mt-6 w-full max-w-[780px] h-fit mb-10">
          <h2 className="mb-2 text-2xl font-extrabold sm:text-3xl text-[#1e1e2d]">
            Create Quick Ticket
          </h2>
          <p className="mb-6 text-sm font-medium text-gray-500 sm:text-base">
            Write and address new queries and issues
          </p>
          
          <form
            className="flex flex-col gap-5 flex-1 ticket-form"
            onSubmit={handleSubmit}
          >
            <Input
              label="Customer Email"
              value={userEmail}
              disabled
              className="text-gray-500 bg-gray-50 font-medium"
            />
            <Input
              label="Issue Title"
              placeholder="Enter a brief title for your issue"
              value={issue_title}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
            <div className="flex flex-col gap-5">
              <RadioGroup
                label="Ticket Priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={PRIORITY_OPTIONS}
              />
              <Textarea
                label="Ticket Body"
                placeholder="Type issue here"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
            </div>
            
            {(localError || apiError) && (
              <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {localError || apiError}
              </div>
            )}
            
            {isSuccess && (
              <div className="p-3 text-sm font-medium text-[#1DB32F] bg-[#1DB32F]/10 border border-[#1DB32F]/20 rounded-lg">
                Ticket submitted successfully!
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full mt-2 text-base sm:text-lg font-bold py-2.5 sm:py-3 rounded-xl transition-colors shadow-sm submit-btn-override"
              loading={isLoading}
            >
              Submit
            </Button>
          </form>
        </section>

        {/* Right Spacer */}
        <div className="flex-grow hidden lg:block"></div>
      </div>

      {/* Force-Override CSS for Custom UI Components */}
      <style>{`
        /* Force Input and Textarea Hover/Focus states to Scilienttech Green */
        .ticket-form input:not(:disabled):hover,
        .ticket-form textarea:not(:disabled):hover {
          border-color: #9bc87c !important;
        }

        .ticket-form input:focus,
        .ticket-form input:focus-visible,
        .ticket-form textarea:focus,
        .ticket-form textarea:focus-visible {
          outline: none !important;
          border-color: #9bc87c !important;
          box-shadow: 0 0 0 2px rgba(155, 200, 124, 0.3) !important;
        }

        /* Force Radio Group to be green */
        .ticket-form input[type="radio"] {
          accent-color: #9bc87c !important;
        }
        
        .ticket-form input[type="radio"]:focus {
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

export default FeedTicket;