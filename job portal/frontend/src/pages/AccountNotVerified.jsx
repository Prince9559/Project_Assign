import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui";
import { logout } from "../redux/feature/authSlice";

export default function AccountNotVerified() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Account Not Yet Verified
          </h1>
          <p className="mt-3 text-sm text-gray-700">
            Your account is under review due to university change. Please wait for
            admin approval.
          </p>

          <div className="mt-6">
            <Button variant="secondary" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

