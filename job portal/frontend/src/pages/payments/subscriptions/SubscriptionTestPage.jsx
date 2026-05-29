// src/pages/SubscriptionTestPage.jsx
import React, { useState, useEffect } from 'react';
import {useSelector} from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SubscriptionTestPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');

  const {token } = useSelector((state) => state.auth);

  // 🔁 Load plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${BASE_URL}/subscriptions/plans`);
        if (!res.ok) throw new Error('Failed to load plans');
        const data = await res.json();
        setPlans(data.plans);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // 💳 Handle subscription initiation
  const handleSubscribe = async () => {
    if (!selectedPlanId) return alert('Please select a plan');

    try {
      const res = await fetch(`${BASE_URL}/subscriptions/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`
         },
        body: JSON.stringify({
          plan_id: selectedPlanId,
          billing_cycle: selectedCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Subscription failed');
      }

      //  Launch Razorpay checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          // No 'order_id' — it's a subscription
          subscription_id: data.razorpay_subscription_id,
          handler: function (response) {
            alert(`✅ Subscription successful!\nPayment ID: ${response.razorpay_payment_id}`);
            console.log('Razorpay response:', response);
          },
          modal: {
            ondismiss: function () {
              alert('❌ Subscription cancelled');
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      alert('❌ ' + err.message);
      console.error(err);
    }
  };

  if (loading) return <div>Loading plans...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h2>🎯 Subscription Plans (Test Page)</h2>
      <p>Select a plan and click "Subscribe" to test the flow.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            style={{
              border: selectedPlanId === plan.id ? '2px solid #2563eb' : '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: selectedPlanId === plan.id ? '#eff6ff' : '#fff',
            }}
          >
            <h3 style={{ margin: 0, color: plan.is_featured ? '#1e40af' : '#000' }}>
              {plan.name} {plan.is_featured && '⭐'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0' }}>
              {plan.type === 'active' ? 'Active jobs only'
                : plan.type === 'future' ? 'Future jobs only'
                : 'Active + Future'}
            </p>
            {plan.monthly && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>₹{plan.monthly.price}</strong> / month • {plan.monthly.credits} credits
                {plan.monthly.savings && ` (Save ${plan.monthly.savings}%)`}
              </div>
            )}
            {plan.yearly && (
              <div>
                <strong>₹{plan.yearly.price}</strong> / year • {plan.yearly.credits} credits
                {plan.yearly.savings && ` (Save ${plan.yearly.savings}%)`}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPlanId && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
          <h3>🛒 Selected Plan</h3>
          <label>
            Billing Cycle:
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <br />
          <button
            onClick={handleSubscribe}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            💳 Subscribe Now
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>
        <p>ℹ️ This is a test page. After payment, check:</p>
        <ul>
          <li>✅ DB: `company_subscriptions` status → `"active"` after webhook</li>
          <li>✅ Razorpay Dashboard → Subscriptions → should show active</li>
          <li>✅ Webhook logs in your backend console</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionTestPage;