// import React, { useEffect , useState} from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { FcGoogle } from "react-icons/fc";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import AuthLayout from "../../components/layout/AuthLayout";
// import { Input, Button, Link } from "../../components/ui";
// import { login, loginWithGoogle } from "../../redux/feature/authSlice";
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// //  Validation schema
// const schema = z.object({
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters" }),
//   remember: z.coerce.boolean().optional(),
// });

// export default function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { loading, error, isAuthenticated, user } = useSelector(
//     (state) => state.auth
//   );

//   // React Hook Form setup
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch
//   } = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: { email: "", password: "", remember: false },
//   });

//   const [noAccountEmail, setNoAccountEmail] = useState(null);

//   // Prefill email (from localStorage OR state passed via navigation)
//   useEffect(() => {
//     const rememberedEmail = localStorage.getItem("userEmail");
//     const stateEmail = location.state?.email;
//     if (stateEmail) {
//       setValue("email", stateEmail);
//     } else if (rememberedEmail) {
//       setValue("email", rememberedEmail);
//     }
//   }, [setValue, location.state]);

//   useEffect(() => {
//     if (user?.profile_status === 0) {
//       // Send OTP and redirect to verify page
//       axios
//         .post(`${BASE_URL}/otp/send-otp`, { email: user.email })
//         .then(() => {
//           navigate("/login-verify-otp-email", {
//             state: { email: user.email, user_role: user.user_role },
//             replace: true,
//           });
//         })
//         .catch(() => alert("Failed to send OTP"));
//     }
//   }, [isAuthenticated, user, navigate]);

//   //  Handle submit
//   const onSubmit = (data) => {
//     if (data.remember) {
//       localStorage.setItem("userEmail", data.email);
//     } else {
//       localStorage.removeItem("userEmail");
//     }
//     dispatch(login({ email: data.email, password: data.password }));
//   };

// useEffect(() => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const googleToken = urlParams.get('google_token');
//   const googleUser = urlParams.get('google_user');
//    const error = urlParams.get('error');
//   const email = urlParams.get('email');

//    // Clear params from URL after processing (optional but cleaner)
//   if (error || email) {
//     navigate("/login", { replace: true });
//   }

//   if (error === "no_account") {
//     setNoAccountEmail(email ? decodeURIComponent(email) : null);

//   }

//   if (googleToken && googleUser) {
//     try {
//       const user = JSON.parse(decodeURIComponent(googleUser));

//       // Save to localStorage — same keys as your login thunk
//       localStorage.setItem("authToken", googleToken);
//       localStorage.setItem("user", JSON.stringify(user));

//       dispatch(loginWithGoogle({ token: googleToken, user }));

//       // PublicRoute handle redirect
//       navigate("/", { replace: true });

//     } catch (err) {
//       console.error("Google login parse error:", err);
//       navigate('/login', { replace: true });
//     }
//   }
// }, [navigate,dispatch]);
//   const showSignUpLink = !isAuthenticated || user?.profile_status === 0;

//   return (
//     <AuthLayout
//       title="Sign in to your account"
//       subtitle={
//         showSignUpLink ? (
//           <>
//             Don&apos;t have an account?{" "}
//             <Link to="/signup-choose-role" variant="primary">
//               Sign Up
//             </Link>
//           </>
//         ) : null
//       }
//     >
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="w-full max-w-full p-0 bg-white rounded-none shadow-none md:p-4 md:rounded-lg md:shadow-md md:max-w-md md:mx-auto"
//       >
//         {/* Email */}
//         <Input
//           label="Email"
//           type="email"
//           placeholder="Enter your email"
//           error={errors.email?.message}
//           variant={errors.email ? "error" : "default"}
//           // {...register("email")}
//           value={watch("email")}
//           onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
//         />

//         {/* Password */}
//         <Input
//           label="Password"
//           type="password"
//           placeholder="Enter your password"
//           autoComplete="current-password"
//           error={errors.password?.message}
//           variant={errors.password ? "error" : "default"}
//           // {...register("password")}
//           value={watch("password")}
//           onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
//         />

//         {/* Remember + Forgot Password */}
//         <div className="flex flex-row items-center justify-between gap-1 mb-2 sm:mb-3 sm:gap-0">
//           <label className="flex items-center text-[10px] cursor-pointer space-x-1">
//             <input
//               type="checkbox"
//               // {...register("remember")}
//               value={watch("remember")}
//               onChange={(e) => setValue("remember", e.target.value)}
//               className="w-3 h-3 text-red-500 border-gray-300 rounded focus:ring-red-400 focus:ring-1"
//             />
//             <span className="text-gray-700">Remember me</span>
//           </label>
//           <Link to="/forgot-password" variant="primary" className="text-xs">
//             Forgot Password?
//           </Link>
//         </div>

