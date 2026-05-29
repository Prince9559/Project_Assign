// src/components/layout/AuthLayoutSimple.jsx
import React from "react";
import websiteLogo from "../../assets/WebsiteLogo.svg";
import { Link } from "react-router-dom";

export default function AuthLayoutSimple({ children, title, subtitle }) {
    return (
        <div className="flex flex-col w-full min-h-screen bg-white">
            {/* Mobile Header */}
            <div className="lg:hidden bg-[#072366] px-4 pt-6 pb-4">
                <div className="flex items-center gap-3">
                    <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
                    <div>
                        <h1 className="text-lg font-bold text-white">{title}</h1>
                        {subtitle && <p className="text-xs text-white/90">{subtitle}</p>}
                    </div>
                </div>
            </div>

            {/* Content - Scrollable on mobile */}
            <div className="flex items-start justify-center flex-1 px-4 py-6 lg:py-12 lg:items-center">
                <div className="w-full max-w-md">
                    {/* Desktop Title (hidden on mobile) */}
                    <div className="hidden mb-6 text-center lg:block">
                        <div className="flex justify-center mb-4">
                            <img src={websiteLogo} alt="Logo" className="w-12 h-12" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}