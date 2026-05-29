
import React, { useState } from 'react';
import {useSelector} from "react-redux";

const BASE_URL=import.meta.env.VITE_BASE_URL;

const PaymentTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'init', 'paid', 'active', 'error'

  const {token } = useSelector((state) => state.auth);

  const handlePay = async () => {
    setLoading(true);
    setStatus('init');

    try {
      // 1. Create payment order
      const orderRes = await fetch(`${BASE_URL}/payments/one-time/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed:
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: 63,
          post_type: 'active',
          college_ids: []
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Order failed');
      }

      const { razorpay_order_id, amount } = await orderRes.json();

      // 2. Load Razorpay (if not already)
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = () => resolve();
        });
      }

      // 3. Open checkout
      const options = {
        key: 'rzp_test_Rc1UhhiaCJWNPs', //  REPLACE with your test key
        amount: amount * 100,
        currency: 'INR',
        order_id: razorpay_order_id,
        name: 'Job Portal',
        description: 'Post Job #63',
        handler: () => {
          //  Payment captured → webhook will activate job
          setStatus('paid');
          setLoading(false);

          // Optional: Poll job status every 2s for 10s
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            try {
              const jobRes = await fetch(`${BASE_URL}/jobs/63`);
              if (jobRes.ok) {
                const job = await jobRes.json();
                if (job.payment_type === 'one_time') {
                  setStatus('active');
                  clearInterval(poll);
                }
              }
            } catch (e) {
              console.warn('Polling error:', e);
            }
            if (attempts >= 5) clearInterval(poll);
          }, 2000);
        },
        prefill: { email: 'test@example.com', contact: '9876543210' },
        theme: { color: '#3399cc' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Payment error:', err);
      setStatus('error');
      setLoading(false);
      alert('Payment setup failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>🧪 Webhook Payment Test (Job #63)</h2>
      <p>Uses Razorpay webhook for job activation.</p>

      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Creating Order...' : 'Pay ₹499 to Post Job'}
      </button>

      {status === 'paid' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
           Payment successful! Activating job via webhook...
        </div>
      )}

      {status === 'active' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
           Job is now LIVE! Check your dashboard.
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
           Payment setup failed. Check console.
        </div>
      )}
    </div>
  );
};

export default PaymentTestPage;