//         {/* Submit */}
//         <Button
//           type="submit"
//           loading={loading}
//           disabled={loading}
//           className="w-full mb-2 sm:mb-3"
//         >
//           {loading ? "Logging in..." : "Log In"}
//         </Button>

//         {/* Error */}
//         {error && (
//           <div className="p-2 mb-2 text-xs text-center text-red-500 rounded-md sm:mb-3 bg-red-50 sm:p-3">
//             {error}
//           </div>
//         )}

//         {/* Divider */}
//         <div className="flex items-center my-2 sm:my-3">
//           <div className="flex-grow h-px bg-gray-300"></div>
//           <span className="mx-1.5 sm:mx-2 text-gray-400 text-xs font-medium">
//             Or
//           </span>
//           <div className="flex-grow h-px bg-gray-300"></div>
//         </div>

//         {/* Google Button */}
//         <Button
//           type="button"
//           variant="outline"
//           disabled={loading}
//           onClick={() => {
//             window.location.href = `${BASE_URL}/users/google`;
//           }}
//           className="flex items-center justify-center w-full shadow-none hover:shadow-none"
//         >
//           <FcGoogle size={14} className="mr-1.5" />
//           <span className="text-xs">Continue with Google</span>
//         </Button>

//         {/* OTP Button */}
//         <Button
//           type="button"
//           variant="outline"
//           disabled={loading}
//           as={Link}
//           to="/login-send-otp-email"
//           className="flex items-center justify-center w-full mt-2 shadow-none hover:shadow-none"
//         >
//           <span className="text-xs">Login with OTP</span>
//         </Button>
//       </form>

//       {noAccountEmail && (
//   <div className="w-full max-w-md p-3 mb-4 text-sm text-blue-700 bg-blue-100 border border-blue-300 rounded-md md:mx-auto">
//     <p>
//       No account found for <strong>{noAccountEmail}</strong>.{" "}
//       <Link
//         to="/signup-choose-role"
//         state={{ email: noAccountEmail }}
//         className="font-medium underline hover:text-blue-900"
//       >
//         Sign up now
//       </Link>
//       ?
//     </p>
//   </div>
// )}
//     </AuthLayout>
//   );
// }

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AuthLayout from "../../components/layout/AuthLayout";
import { Input, Button, Link } from "../../components/ui";
import { LoginButton } from "../../components/loginComponents/LoginButton";
import { GoogleLoginButton } from "../../components/loginComponents/GoogleLoginButton";
import { OtpLoginButton } from "../../components/loginComponents/OtpLoginButton";

import { login, loginWithGoogle } from "../../redux/feature/authSlice";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const BASE_URL = API_BASE_URL;

function routeAfterAuth(user) {
  switch (user?.user_role) {
    case "STUDENT":
      return user?.profile_status === 2 ? "/all-jobs" : "/student-fill-account-details";
    case "COMPANY":
      return user?.profile_status === 2
        ? "/recruiter-dashboard"
        : "/recruiter-fill-account-details";
    case "UNIVERSITY":
      return user?.profile_status === 2 ? "/dashboard" : "/university-fill-account-details";
    default:
      return "/dashboard";
  }
}

