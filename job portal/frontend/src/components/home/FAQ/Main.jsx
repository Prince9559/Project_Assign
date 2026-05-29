import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { question: "How do I create a profile on Job portal?", answer: "Creating a profile is simple! Click on the Sign Up button, choose your user type (Student/Recruiter/University), fill in your details, and verify your email.You can then complete your profile with additional information" },
  { question: "Is Job portal free for students?", answer: "We source teas from ABC regions." },
  { question: "How does the job matching algorithm work?", answer: "Yes, we ship worldwide." },
  { question: "What material is tea packet / pouch made of? Is it biodegradable?", answer: "Our pouches are eco-friendly and biodegradable." },
  { question: "How can universities partner with job portal?", answer: "Yes, we rigorously test our teas." },
];

const Main= () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-10 py-10">
      <h2 className="text-center text-2xl md:text-3xl font-bold mb-5 text-[#032466]">
        FAQ's
      </h2>
       <h4 className="text-center text-xl md:text-xl  mb-5 text-[#03246673]">
        Our expert advisors can help you find the right solution for you.
      </h4>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#F7F7FA] rounded-2xl text-[#000000] shadow-md w-full "
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-6 py-5 text-left text-lg md:text-xl font-medium focus:outline-none"
            >
              <span>{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 text-base md:text-lg text-[#000000BF]">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;
