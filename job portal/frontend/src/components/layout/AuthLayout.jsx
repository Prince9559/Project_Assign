// import React from "react";
// import LoginIllustration from "../../assets/Login_Illustration.png";
// import websiteLogo from "../../assets/WebsiteLogo.svg";
// import { Link } from "react-router-dom";
// export default function AuthLayout({ children, title, subtitle, showIllustration = true }) {
//     return (
//         <div className="relative w-full min-h-screen overflow-y-auto bg-white">

//             {/* Large screen background split: top half blue, bottom half white */}
//             <div className="absolute inset-0 z-0 hidden lg:block">
//                 <div className="w-full h-1/2 bg-[#072366]"></div>
//                 <div className="absolute bottom-0 w-full bg-white h-1/2"></div>
//             </div>


//             {/* Logo */}
//             <div className="absolute z-30 hidden lg:block top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-6 lg:top-8 lg:left-8">
//                 <Link to="/" className="text-xl font-bold tracking-wide text-white transition-opacity sm:text-2xl hover:opacity-80">
//                     <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
//                 </Link>
//             </div>
//             {/* Mobile Header (Blue Top) - Only for small devices */}
//             <div className="block lg:hidden w-full bg-[#072366] h-48 sm:h-56 md:h-64 px-2 sm:px-4 md:px-6 flex flex-col justify-start pt-8">
//                 <div className="flex items-center mb-6">
//                     <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
//                 </div>
//                 <h1 className="mb-1 text-2xl font-bold leading-tight text-left text-white">
//                     {title}
//                 </h1>
//                 {subtitle && (
//                     <p className="text-sm font-medium leading-relaxed text-left text-white">
//                         {subtitle}
//                     </p>
//                 )}
//             </div>

//             {/* Main Content for Mobile: form strictly below blue header, no card, no shadow */}
//             <div className="relative z-10 block w-full px-4 pt-6 pb-8 bg-white lg:hidden">
//                 {children}
//             </div>

//             {/* Desktop/Large Screen Layout (unchanged, but now above split background) */}
//             <div className="relative z-10 flex-col items-center justify-center hidden max-w-5xl min-h-screen px-2 py-8 mx-auto lg:flex lg:flex-row lg:max-w-6xl xl:max-w-7xl sm:px-4 lg:px-6 sm:py-12 md:py-16 gap-y-6 sm:gap-y-8 md:gap-y-10 lg:gap-x-2">
//                 {/* Left Section - Desktop Only */}
//                 <div className="flex-col items-center flex-1 hidden space-y-2 text-center ml-14 lg:flex lg:items-start lg:text-left sm:space-y-3 lg:sticky lg:top-28">
//                     <h1 className="text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
//                         {title}
//                     </h1>
//                     {subtitle && (
//                         <p className="max-w-md text-xs font-medium text-white sm:text-sm md:text-base">
//                             {subtitle}
//                         </p>
//                     )}
//                     {showIllustration && (
//                         <img
//                             src={LoginIllustration}
//                             alt="Login Illustration"
//                             className="w-40 sm:w-48 md:w-56 lg:w-64 mt-1 sm:mt-2 hidden lg:block rotate-[-90deg]"
//                         />
//                     )}
//                 </div>
//                 {/* Right Section */}
//                 <div className="flex justify-center flex-1 w-full">
//                     <div className="w-full ">
//                         {children}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }














// import React from "react";
// import LoginIllustration from "../../assets/Login_Illustration.png";
// import websiteLogo from "../../assets/WebsiteLogo.svg";
// import { Link } from "react-router-dom";

// export default function AuthLayout({ children, title, subtitle, showIllustration = true }) {
//   return (
//     <div className="flex flex-col w-full min-h-screen lg:flex-row">

//       {/* LEFT PANEL - blue, shows as top bar on mobile, left column on desktop */}
//       <div className="
//         w-full lg:w-5/12 xl:w-1/2
//         bg-[#072366]
//         flex flex-col
//         px-6 pt-8 pb-6
//         lg:px-10 lg:py-12
//         lg:min-h-screen lg:sticky lg:top-0 lg:h-screen
//       ">
//         {/* Logo */}
//         <Link to="/" className="inline-block mb-6 lg:mb-10">
//           <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
//         </Link>

//         {/* Title + subtitle */}
//         <h1 className="mb-2 text-2xl font-bold leading-tight text-white lg:text-4xl">
//           {title}
//         </h1>
//         {subtitle && (
//           <p className="text-sm font-medium leading-relaxed lg:text-base text-white/80">
//             {subtitle}
//           </p>
//         )}

