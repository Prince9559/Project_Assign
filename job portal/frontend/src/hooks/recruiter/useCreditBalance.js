import { useState, useEffect } from "react";
import {useSelector} from "react-redux";

const BASE_URL= import.meta.env.VITE_BASE_URL;
export const useCreditBalance = () => {
  const [balance, setBalance] = useState({ total_credits: 0, loading: true });
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${BASE_URL}/subscriptions/credits/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBalance({ ...data, loading: false });
        }
      } catch (err) {
        console.error("Failed to fetch credits");
        setBalance({ total_credits: 0, loading: false, error: true });
      }
    };

    fetchBalance();
    // Optional: poll every 5 mins
    const interval = setInterval(fetchBalance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return balance;
};
