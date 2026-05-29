import { ChevronDown, User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../../assets/logo.png";

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-[#fff8df] via-transparent to-[#FFE29F] py-4 shadow-sm">
      {/* FLEX CONTAINER FULL WIDTH */}
      <div className="w-full px-10 flex items-center justify-between">

        {/* LEFT — LOGO */}
        <Link to="/" className="flex items-center">
          <img src={logo} className="h-10 w-auto cursor-pointer" alt="logo" />
        </Link>

        {/* RIGHT — ALL MENU ITEMS */}
        <div className="flex items-center gap-10 text-[#12306F] font-semibold text-[16px]">

          <Link
            to="/"
            className="bg-[#032B79] text-white px-6 py-2 rounded-full shadow-md"
          >
            Home
          </Link>

          <Link to="/about" className="hover:text-[#032B79] transition">
            About
          </Link>

          <Link
            to="/explore"
            className="flex items-center gap-1 hover:text-[#032B79] transition"
          >
            Explore <ChevronDown size={18} />
          </Link>

          <Link
            to="/resources"
            className="flex items-center gap-1 hover:text-[#032B79] transition"
          >
            Resources <ChevronDown size={18} />
          </Link>

          <Link to="/support" className="hover:text-[#032B79] transition">
            Support
          </Link>

          {/* PROFILE ICON */}
          <Link
            to="/profile"
            className="p-2 rounded-full border border-[#d8c89e] hover:bg-white transition"
          >
            <User size={20} />
          </Link>

        </div>
      </div>
    </nav>
  );
}
