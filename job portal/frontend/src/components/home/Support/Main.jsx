import React from "react";
import supportImg from "../../../assets/support.png";
export default function Main() {
  return (
    <div className="w-full bg-white py-12 px-4 md:px-10">
      <h2 className="text-3xl font-bold text-center text-[#032466] mb-2">Support</h2>
      <p className="text-center text-[#03246673] text-xl mb-10">
        We're here to help you succeed. Get in touch with our support team
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Contact Us */}
        <div className="border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:scale-105 bg-white">
          <img src={supportImg} className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-[#032466]">Contact Us</h3>
          <p className="text-gray-600 mb-4">
            Get in touch with our support team for any questions or assistance
          </p>
          <ul className="text-[#032466] space-y-2 mb-6">
            <li>• Headquarters Address</li>
            <li>• Phone: +91-XXXXXX</li>
            <li>• Email: contact@yourportal.com</li>
            <li>• Hours: Mon-Fri 9AM-6PM IST</li>
          </ul>
          <button className="px-4 py-2 bg-[#032466] text-white rounded-lg hover:bg-blue-700 transition">
            Contact Form
          </button>
        </div>

        {/* Help Center */}
        <div className="border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:scale-105 bg-white">
            <img src={supportImg} className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-[#032466]">Help Center</h3>
          <p className="text-[#032466] mb-4">Find answers to common questions and step-by-step guides</p>
          <ul className="text-[#032466] space-y-2 mb-6">
            <li>• Getting Started Guide</li>
            <li>• Profile Setup Help</li>
            <li>• Job Application Process</li>
            <li>• Recruiter Guidelines</li>
            <li>• Technical Support</li>
          </ul>
          <button className="px-4 py-2 bg-[#032466] text-white rounded-lg hover:bg-blue-700 transition">
            View Help Center
          </button>
        </div>

        {/* Policies */}
        <div className="border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:scale-105 bg-white">
        <img src={supportImg} className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-[#032466]">Policies</h3>
          <p className="text-[#032466] mb-4">Review our terms of service, privacy policy, and community guidelines</p>
          <ul className="text-[#032466] space-y-2 mb-6">
            <li>• Privacy Policy</li>
            <li>• Terms of Service</li>
            <li>• Community Guidelines</li>
            <li>• Refund Policy</li>
          </ul>
          <button className="px-4 py-2 bg-[#032466] text-white rounded-lg hover:bg-blue-700 transition">
            View All Policies
          </button>
        </div>
      </div>
    </div>
  );
}
