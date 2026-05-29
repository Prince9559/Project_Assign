/**
 * Sanitizes search input to prevent SQL Injection.
 * Allows only: Letters (a-z), Numbers (0-9), Spaces, Hyphens (-), Underscores (_).
 * 
 * @param {string} input - The raw search string from req.query
 * @returns {object} - { isValid: boolean, value: string|null, error: string|null }
 */
const sanitizeSearchInput = (input) => {
    // Allow empty/short searches (caller can decide how to handle empty string).
    if (input === undefined || input === null) {
        return { isValid: true, value: "", error: null };
    }

    if (typeof input !== 'string') {
        return { isValid: false, value: null, error: "Input must be a string" };
    }

    const trimmed = input.trim();

    // If empty after trimming, accept and return empty value.
    if (trimmed.length === 0) {
        return { isValid: true, value: "", error: null };
    }

    // Regex: Allow only alphanumeric, space, hyphen, underscore
    const safePattern = /^[a-zA-Z0-9\s\-_]+$/;

    if (!safePattern.test(trimmed)) {
        return { isValid: false, value: null, error: "Input contains invalid characters" };
    }

    return { isValid: true, value: trimmed, error: null };
};

module.exports = { sanitizeSearchInput };