// src/hooks/useRazorpay.js
import { useEffect, useState } from "react";

const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load Razorpay SDK");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openRazorpay = (options) => {
    if (!isLoaded) throw new Error("Razorpay SDK not loaded yet");
    const rzp = new window.Razorpay(options);
    rzp.open();
    return rzp;
  };

  return { isLoaded, error, openRazorpay };
};

export default useRazorpay;
