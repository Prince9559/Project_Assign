import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
export default function SSO() {
  const navigate = useNavigate();
 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
 
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
 
    // Set sso_token cookie for entire .scilienttech.com domain
    document.cookie = `sso_token=${token}; domain=.scilienttech.com; path=/; secure; max-age=3600; SameSite=Lax`;
 
    // Also store in localStorage so Redux auth state picks it up
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(payload));
    } catch (e) {
      console.error("Token parse error:", e);
    }
 
    navigate("/all-jobs", { replace: true });
  }, [navigate]);
 
  return (
<div className="flex items-center justify-center min-h-screen">
<p className="text-gray-500 text-sm">Redirecting...</p>
</div>
  );
}