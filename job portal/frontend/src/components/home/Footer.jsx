import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#002060] text-white py-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-14">

        {/* Logo + Description */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="text-yellow-400 text-4xl">⚡</span>Logo
          </h2>

          <p className="text-base leading-relaxed text-gray-300">
            Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-5 text-yellow-400 text-xl">
            <FaFacebookF className="cursor-pointer hover:text-white" />
            <FaTwitter className="cursor-pointer hover:text-white" />
            <FaInstagram className="cursor-pointer hover:text-white" />
            <FaLinkedinIn className="cursor-pointer hover:text-white" />
            <FaYoutube className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Product */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg tracking-wide">Product</h3>
          <ul className="space-y-3 text-gray-300 text-base font-medium">
            <li>Student</li>
            <li>Recruiter</li>
            <li>University</li>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg tracking-wide">Company</h3>
          <ul className="space-y-3 text-gray-300 text-base font-medium">
            <li>About</li>
            <li>Contact us</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg tracking-wide">Support</h3>
          <ul className="space-y-3 text-gray-300 text-base font-medium">
            <li>Getting started</li>
            <li>Help center</li>
            <li>Server status</li>
            <li>Report a bug</li>
            <li>Chat support</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg tracking-wide">Contact us</h3>
          <ul className="space-y-4 text-gray-300 text-base font-medium">
            <li className="flex items-center gap-4">
              <MdEmail className="text-yellow-400 text-2xl" /> contact@company.com
            </li>
            <li className="flex items-center gap-4">
              <FaPhoneAlt className="text-yellow-400 text-2xl" /> (414) 687 - 5892
            </li>
            <li className="flex items-center gap-4">
              <MdLocationOn className="text-yellow-400 text-2xl" /> 794 Mcallister St,<br />
              San Francisco, 94102
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-500 text-base text-gray-300 flex flex-col md:flex-row justify-between font-medium">
        <p>Copyright © 2025 Vrinda</p>
        <p className="flex gap-6">
          <a className="text-yellow-400 hover:text-white font-semibold" href="#">
            Terms & Conditions
          </a>
          <a className="text-yellow-400 hover:text-white font-semibold" href="#">
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
