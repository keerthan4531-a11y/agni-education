import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Trash2, Copy, BookOpen, Zap, RotateCcw, ChevronDown } from 'lucide-react';
import { ollamaChat } from '../services/ollama';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT_EN = `You are AGNI, an advanced AI study mentor for Indian students preparing for competitive exams like NEET, JEE, UPSC, TNPSC, SSC, and placement exams (TCS, Infosys, Wipro, etc.).

Your role:
- Explain concepts clearly in simple English
- Solve problems step-by-step with clear reasoning  
- Give exam-specific tips and tricks
- Provide memory tricks (mnemonics) when useful
- Be encouraging and motivating like a senior student mentor
- When giving formulas, show both the formula and a worked example

Always structure your response well with headers when explaining complex topics. Be concise but complete.`;

const SYSTEM_PROMPT_TA = `நீ AGNI, ஒரு சிறந்த AI படிப்பு வழிகாட்டி. நீட், ஜேஈஈ, UPSC, TNPSC, SSC மற்றும் IT placement தேர்வுகளுக்கு தயாராகும் மாணவர்களுக்கு உதவுகிறாய்.

உன் பணி:
- கருத்துகளை எளிமையான தமிழில் விளக்கு (தமிழ்-ஆங்கிலம் கலந்த விளக்கம் சரி)
- படிப்படியாக பதில் சொல்லு
- தேர்வுக்கு உதவும் tricks மற்றும் shortcuts சொல்லு
- ஊக்குவிக்கும் மாணவர் தோழன் மாதிரி பேசு

பதில்கள் தெளிவாகவும், பயனுள்ளதாகவும் இருக்கட்டும். தமிழ் மாணவர்களுக்கு ஏற்ப எளிமையாக சொல்லு.`;


const QUICK_PROMPTS_EN = [
  "Newton's Laws of Motion explain with examples",
  "Photosynthesis process step by step",
  "Integration basic rules and tricks",
  "UPSC prelims strategy for beginners",
  "Train problems shortcut methods",
  "Organic Chemistry reactions memory tricks",
  "Current affairs important topics",
  "DSA - Array and String problems approach",
];

const QUICK_PROMPTS_TA = [
  "Newton's Laws of Motion examples koodu explain pannu",
  "Photosynthesis process step by step sollu",
  "Integration basic rules and tricks sollu",
  "UPSC prelims strategy beginners-ku sollu",
  "Train problems shortcut methods sollu",
  "Organic Chemistry reactions memory tricks sollu",
  "Current affairs important topics en sonnu",
  "DSA - Array and String problems approach sollu",
];


const ChatBubble = ({ msg }) => (
  <div className={`chat-bubble ${msg.role}`} style={{ maxWidth: msg.role === 'user' ? '70%' : '85%' }}>
    {msg.role === 'ai' && (
      <div className="bubble-header">
        <Brain size={14} color="var(--neon-primary)" />
        <span className="bubble-ai-name">AGNI AI</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    )}
    {msg.role === 'ai' ? (
      <div style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <div style={{ marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.7 }}>{children}</div>,
            strong: ({ children }) => <strong style={{ color: 'var(--neon-primary)', fontWeight: 700 }}>{children}</strong>,
            em: ({ children }) => <em style={{ color: 'var(--neon-cyan)', fontStyle: 'italic' }}>{children}</em>,
            h1: ({ children }) => <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '14px 0 8px' }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 6px' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--neon-cyan)', margin: '10px 0 5px' }}>{children}</h3>,
            ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ol>,
            li: ({ children }) => <li style={{ color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--neon-primary)', paddingLeft: 12, margin: '8px 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>{children}</blockquote>,
            code: ({ inline, children }) => inline
              ? <code style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--neon-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.82rem', fontFamily: 'monospace' }}>{children}</code>
              : <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px', fontSize: '0.82rem', overflowX: 'auto', marginBottom: 10, fontFamily: 'monospace' }}><code style={{ color: 'var(--neon-cyan)', whiteSpace: 'pre-wrap' }}>{children}</code></div>,
            pre: ({ children }) => <div style={{ marginBottom: 8 }}>{children}</div>,
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>
    ) : (
      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{msg.content}</div>
    )}
    {msg.role === 'user' && (
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' }}>
        {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    )}
  </div>
);

const AIChat = ({ lang = 'en' }) => {
  const SYSTEM_PROMPT = lang === 'ta' ? SYSTEM_PROMPT_TA : SYSTEM_PROMPT_EN;
  const QUICK_PROMPTS = lang === 'ta' ? QUICK_PROMPTS_TA : QUICK_PROMPTS_EN;

  const welcomeMsg = lang === 'ta'
    ? `# வணக்கம்! நான் AGNI, உன் AI படிப்பு வழிகாட்டி

நான் உதவுவேன்:
- **நீட் / ஜேஈஈ** — Physics, Chemistry, Biology, Maths
- **UPSC / TNPSC / SSC** — GS, நடப்பு நிகழ்வுகள், கட்டுரை
- **Placement** — Aptitude, DSA, Company-wise prep

**தமிழிலோ, ஆங்கிலத்திலோ** கேள் — நான் பதில் சொல்கிறேன்!

ஏதாவது doubt இருக்கா? கேளு!`
    : `# Vanakkam! I'm AGNI, your AI Study Mentor

I'm here to help you with:
- **NEET / JEE** — Physics, Chemistry, Biology, Maths
- **UPSC / TNPSC / SSC** — GS, Current Affairs, Essay
- **Placement Exams** — Aptitude, DSA, Company-wise prep

**Ask in Tamil or English** — I'll explain clearly!

What do you want to study today?`;

  const [messages, setMessages] = useState([
    { role: 'ai', content: welcomeMsg, ts: Date.now() }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollBottom(); }, [messages]);

  const buildHistory = () => {
    const history = [{ role: 'system', content: SYSTEM_PROMPT }];
    messages.forEach(m => {
      history.push({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content });
    });
    return history;
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setShowQuick(false);
    const userMsg = { role: 'user', content: userText, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const aiMsgId = Date.now() + 1;
    const aiPlaceholder = { role: 'ai', content: '', ts: aiMsgId, loading: true };
    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const history = buildHistory();
      history.push({ role: 'user', content: userText });

      await ollamaChat(history, (_, fullText) => {
        setMessages(prev => prev.map(m => m.ts === aiMsgId ? { ...m, content: fullText, loading: false } : m));
      });
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.ts === aiMsgId
          ? { ...m, content: `**AI Error:** ${err.message}\n\n> Make sure Ollama is running: \`ollama serve\`\n> Then: \`ollama run gemini-3-flash-preview\``, loading: false }
          : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([messages[0]]);

  const copyMsg = (text) => navigator.clipboard.writeText(text);

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Chat Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <ChatBubble msg={msg} />
            {msg.loading && (
              <div className="chat-bubble ai" style={{ maxWidth: 160, marginTop: -8 }}>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {showQuick && (
        <div style={{ padding: '8px 20px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quick Start</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="topic-chip" style={{ fontSize: '0.75rem' }} onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <button className="btn btn-ghost btn-icon" title="Clear chat" onClick={clearChat}>
          <Trash2 size={16} />
        </button>
        <button className="btn btn-ghost btn-icon" title="Show quick prompts" onClick={() => setShowQuick(p => !p)}>
          <Zap size={16} />
        </button>
        <textarea
          ref={textareaRef}
          className="chat-input"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask any doubt... (e.g. 'Electrostatics explain pannu' or 'Train speed problem solve pannu')"
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-icon"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ padding: '11px 14px' }}
        >
          {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
