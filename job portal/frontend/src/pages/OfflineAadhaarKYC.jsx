// frontend/src/pages/OfflineAadhaarKYC.jsx
import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function OfflineAadhaarKYC() {
  const [file, setFile] = useState(null);
  const [sharePhrase, setSharePhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !sharePhrase) return setError('Please provide ZIP and share phrase');

    const formData = new FormData();
    formData.append("aadhaarZip", file);
    formData.append("sharePhrase", sharePhrase);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${BASE_URL}/kyc/verify-offline-aadhaar`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Aadhaar Offline e-KYC Verification</h2>

      {!result ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Upload offlineaadhaar.zip:</label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0])}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Share Phrase (4–8 digits):</label>
            <input
              type="password"
              value={sharePhrase}
              onChange={(e) => setSharePhrase(e.target.value)}
              minLength={4}
              maxLength={8}
              required
              style={{ width: '100%', padding: '0.4rem' }}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Aadhaar'}
          </button>
        </form>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3> Verified Identity</h3>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>DOB:</strong> {result.dob}</p>
          <p><strong>Gender:</strong> {result.gender}</p>
          <p><strong>Ref ID:</strong> {result.referenceId}</p>
          {result.photo && (
            <div>
              <strong>Photo:</strong>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
                (Photo is in JP2 format — may not render in all browsers)
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setResult(null);
              setFile(null);
              setSharePhrase('');
            }}
            style={{ marginTop: '1rem', padding: '0.4rem 0.8rem' }}
          >
            Verify Another
          </button>
        </div>
      )}
    </div>
  );
}