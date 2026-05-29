// // controllers/gstGovController.js
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');

// // In-memory session store (like Flask's gstSessions)
// const gstSessions = {};

// // Helper: Create a session with initial cookies from GST portal
// async function createGstSession() {
//   const instance = axios.create();

//   await instance.get('https://services.gst.gov.in/services/searchtp', {
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
//     },
//     maxRedirects: 0,
//     validateStatus: (status) => status < 400,
//   });

//   return instance;
// }

// // GET /api/v1/gst/captcha
// exports.getCaptcha = async (req, res) => {
//   try {
//     const sessionId = uuidv4();
//     const session = await createGstSession();

//     const captchaResponse = await session.get('https://services.gst.gov.in/services/captcha', {
//       responseType: 'arraybuffer',
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
//       },
//     });

//     const captchaBase64 = Buffer.from(captchaResponse.data).toString('base64');
//     const imageDataUrl = `data:image/png;base64,${captchaBase64}`; // <-- 'data:' added



//     gstSessions[sessionId] = { axiosInstance: session };

//     res.json({
//       sessionId,
//       image: imageDataUrl,
//     });
//   } catch (error) {
//     console.error('Captcha error:', error.message);
//     res.status(500).json({ error: 'Failed to fetch CAPTCHA' });
//   }
// };

// // POST /api/v1/gst/details
// exports.getGSTDetails = async (req, res) => {
//   try {
//     const { sessionId, GSTIN, captcha } = req.body;

//     if (!sessionId || !GSTIN || !captcha) {
//       return res.status(400).json({ error: 'sessionId, GSTIN, and captcha are required' });
//     }

//     const userSession = gstSessions[sessionId];
//     if (!userSession) {
//       return res.status(400).json({ error: 'Invalid or expired session' });
//     }

//     const { axiosInstance } = userSession;

//     const response = await axiosInstance.post(
//       'https://services.gst.gov.in/services/api/search/taxpayerDetails',
//       { gstin: GSTIN.trim().toUpperCase(), captcha: captcha.trim() },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('GST details error:', error.message);
//     if (error.response?.data) {
//       return res.status(error.response.status).json(error.response.data);
//     }
//     res.status(500).json({ error: 'Failed to fetch GST details' });
//   }
// };











// controllers/gstGovController.js
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

// In-memory store: sessionId → { cookies: 'cookie1=val1; cookie2=val2', userAgent }
const gstSessions = {};
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function isExpiredSession(session) {
  return session?.createdAt && Date.now() - session.createdAt > 10 * 60 * 1000;
}

async function persistGSTVerification(user_id, gstin, details = {}) {
  if (!db.CompanyRecruiterProfile) return null;

  const payload = {
    is_gst_verified: true,
    gst_number: gstin,
  };

  const profile = await db.CompanyRecruiterProfile.findOne({ where: { user_id } });
  if (profile) {
    await profile.update(payload);
    return profile;
  }

  return db.CompanyRecruiterProfile.create({
    user_id,
    company_name: details.tradeNam || details.lgnm || null,
    company_address: details.address || null,
    status: 1,
    is_verified: false,
    ...payload,
  });
}

// Helper: Extract cookies from axios response headers
function extractCookies(headers) {
  const cookies = [];
  if (headers['set-cookie']) {
    headers['set-cookie'].forEach(cookie => {
      // Extract "name=value" part before ';'
      const firstPart = cookie.split(';')[0];
      if (firstPart) cookies.push(firstPart);
    });
  }
  return cookies.join('; ');
}

// Helper: Get initial session cookies from /searchtp
async function getInitialCookies() {
  const userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';

  const res = await axios.get('https://services.gst.gov.in/services/searchtp', {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    maxRedirects: 0,
    validateStatus: (status) => status < 400,
  });

  const cookies = extractCookies(res.headers);
  return { cookies, userAgent };
}

