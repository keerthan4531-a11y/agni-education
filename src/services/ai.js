// AGNI AI Service — Cloudflare Worker API (OpenAI-compatible)
const API_BASE = 'https://ultimate-ai-worker.haruyhari930.workers.dev';

// Models to try in order — auto-fallback if one fails
const MODELS = [
  'llama-4-maverick',
  'meta-ai',
  'qwen3.7-plus',
  'openai-fast',
  'turbo',
];

let _activeModel = null;

/**
 * Chat with AI using messages array (OpenAI format)
 * @param {Array} messages - [{role: 'system'|'user'|'assistant', content: '...'}]
 * @param {Function} onChunk - callback(chunkText, fullText) called on each streamed chunk
 * @returns {Promise<string>} full response text
 */
export const aiChat = async (messages, onChunk) => {
  const modelsToTry = _activeModel ? [_activeModel, ...MODELS.filter(m => m !== _activeModel)] : [...MODELS];

  for (const model of modelsToTry) {
    try {
      const result = await _tryModelChat(model, messages, onChunk);
      if (result) {
        _activeModel = model; // Cache the working model
        console.log(`✅ AGNI AI: Using model → ${model}`);
        return result;
      }
    } catch (err) {
      console.warn(`⚠️ AGNI AI: Model "${model}" failed: ${err.message}. Trying next...`);
      continue;
    }
  }

  throw new Error('All AI models failed. Please check your internet connection and try again.');
};

/**
 * Internal: try a specific model
 */
const _tryModelChat = async (model, messages, onChunk) => {
  // First try non-streaming (more reliable across workers)
  const res = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  let content = data.choices?.[0]?.message?.content || '';

  // Clean up thinking tags from some models (meta-ai)
  content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();

  if (content) {
    onChunk?.(content, content);
    return content;
  }

  // If non-streaming returned empty, try streaming
  const streamRes = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!streamRes.ok) {
    throw new Error(`Stream HTTP ${streamRes.status}`);
  }

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') continue;
        try {
          const json = JSON.parse(raw);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onChunk?.(delta, fullText);
          }
        } catch (_) {}
      } else {
        try {
          const json = JSON.parse(line);
          const c = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content;
          if (c) {
            fullText += c;
            onChunk?.(c, fullText);
          }
        } catch (_) {}
      }
    }
  }

  // Clean thinking tags from streamed content too
  fullText = fullText.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
  if (fullText) onChunk?.(null, fullText); // Final update with cleaned text
  return fullText || null;
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
 * @returns {Promise<{online: boolean, model: string}>}
 */
export const checkAIStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/v1/models`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return { online: true, model: _activeModel || MODELS[0] };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
};
