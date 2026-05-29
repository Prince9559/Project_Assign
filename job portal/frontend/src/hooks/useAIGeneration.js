import { useState, useCallback } from 'react';

const DEBOUNCE_DELAY = 800; // ms
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute
const BASE_URL = import.meta.env.VITE_BASE_URL;

let requestTimestamps = [];


const isRateLimited = () => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
  return requestTimestamps.length >= MAX_REQUESTS;
};

const recordRequest = () => {
  requestTimestamps.push(Date.now());
};

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateContent = useCallback(async (input) => {
    const { opportunityType, title, skills } = input;

    if (!title?.trim() || !Array.isArray(skills) || skills.length === 0) {
      setError("Please enter a job title and at least one skill.");
      return null;
    }

    if (isRateLimited()) {
      setError("Too many AI requests. Please wait 1 minute.");
      return null;
    }

    // Debounce
    await new Promise(resolve => setTimeout(resolve, DEBOUNCE_DELAY));

    if (isRateLimited()) {
      setError("Too many AI requests. Please wait 1 minute.");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      recordRequest();

      const response = await fetch(`${BASE_URL}/ai/generate-opportunity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'AI generation failed');
      }

      const data = await response.json();
      const { description, candidatePreferences, screeningQuestions } = data.aiSuggestion;

      return {
        description: description || '',
        candidatePreferences: candidatePreferences || '',
        screeningQuestions: Array.isArray(screeningQuestions) ? screeningQuestions : [],
      };
    } catch (err) {
      setError(err.message || 'Failed to generate content');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateContent, isGenerating, error };
};