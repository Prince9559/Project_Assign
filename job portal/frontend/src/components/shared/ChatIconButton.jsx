// import React from "react";
// import { FiMessageCircle } from "react-icons/fi";

// export default function ChatIconButton({
//   onClick,
//   unreadCount = 0,
//   className = "",
//   title = "Chat",
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       title={title}
//       className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full
//       border-2 border-[#00C950] bg-white text-[#1e1e2d]
//       hover:bg-[#9BC87C]/10 active:bg-[#9BC87C]/20 transition
//       focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2 ${className}`}
//       aria-label="Open chat"
//     >
//       <FiMessageCircle
//         className="text-[18px] text-[#1e1e2d] group-hover:text-[#1DB32F]"
//         style={{ strokeWidth: 2.4 }}
//       />

//       {unreadCount > 0 && (
//         <span
//           className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
//           rounded-full bg-[#1DB32F] text-white text-[10px] font-bold
//           flex items-center justify-center border border-white"
//         >
//           {unreadCount > 99 ? "99+" : unreadCount}
//         </span>
//       )}
//     </button>
//   );
// }



import React from "react";
import { FiMessageCircle } from "react-icons/fi";

export default function ChatIconButton({
  onClick,
  unreadCount = 0,
  className = "",
  title = "Chat",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label="Open chat"
      className={`group relative inline-flex items-center justify-center w-10 h-10 rounded-full
      border-2 border-[#9BC87C] bg-white
      hover:bg-[#9BC87C]/10 active:bg-[#9BC87C]/20 transition
      focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2 ${className}`}
    >
      <FiMessageCircle
        size={20}
        color="#9BC87C"
        style={{ stroke: "#9BC87C", strokeWidth: 2.2, fill: "none" }}
      />

      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
          rounded-full bg-[#9BC87C] text-white text-[10px] font-bold
          flex items-center justify-center border-2 border-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}