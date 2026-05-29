import React from "react";

const Main = () => {
  return (
    <div className="bg-white w-full px-2 sm:px-4 md:px-6 lg:px-10 py-10">

      {/* Heading */}
      <h2 className="text-center text-3xl md:text-4xl font-bold text-[#032466]">
        Privacy Policy
      </h2>

      <h4 className="text-center text-lg md:text-xl mt-1 mb-10 text-[#03246673]">
        Terms & Conditions
      </h4>

      {/* FULL WIDTH CONTENT */}
      <div className="w-full space-y-10">

        {/* Section 1 */}
        <div className="bg-[#F7F7FA] p-6 md:p-8 rounded-2xl shadow-md w-full">
          <h3 className="text-2xl font-semibold text-[#032466] mb-4">
            Terms Of Use
          </h3>
          <p className="text-[#000000BF] leading-relaxed text-base md:text-lg whitespace-pre-line">
            Your use of Unstop’s products, software, services and websites 
            is subject to a legal agreement between you and Unstop.

            By subscribing or using our services, you agree that you have 
            read, understood and are bound by the Terms.

            If you do not want to be bound by the Terms, do not use our services.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-[#F7F7FA] p-6 md:p-8 rounded-2xl shadow-md w-full">
          <h3 className="text-2xl font-semibold text-[#032466] mb-4">
            User Agreement
          </h3>
          <p className="text-[#000000BF] leading-relaxed text-base md:text-lg whitespace-pre-line">
            These Terms govern your use of services offered through Unstop.com.

            Unstop may update these Terms anytime. You are responsible for 
            reviewing them periodically.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-[#F7F7FA] p-6 md:p-8 rounded-2xl shadow-md w-full">
          <h3 className="text-2xl font-semibold text-[#032466] mb-4">
            Privacy Policy
          </h3>
          <p className="text-[#000000BF] leading-relaxed text-base md:text-lg whitespace-pre-line">
            The user acknowledges and accepts the Privacy Policy of Unstop.com.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-[#F7F7FA] p-6 md:p-8 rounded-2xl shadow-md w-full">
          <h3 className="text-2xl font-semibold text-[#032466] mb-4">
            Accepting The Terms
          </h3>
          <p className="text-[#000000BF] leading-relaxed text-base md:text-lg whitespace-pre-line">
            You can accept the Terms by clicking “Agree” or by simply using the services.

            If you do not accept the Terms, you may not use the services.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Main;
``