// GET /api/gst/captcha
exports.getCaptcha = async (req, res) => {
  try {
    const sessionId = uuidv4();
    
    // Step 1: Get initial cookies (TS0134d082, bm_sv, etc.)
    const { cookies: initialCookies, userAgent } = await getInitialCookies();

    // Step 2: Fetch CAPTCHA with those cookies → gets CaptchaCookie
    const captchaRes = await axios.get('https://services.gst.gov.in/services/captcha', {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': userAgent,
        'Cookie': initialCookies,
        'Referer': 'https://services.gst.gov.in/services/searchtp',
        'Origin': 'https://services.gst.gov.in',
      },
    });

    // Extract NEW cookies (especially CaptchaCookie)
    const captchaCookies = extractCookies(captchaRes.headers);
    // Combine initial + captcha cookies
    const allCookies = [initialCookies, captchaCookies]
      .filter(c => c.trim())
      .join('; ');

    // Store cookies + userAgent
    gstSessions[sessionId] = { cookies: allCookies, userAgent, createdAt: Date.now() };

    // Encode image
    const captchaBase64 = Buffer.from(captchaRes.data).toString('base64');
    const imageDataUrl = `data:image/png;base64,${captchaBase64}`;

    res.json({
      sessionId,
      image: imageDataUrl,
      provider: 'gst_portal',
    });
  } catch (error) {
    console.error('Captcha error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch CAPTCHA from GST portal. Please try again later.',
    });
  }
};

// POST /api/gst/details
exports.getGSTDetails = async (req, res) => {
  try {
    const { sessionId, GSTIN, captcha } = req.body;
    const user_id = req.user?.id;

    console.log('[GST verify] payload:', {
      hasSession: !!sessionId,
      GSTIN,
      user_id,
    });

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user?.role !== 'COMPANY') {
      return res.status(403).json({ error: 'GST verification is available only for company accounts' });
    }
    if (!GSTIN) {
      return res.status(400).json({ error: 'GSTIN is required' });
    }

    const gstin = GSTIN.trim().toUpperCase();
    if (!GSTIN_REGEX.test(gstin)) {
      return res.status(400).json({
        error: 'Invalid GSTIN format. Example: 27AAECC8852H1Z5',
      });
    }

    const existingProfile = await db.CompanyRecruiterProfile?.findOne({ where: { user_id } });
    if (
      existingProfile?.is_gst_verified === true &&
      String(existingProfile.gst_number || '').toUpperCase() === gstin
    ) {
      return res.json({
        gstin,
        is_gst_verified: true,
        already_verified: true,
        message: 'GSTIN is already verified for this company profile.',
      });
    }

    if (!sessionId || !captcha) {
      return res.status(400).json({
        error: 'sessionId and captcha are required to verify or change GSTIN',
      });
    }

    const session = gstSessions[sessionId];
    if (!session || isExpiredSession(session)) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    const { cookies, userAgent } = session;

    const payload = {
      gstin,
      captcha: captcha.trim(),
    };

    const response = await axios.post(
      'https://services.gst.gov.in/services/api/search/taxpayerDetails',
      payload,
      {
        headers: {
          'User-Agent': userAgent,
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://services.gst.gov.in',
          'Referer': 'https://services.gst.gov.in/services/searchtp',
          'Cookie': cookies,
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 500,
      }
    );

    const data = response.data || {};
    console.log('[GST verify] portal response keys:', Object.keys(data));

    // Persist verified=true ONLY when the portal returned a real match
    const looksValid = !!(data.gstin || data.lgnm || data.sts);
    if (looksValid && db.CompanyRecruiterProfile) {
      try {
        await persistGSTVerification(user_id, data.gstin || payload.gstin, data);
        console.log('[GST verify] CompanyRecruiterProfile updated for user', user_id);
      } catch (dbErr) {
        console.error('[GST verify] CRP update failed:', dbErr.message);
      }
    }

    delete gstSessions[sessionId];
    return res.json({ ...data, is_gst_verified: looksValid });
  } catch (error) {
    console.error('GST details error:', error.message);
    if (error.response?.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch GST details' });
  }
};