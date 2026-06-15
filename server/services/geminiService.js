require('dotenv').config();

const MODEL_ID = 'gemini-2.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Calls Google Gemini API using native fetch.
 * @param {string} systemPrompt - The system-level instruction.
 * @param {string} userMessage  - The user-level message/data payload.
 * @param {boolean} jsonMode    - Whether to request response in JSON format.
 * @param {Array<{mimeType: string, data: string}>} images - Optional array of base64 images.
 * @returns {Promise<string>}   - The model's text response.
 */
async function converse(systemPrompt, userMessage, jsonMode = false, images = []) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const parts = [{ text: userMessage }];
  if (images && images.length > 0) {
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data
        }
      });
    });
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: parts
      }
    ]
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [
        {
          text: systemPrompt
        }
      ]
    };
  }

  body.generationConfig = {
    temperature: 0.3,
  };

  if (jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error (${response.status}):`, errorText);
    throw new Error(`Gemini API call failed: ${response.status} — ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) {
    return text.trim();
  }

  throw new Error('Unexpected Gemini response format: no text content found');
}

module.exports = { converse, MODEL_ID };
