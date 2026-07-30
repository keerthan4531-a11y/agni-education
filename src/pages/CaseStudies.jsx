import React, { useState, useRef, useEffect } from 'react';
import { Search, Stethoscope, ChevronRight, Send, Loader2 } from 'lucide-react';
import { aiChat } from '../services/ai';
import ReactMarkdown from 'react-markdown';

const CaseStudies = ({ lang = 'en' }) => {
  const [phase, setPhase] = useState('select'); // select | chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const t = (en, ta) => lang === 'ta' ? ta : en;

  const cases = [
    { title: 'The Collapsed Athlete', subject: 'Biology', desc: 'A 24-year-old collapsed. Muscles show lactic acid. Solve the cellular respiration mystery.' },
    { title: 'The Floating Metal', subject: 'Physics', desc: 'A block of seemingly solid iron is floating in a clear liquid. Explain the buoyancy paradox.' },
    { title: 'The Sour Rain', subject: 'Chemistry', desc: 'Marble statues in the city are melting. Trace the chemical pathway from factory exhaust.' },
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startCase = async (c) => {
    setPhase('chat');
    setMessages([]);
    setLoading(true);
    const systemPrompt = `You are a strict but helpful mentor evaluating a real-world case study. The student is trying to solve: "${c.title}" which refers to "${c.desc}". 
Present the case natively in ${lang === 'ta' ? 'Tamil' : 'English'} to the student as an interactive mystery. Do NOT give them the direct answer. Make them guess what is happening step by step. Tell them to ask questions or state what they think is happening.`;
    
    try {
      let fullRaw = '';
      await aiChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Present the case to me.' }], (_, text) => { fullRaw = text; });
      setMessages([{ role: 'ai', content: fullRaw }]);
    } catch(e) {
      setMessages([{ role: 'ai', content: 'Error connecting to AI service.' }]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if(!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      let fullRaw = '';
      const chatHistory = [
          { role: 'system', content: `You are solving a mystery case study with a student natively in ${lang === 'ta' ? 'Tamil' : 'English'}. Never give the full answer outright. Socratic method only.` },
          ...newHistory
      ];
      await aiChat(chatHistory, (_, text) => {
          setMessages([...newHistory, { role: 'ai', content: text }]);
      });
    } catch(e) {
       setMessages([...newHistory, { role: 'ai', content: 'Connection lost.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {phase === 'select' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t('Sherlock Case Studies', 'ரியல்-வேர்ல்ட் கேஸ் ஸ்டடீஸ்')}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('Solve mysteries using science. The strongest way to learn application-level concepts.', 'அறிவியலை பயன்படுத்தி மர்மங்களை தீர்க்கவும். புரிதலை ஆழமாக்குங்கள்.')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cases.map((c, i) => (
              <div key={i} className="resource-item" onClick={() => startCase(c)} style={{ padding: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--neon-green)', marginBottom: 8 }}>{c.subject.toUpperCase()}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{c.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.desc}</p>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(0,0,0,0.2)' }}>
             <button className="btn btn-secondary btn-sm" onClick={() => setPhase('select')}>{t('Abandon Case', 'கைவிடு')}</button>
             <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t('Case File Active', 'கேஸ் ஃபைல் ஆக்டிவ்')}</div>
          </div>
          
          <div className="chat-messages" style={{ flex: 1 }}>
            {messages.map((m, i) => (
               <div key={i} className={`chat-bubble ${m.role}`}>
                 {m.role === 'ai' && <div className="bubble-header"><Stethoscope size={14} color="var(--neon-green)"/><span className="bubble-ai-name">AGNI MENTOR</span></div>}
                 <ReactMarkdown>{m.content}</ReactMarkdown>
               </div>
            ))}
            {loading && messages[messages.length-1]?.role === 'user' && (
                <div className="chat-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chat-input-row" style={{ background: 'var(--bg-card-hover)' }}>
            <textarea className="chat-input" rows={2} placeholder={t("Ask a question, guess a reason, or deduce a formula...", "கேள்வி கேளுங்கள் அல்லது காரணத்தை கூறுங்கள்...")} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
            <button className="btn btn-green btn-icon" onClick={handleSend} disabled={loading || !input.trim()}><Send size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudies;