// Validation schema
const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  remember: z.coerce.boolean().optional(),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth,
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const [noAccountEmail, setNoAccountEmail] = useState(null);

  // Prefill email (from localStorage OR state passed via navigation)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("userEmail");
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setValue("email", stateEmail);
    } else if (rememberedEmail) {
      setValue("email", rememberedEmail);
    }
  }, [setValue, location.state]);

  useEffect(() => {
    if (user?.profile_status === 0) {
      // Send OTP and redirect to verify page
      axios
        .post(`${BASE_URL}/otp/send-otp`, { email: user.email })
        .then(() => {
          navigate("/login-verify-otp-email", {
            state: { email: user.email, user_role: user.user_role },
            replace: true,
          });
        })
        .catch(() => alert("Failed to send OTP"));
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    if (data.remember) {
      localStorage.setItem("userEmail", data.email);
    } else {
      localStorage.removeItem("userEmail");
    }

    try {
      const result = await dispatch(
        login({ email: data.email, password: data.password })
      ).unwrap();

      if (result.user?.profile_status === 0) {
        try {
          await axios.post(`${BASE_URL}/otp/send-otp`, { email: result.user.email });
        } catch {
          /* OTP may still be in backend logs */
        }
        navigate("/login-verify-otp-email", {
          state: { email: result.user.email, user_role: result.user.user_role },
          replace: true,
        });
        return;
      }

      navigate(routeAfterAuth(result.user), { replace: true });
    } catch {
      /* error shown via redux state.error */
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get("google_token");
    const googleUser = urlParams.get("google_user");
    const error = urlParams.get("error");
    const email = urlParams.get("email");

    // Clear params from URL after processing (optional but cleaner)
    if (error || email) {
      navigate("/login", { replace: true });
    }

    if (error === "no_account") {
      setNoAccountEmail(email ? decodeURIComponent(email) : null);
    }

    if (googleToken && googleUser) {
      try {
        const user = JSON.parse(decodeURIComponent(googleUser));

        // Save to localStorage — same keys as your login thunk
        localStorage.setItem("authToken", googleToken);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch(loginWithGoogle({ token: googleToken, user }));

        // PublicRoute handle redirect
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Google login parse error:", err);
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, dispatch]);

  const showSignUpLink = !isAuthenticated || user?.profile_status === 0;

  return (
    //     <AuthLayout
    // title="Sign in to your account"
    // subtitle={
    // showSignUpLink ? (
    // <span className="text-[#1e1e2d]">
    // Don't have an account?{" "}
    // <Link to="/signup-choose-role" className="text-[#9bc87c] hover:text-[#8ab76b] font-semibold transition-colors" >
    // Sign Up
    // </Link>
    // </span>
    // ) : null
    // }
    // >
    <AuthLayout
      title={
        <>
          <span className="block text-[22px] sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Sign in to your account
          </span>
          {/* <span className="block mt-2 text-sm sm:text-base md:text-lg font-medium text-white/90">
            Welcome back — access your dashboard and opportunities
          </span> */}
        </>
      }
      subtitle={
        showSignUpLink ? (
          <span className="text-white/95">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup-choose-role"
              className="inline-block ml-1 px-3 py-1 text-sm font-semibold text-[#072366] bg-white rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Sign Up
            </Link>
          </span>
        ) : null
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-full p-6 bg-white border border-gray-100 rounded-xl shadow-sm md:max-w-md md:mx-auto"
      >
        {/* Email */}
        <div className="mb-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            variant={errors.email ? "error" : "default"}
            value={watch("email")}
            onChange={(e) =>
              setValue("email", e.target.value, { shouldValidate: true })
            }
            className="focus:border-[#9bc87c] focus:ring-[#9bc87c]"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            variant={errors.password ? "error" : "default"}
            value={watch("password")}
            onChange={(e) =>
              setValue("password", e.target.value, { shouldValidate: true })
            }
            className="focus:border-[#9bc87c] focus:ring-[#9bc87c]"
          />
        </div>

        {/* Remember + Forgot Password */}
        <div className="flex flex-row items-center justify-between gap-1 mb-5 sm:gap-0">
          <label className="flex items-center text-xs cursor-pointer space-x-1.5">
            <input
              type="checkbox"
              value={watch("remember")}
              onChange={(e) => setValue("remember", e.target.checked)}
              className="w-3.5 h-3.5 text-[#9bc87c] border-gray-300 rounded focus:ring-[#9bc87c] focus:ring-1"
            />
            <span className="text-[#1e1e2d]">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#9bc87c] hover:text-[#8ab76b] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        {/* <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full mb-4 bg-[#9bc87c] hover:bg-[#8ab76b] text-white font-semibold rounded-lg transition-colors duration-200 py-2.5 px-4"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button> */}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full mb-4 bg-[#9bc87c] hover:bg-[#8ab76b] text-white font-semibold rounded-lg transition-colors duration-200 py-2.5 px-4"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>

        {/* Error */}
        {error && (
          <div className="p-3 mb-4 text-xs text-center text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="mx-3 text-gray-400 text-xs font-medium">Or</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* Google Button */}
        {/* <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => {
            window.location.href = `${BASE_URL}/users/google`;
          }}
          className="flex items-center justify-center w-full mb-3 text-[#1e1e2d] border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors duration-200 py-2.5"
        >
          <FcGoogle size={18} className="mr-2" />
          <span className="text-sm font-medium">Continue with Google</span>
        </Button> */}

        <GoogleLoginButton loading={loading}>
          Sign in with Google
        </GoogleLoginButton>

        {/* OTP Button */}
        {/* <Button
          type="button"
          variant="outline"
          disabled={loading}
          as={Link}
          to="/login-send-otp-email"
          className="flex items-center justify-center w-full text-[#1e1e2d] border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors duration-200 py-2.5"
        >
          <span className="text-sm font-medium">Login with OTP</span>
        </Button> */}
        <OtpLoginButton loading={loading} to="/login-send-otp-email">
          Sign in with OTP
        </OtpLoginButton>
      </form>

      {/* No Account Found Banner */}
      {noAccountEmail && (
        <div className="w-full max-w-md mt-6 p-4 text-sm text-[#1e1e2d] bg-white border-2 border-[#9bc87c] rounded-xl shadow-sm md:mx-auto">
          <p className="text-center">
            No account found for{" "}
            <strong className="font-semibold">{noAccountEmail}</strong>.{" "}
            <br className="sm:hidden" />
            <Link
              to="/signup-choose-role"
              state={{ email: noAccountEmail }}
              className="font-semibold text-[#9bc87c] hover:text-[#8ab76b] underline transition-colors inline-block mt-1 sm:mt-0"
            >
              Sign up now
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