//         {/* Illustration - only on desktop */}
//         {showIllustration && (
//           <div className="items-end justify-center flex-1 hidden pb-8 lg:flex">
//             <img
//               src={LoginIllustration}
//               alt="Illustration"
//               className="w-64 rotate-[-90deg]"
//             />
//           </div>
//         )}
//       </div>

//       {/* RIGHT PANEL - white, form lives here, single render */}
//       <div className="flex items-start justify-center flex-1 px-4 py-8 overflow-y-auto bg-white lg:items-center lg:px-10 lg:py-12">
//         {children}
//       </div>

//     </div>
//   );
// }









import React from "react";
import LoginIllustration from "../../assets/Login_Illustration.png";
import websiteLogo from "../../assets/WebsiteLogo.svg";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle, showIllustration = true }) {
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-white">

            {/* --- Background Layers (Desktop Only) --- */}
            {/* This stays absolute and hidden on mobile via 'hidden lg:block' */}
            <div className="absolute inset-0 z-0 hidden pointer-events-none lg:block">
                <div className="w-full h-1/2 bg-[#8ab76b]"></div>
                <div className="absolute bottom-0 w-full bg-white h-1/2"></div>
            </div>

            {/* --- Logo (Desktop Only) --- */}
            <div className="absolute z-30 hidden lg:block top-8 left-8">
                <Link to="/" className="text-xl font-bold tracking-wide text-white transition-opacity sm:text-2xl hover:opacity-80">
                    <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
                </Link>
            </div>

            {/* --- Main Unified Layout Container --- */}
            {/* 
               1. 'flex flex-col': Default to column (Mobile)
               2. 'lg:flex-row': Switch to row (Desktop)
               3. 'min-h-screen': Ensure full height
               4. NO lg:hidden blocks wrapping children. Children exists ONCE here.
            */}
            <div className="relative z-20 flex flex-col items-center justify-start w-full min-h-screen mx-auto lg:flex-row max-w-7xl">

                {/* --- Left Section (Title & Illustration) --- */}
                {/* 
                   Mobile: Hidden completely (since title is in the blue header below) 
                   Desktop: Visible, White Text, Left side 
                */}
                <div className="flex-col items-start justify-center flex-1 hidden w-full px-6 space-y-3 lg:flex lg:sticky lg:top-28">
                    <h1 className="text-3xl font-bold text-white md:text-4xl">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="max-w-md text-sm font-medium text-white md:text-base">
                            {subtitle}
                        </p>
                    )}
                    {showIllustration && (
                        <img
                            src={LoginIllustration}
                            alt="Login Illustration"
                            className="w-56 lg:w-64 mt-4 rotate-[-90deg]"
                        />
                    )}
                </div>

                {/* --- Right Section (The Single Children Instance) --- */}
                {/* 
                   This container holds the form for BOTH Mobile and Desktop.
                   
                   Mobile Behavior:
                   - It sits below the Mobile Header (defined next).
                   - We use 'order-last' or just natural flow if header is outside this flex? 
                   Actually, to keep the Mobile Blue Header separate but the Form unified:
                */}

                {/* We need a wrapper that handles the Mobile Blue Header separately, 
                    but the Form (children) must be the same DOM node. 
                    
                    Strategy: 
                    1. Render Mobile Header (Visible only on mobile).
                    2. Render The Form (Visible on ALL screens).
                    3. Render Desktop Info (Visible only on desktop).
                    
                    To achieve "One Children" without duplication, we place {children} 
                    in a div that is always present, but we adjust the surrounding 
                    layout context.
                */}

                {/* MOBILE HEADER (Only visible on mobile) */}
                <div className="lg:hidden w-full bg-[#8ab76b] h-48 sm:h-56 md:h-64 px-6 flex flex-col justify-center pt-8 shrink-0">
                    <div className="flex items-center mb-4">
                        <img src={websiteLogo} alt="Logo" className="w-10 h-10" />
                    </div>
                    <h1 className="mb-1 text-2xl font-bold leading-tight text-left text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm font-medium leading-relaxed text-left text-white">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* THE SINGLE FORM INSTANCE */}
                {/* 
                   This div is ALWAYS rendered. 
                   - On Mobile: It appears naturally after the Mobile Header above.
                   - On Desktop: It sits in the flex row next to the Left Section.
                */}
                <div className={`
                    flex items-center justify-center 
                    w-full 
                    ${/* Mobile Padding */ "px-4 py-8 lg:py-0"} 
                    ${/* Desktop Layout */ "lg:flex-1 lg:justify-center lg:items-center"}
                `}>
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}