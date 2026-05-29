import React from "react";
import { useNavigate } from "react-router-dom";
import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";
import Ailayout from "../../components/layout/Ailayout";
import { Button } from "../../components/ui";
import MainLayout from "../../components/layout/MainLayout";

export default function AiGettingStarted() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/ai-learning", {
      state: {
        strategy:"upskilling",
      },
    });
  };

  return (
    <Ailayout
      heading="Ai Prediction"
      subheading="Move one step closure to find your Dream job or Upskilling YourSelf "
      illustration={AiProfileIllustration1}
      centerMobileContent={true}
    >
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full px-0 mx-auto -mt-4 sm:max-w-sm sm:-mt-2">
        <div className="w-full p-6 text-center bg-white rounded-lg shadow-md">
          {/* Card Content */}
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Upskill
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Move one step closer to finding better career opportunities or upskilling yourself.
          </p>
          <Button
            className="w-full py-2 font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
            // onClick={handleContinue}
          >
            Coming Soon !!
          </Button>
        </div>
      </div>
    </Ailayout>
  );
}
