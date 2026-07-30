// Ollama API service – auto-detects model name
const OLLAMA_BASE = 'http://localhost:11434';

// Try these model names in order until one works
const MODEL_CANDIDATES = [
  'gemini-3-flash-preview:latest ',
  'gemini-3-flash-preview:latest',
  'kimi-k2.5:cloud ',
  'gemini3-flash-preview',
  'gemma3:latest',
  'gemma2:latest',
  'llama3.2:latest',
  'llama3:latest',
  'mistral:latest',
];

let _resolvedModel = null;

// Auto-detect which model is available
const getModel = async () => {
  if (_resolvedModel) return _resolvedModel;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);

      // Try exact match first
      for (const candidate of MODEL_CANDIDATES) {
        if (models.includes(candidate)) {
          _resolvedModel = candidate;
          console.log(`✅ AGNI: Using Ollama model → ${_resolvedModel}`);
          return _resolvedModel;
        }
      }

      // Try partial match
      for (const candidate of MODEL_CANDIDATES) {
        const base = candidate.split(':')[0];
        const found = models.find(m => m.startsWith(base));
        if (found) {
          _resolvedModel = found;
          console.log(`✅ AGNI: Using Ollama model (partial match) → ${_resolvedModel}`);
          return _resolvedModel;
        }
      }

      // Fallback to first available model
      if (models.length > 0) {
        _resolvedModel = models[0];
        console.log(`⚠️ AGNI: No preferred model found. Using → ${_resolvedModel}`);
        return _resolvedModel;
      }
    }
  } catch (e) {
    console.warn('AGNI: Could not auto-detect model, using default');
  }

  _resolvedModel = 'gemini-3-flash-preview';
  return _resolvedModel;
};

export const ollamaChat = async (messages, onChunk) => {
  const model = await getModel();
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}. Model: ${model}. Is Ollama running?`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) {
          fullText += json.message.content;
          onChunk?.(json.message.content, fullText);
        }
      } catch (_) {}
    }
  }
  return fullText;
};

export const ollamaGenerate = async (prompt, onChunk) => {
  const model = await getModel();
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}. Model: ${model}. Is Ollama running?`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          fullText += json.response;
          onChunk?.(json.response, fullText);
        }
      } catch (_) {}
    }
  }
  return fullText;
};

export const checkOllamaStatus = async () => {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      const model = await getModel();
      return { online: true, hasModel: models.includes(model), models, activeModel: model };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
};
