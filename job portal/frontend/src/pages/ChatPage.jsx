
// src/pages/ChatPage.jsx
import React from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import ChatInterface from "../components/chat/ChatInterface";
import MainLayout from "../components/layout/MainLayout";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const jobApplicationId = searchParams.get("jobApplicationId");
  const { participantId, applicantName } = location.state || {}; // student's user ID

  return (
    <MainLayout scrollable={false}>
      <div style={{ height: "80vh", padding: "20px" }}>
        <ChatInterface
          // recipientId={participantId}
          // recipientType="STUDENT"
          jobApplicationId={jobApplicationId}
          // recipientName={applicantName}
        />
      </div>
    </MainLayout>
  );
};

export default ChatPage;






