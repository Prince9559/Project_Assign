// // ChatHome.jsx
// import ConversationSidebar from "../../components/chat/ConversationSidebar";
// import ChatInterface from "../../components/chat/ChatInterface";
// import { useState, useEffect } from "react";
// import MainLayout from "../../components/layout/MainLayout";
// import socketService from '../../services/socketService';

// const ChatHome = () => {
//   const [selectedConv, setSelectedConv] = useState(null);

//   // const handleSelect = (conv) => {
//   //   setSelectedConv(conv);
//   // };


//   const handleSelect = (conv) => {
//     setSelectedConv(conv);
//     if (conv?.id) {
//       socketService.markAsRead(conv.id); // tells server "I've read up to now"
//     }
//   };
 


  
//   // useEffect(() => {
//   //   if (selectedConv?.id) {
//   //     // 1. Optimistically clear unread in sidebar
//   //     window.dispatchEvent(new CustomEvent('conversation:read', {
//   //       detail: { conversationId: selectedConv.id }
//   //     }));

//   //     // 2. Tell server
//   //     socketService.markAsRead(selectedConv.id);
//   //   }
//   // }, [selectedConv?.id]);

//   return (
//     <MainLayout scrollable={false}>
//       <div className="flex h-full overflow-hidden">
//         {/* Sidebar */}
//         <div className="flex-shrink-0 border-r border-gray-200 w-80">
//           <ConversationSidebar
//             onConversationSelect={handleSelect}
//             selectedConversationId={selectedConv?.id}
//           />
//         </div>

//         {/* Chat Area */}
//         <div className="flex flex-col flex-1">
//           {selectedConv ? (
//             <ChatInterface jobApplicationId={selectedConv.job_application_id} />
//           ) : (
//             <div className="flex items-center justify-center flex-1 text-gray-500 bg-gray-50">
//               Select a conversation to start chatting
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default ChatHome;



























// // ChatHome.jsx
// import ConversationSidebar from "../../components/chat/ConversationSidebar";
// import ChatInterface from "../../components/chat/ChatInterface";
// import { useState } from "react";
// import MainLayout from "../../components/layout/MainLayout";
// import socketService from '../../services/socketService';

// const ChatHome = () => {
//   const [selectedConv, setSelectedConv] = useState(null);

//   const handleSelect = (conv) => {
//     setSelectedConv(conv);
//     if (conv?.id) {
//       socketService.markAsRead(conv.id);
//     }
//   };

//   return (
//     <MainLayout scrollable={false}>
//       <div className="flex h-full overflow-hidden overflow-x-auto">
//         <div className="flex-shrink-0 border-r border-gray-200 w-80">
//           <ConversationSidebar
//             onConversationSelect={handleSelect}
//             selectedConversationId={selectedConv?.id}
//           />
//         </div>
//         <div className="flex flex-col flex-1">
//           {selectedConv ? (
//             <ChatInterface jobApplicationId={selectedConv.job_application_id} />
//           ) : (
//             <div className="flex items-center justify-center flex-1 text-gray-500 bg-gray-50">
//               Select a conversation to start chatting
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default ChatHome;








import ConversationSidebar from "../../components/chat/ConversationSidebar";
import ChatInterface from "../../components/chat/ChatInterface";
import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import socketService from '../../services/socketService';

const ChatHome = () => {
  const [selectedConv, setSelectedConv] = useState(null);

  const handleSelect = (conv) => {
    setSelectedConv(conv);
    if (conv?.id) {
      socketService.markAsRead(conv.id);
    }
  };

  return (
    <MainLayout scrollable={false}>
      <div className="flex h-full overflow-hidden overflow-x-auto bg-white">
        {/* Left Sidebar Container */}
        <div className="flex-shrink-0 border-r border-gray-100 w-80 bg-gray-50">
          <ConversationSidebar
            onConversationSelect={handleSelect}
            selectedConversationId={selectedConv?.id}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 bg-white">
          {selectedConv ? (
            <ChatInterface jobApplicationId={selectedConv.job_application_id} />
          ) : (
            /* Empty State */
            <div className="flex items-center justify-center flex-1 bg-white">
              <div className="flex flex-col items-center gap-3 p-8 border border-gray-100 rounded-2xl bg-gray-50 shadow-sm text-center">
                <span className="text-3xl">💬</span>
                <div>
                  <h3 className="text-base font-bold text-[#1e1e2d]">Your Messages</h3>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Select a conversation from the sidebar to start chatting
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatHome;