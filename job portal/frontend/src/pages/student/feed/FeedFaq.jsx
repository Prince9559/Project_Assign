// import React, { useState, useEffect } from "react";
// import { Button, Badge } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { faqApi } from "../../../api/faqApi";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// const FAQSection = () => {
//   const [faqs, setFaqs] = useState([]);
//   const [openIndex, setOpenIndex] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState("");
//   const navigate = useNavigate();

//   const toggleFAQ = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   const handleRaiseTicket = () => {
//     navigate("/feed-ticket");
//   };

//   // Get token from Redux store
//   const { token } = useSelector((state) => state.auth);

//   useEffect(() => {
//     const fetchFaqs = async () => {
//       if (!token) {
//         setErrorMsg("Authentication required");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setErrorMsg("");

//         const response = await faqApi.getStudentFaqs(token);

//         // Handle the response structure: { message: "FAQs fetched successfully", data: [...] }
//         if (response.data && response.data.data) {
//           const formattedFaqs = response.data.data.map((item) => ({
//             id: item.id,
//             question: item.question,
//             answer: item.answer,
//             role: item.role,
//             is_active: item.is_active,
//             created_at: item.created_at,
//             updated_at: item.updated_at,
//           }));
//           setFaqs(formattedFaqs);
//         } else {
//           setFaqs([]);
//           setErrorMsg("No FAQs found");
//         }
//       } catch (error) {
//         console.error("Error fetching FAQs:", error);
//         setErrorMsg(
//           error.response?.data?.message ||
//             "Failed to load FAQs. Please try again."
//         );
//         setFaqs([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFaqs();
//   }, [token]);

//   return (
//     <MainLayout>
//       <div className="flex justify-center bg-gray-100 min-h-screen px-2 lg:px-8 items-start">
//         {/* Left Spacer */}
//         <div className="hidden lg:block flex-grow"></div>

//         <div className="bg-white rounded-[10px] p-5 shadow-lg mt-2 w-[729px] h-[631px] opacity-100 gap-[10px]">
//           <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">
//             FAQs
//           </h2>
//           <p className="text-center text-gray-500 mb-4">
//             Our expert advisors can help you find the right solution for you.
//           </p>

//           <div className="overflow-y-auto h-[500px]">
//             {loading ? (
//               <div className="text-center text-gray-500 mt-[20px]">
//                 Loading FAQs...
//               </div>
//             ) : errorMsg ? (
//               <div className="text-center text-red-500">{errorMsg}</div>
//             ) : faqs.length === 0 ? (
//               <div className="text-center text-gray-500 mt-[20px]">
//                 No FAQs found.
//               </div>
//             ) : (
//               faqs.map((faq, index) => (
//                 <div
//                   key={index}
//                   className={`border rounded-xl mb-4 transition-all duration-300 ${
//                     openIndex === index
//                       ? "border-gray-300 shadow"
//                       : "border-gray-200"
//                   }`}
//                 >
//                   <button
//                     onClick={() => toggleFAQ(index)}
//                     className="w-full text-left px-5 py-4 flex justify-between items-center focus:outline-none"
//                   >
//                     <span className="font-medium text-gray-800">
//                       {faq.question}
//                     </span>
//                     <span className="text-xl text-gray-500">
//                       {openIndex === index ? "▾" : "▸"}
//                     </span>
//                   </button>
//                   {openIndex === index && (
//                     <div className="px-5 pb-4 mt-[10px] text-sm text-gray-700 whitespace-pre-line">
//                       {faq.answer}
//                     </div>
//                   )}
//                 </div>
//               ))
//             )}
//             {/* Badge Button for Raising Ticket */}
//             <div className="text-center mb-6 mt-[20px]">
//               <p
//                 onClick={handleRaiseTicket}
//                 className=" w-[400px]  text-red-400 ml-[150px] cursor-pointer px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200"
//               >
//                 <u>Still not resolved? Raise a ticket</u>
//               </p>
//             </div>
//           </div>
//         </div>
//         {/* Profile Card */}
//         {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside> */}
//         {/* Right Spacer */}
//         <div className="hidden lg:block flex-grow"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default FAQSection;








import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MainLayout from "../../../components/layout/MainLayout";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import { faqApi } from "../../../api/faqApi";
import { useSelector } from "react-redux";

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleRaiseTicket = () => {
    navigate("/feed-ticket");
  };

  // Get token from Redux store
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!token) {
        setErrorMsg("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");

        const response = await faqApi.getStudentFaqs(token);

        // Handle the response structure: { message: "FAQs fetched successfully", data: [...] }
        if (response.data && response.data.data) {
          const formattedFaqs = response.data.data.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            role: item.role,
            is_active: item.is_active,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
          setFaqs(formattedFaqs);
        } else {
          setFaqs([]);
          setErrorMsg("No FAQs found");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setErrorMsg(
          error.response?.data?.message ||
            "Failed to load FAQs. Please try again."
        );
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [token]);

  return (
    <MainLayout>
      <div className="flex justify-center bg-gray-50 min-h-screen px-4 lg:px-8 items-start">
        {/* Left Spacer */}
        <div className="hidden lg:block flex-grow"></div>

        <div className="w-full max-w-[780px] bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mt-6 mb-10 h-fit flex flex-col gap-3">
         
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 leading-tight">
  <span className="text-[#1e1e2d]">Frequently Asked </span>
  <span className="text-[#9BC87C]">Questions</span>
</h2>
          <p className="text-center text-sm font-medium text-gray-500 mb-6 sm:mb-8">
            Our expert advisors can help you find the right solution for you.
          </p>

          <div className="overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar flex-1">
            {loading ? (
              <div className="text-center font-medium text-gray-500 py-10">
                Loading FAQs...
              </div>
            ) : errorMsg ? (
              <div className="text-center font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl p-4">{errorMsg}</div>
            ) : faqs.length === 0 ? (
              <div className="text-center font-medium text-gray-500 py-10">
                No FAQs found.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                      openIndex === index
                        ? "border-[#9bc87c] ring-1 ring-[#9bc87c] bg-[#9bc87c]/5 shadow-sm"
                        : "border-gray-200 hover:border-[#9bc87c]/50 hover:bg-gray-50"
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center focus:outline-none"
                    >
                      <span className="font-bold text-[#1e1e2d] text-sm sm:text-base pr-4">
                        {faq.question}
                      </span>
                      <span className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "text-[#9bc87c]" : "text-gray-400"}`}>
                        {openIndex === index ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm font-medium text-gray-600 whitespace-pre-line leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Badge Button for Raising Ticket */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p
              onClick={handleRaiseTicket}
              className="inline-block cursor-pointer font-bold text-[#9bc87c] hover:text-[#8ab76b] transition-colors duration-200 text-sm sm:text-base"
            >
              <span className="underline underline-offset-4 decoration-2 decoration-[#9bc87c]/30 hover:decoration-[#8ab76b]">
                Still not resolved? Raise a ticket
              </span>
            </p>
          </div>
        </div>
        
        {/* Profile Card */}
        {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}
        {/* Right Spacer */}
        <div className="hidden lg:block flex-grow"></div>
      </div>
    </MainLayout>
  );
};

export default FAQSection;