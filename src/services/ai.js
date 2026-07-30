// AGNI AI Service — Cloudflare Worker API (OpenAI-compatible)
const API_BASE = 'https://ultimate-ai-worker.haruyhari930.workers.dev';
const MODEL = 'surfsense/gpt-5.4-mini-no-login';

/**
 * Chat with AI using messages array (OpenAI format)
 * @param {Array} messages - [{role: 'system'|'user'|'assistant', content: '...'}]
 * @param {Function} onChunk - callback(chunkText, fullText) called on each streamed chunk
 * @returns {Promise<string>} full response text
 */
export const aiChat = async (messages, onChunk) => {
  const res = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI API error: ${res.status}. ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      // SSE format: "data: {...}"
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk?.(content, fullText);
          }
        } catch (_) {}
      } else {
        // Some workers return raw JSON lines (non-SSE)
        try {
          const json = JSON.parse(line);
          // Handle OpenAI streaming format
          const content = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content;
          if (content) {
            fullText += content;
            onChunk?.(content, fullText);
          }
        } catch (_) {}
      }
    }
  }

  // If streaming didn't yield any text, try non-streaming fallback
  if (!fullText) {
    const fallbackRes = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
      }),
    });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      fullText = data.choices?.[0]?.message?.content || '';
      onChunk?.(fullText, fullText);
    }
  }

  return fullText;
};

/**
 * Generate text from a single prompt (wraps aiChat with a user message)
 * @param {string} prompt - The prompt text
 * @param {Function} onChunk - callback(chunkText, fullText)
 * @returns {Promise<string>} full response text
 */
export const aiGenerate = async (prompt, onChunk) => {
  return aiChat([{ role: 'user', content: prompt }], onChunk);
};

/**
 * Check if the AI service is online
 * @returns {Promise<{online: boolean}>}
 */
export const checkAIStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/v1/models`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return { online: true, model: MODEL };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
};
