// src/components/settings/SettingsLayout.jsx
import React from "react";
import MainLayout from "../layout/MainLayout";
import SettingsSidebar from "./SettingsSidebar";

const SettingsLayout = ({ children }) => {
    return (
        <MainLayout>
            <div className="flex items-start justify-center min-h-screen px-3 bg-gray-100">
                <div className="flex-grow hidden lg:block"></div>

                <div className="flex flex-col w-full max-w-6xl gap-6 mt-6 lg:flex-row">
                    {/* Sidebar */}
                    <SettingsSidebar />

                    {/* Content */}
                    <div className="flex-grow p-6 bg-white rounded-lg shadow-md">
                        {children}
                    </div>
                </div>

                <div className="flex-grow hidden lg:block"></div>
            </div>
        </MainLayout>
    );
};

export default SettingsLayout;