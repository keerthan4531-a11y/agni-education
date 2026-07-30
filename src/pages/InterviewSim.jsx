import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Briefcase, Bot, Loader2, Award, ChevronRight } from 'lucide-react';
import { ollamaChat } from '../services/ollama';

const InterviewSim = ({ lang = 'en' }) => {
  const [phase, setPhase] = useState('lobby'); // lobby -> interview -> results
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const endRef = useRef(null);

  const t = (en, ta) => lang === 'ta' ? ta : en;

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // English primary for interviews
      
      recognitionRef.current.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) handleSendVoice(transcript);
      };
    }
    return () => {
        if(recognitionRef.current) recognitionRef.current.stop();
        if(synthRef.current) synthRef.current.cancel();
    };
  }, [lang, transcript]); // Updated dependencies

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const startListening = () => {
    if(!recognitionRef.current) return alert("Browser not supported.");
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if(recognitionRef.current) recognitionRef.current.stop();
  };

  const speak = (text) => {
    if(!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if(synthRef.current) {
        synthRef.current.cancel();
        setSpeaking(false);
    }
  };

  const startInterview = async (company) => {
    setPhase('interview');
    setMessages([]);
    setLoading(true);
    const systemPrompt = `You are an HR Interviewer at ${company}. You are interviewing a fresh graduate for a technical role. Act professional. Ask them to introduce themselves first. Do NOT provide answers. Evaluate their English confidence and structure indirectly via followups.`;
    
    try {
      let fullRaw = '';
      await ollamaChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Start the interview.' }], (_, text) => { fullRaw = text; });
      setMessages([{ role: 'ai', content: fullRaw }]);
      speak(fullRaw);
    } catch(e) {
      setMessages([{ role: 'ai', content: 'Error loading interview.' }]);
    }
    setLoading(false);
  };

  const handleSendVoice = async (userText) => {
    if(!userText.trim() || loading) return;
    setTranscript('');
    const newHistory = [...messages, { role: 'user', content: userText.trim() }];
    setMessages(newHistory);
    setLoading(true);
    stopSpeaking();
    
    try {
      const chatHistory = [
          { role: 'system', content: `You are an HR Interviewer. Evaluate their answer silently, note grammar issues, and then ask the next technical or behavioral question.` },
          ...newHistory
      ];
      let fullRaw = '';
      await ollamaChat(chatHistory, (_, text) => { fullRaw = text; });
      setMessages([...newHistory, { role: 'ai', content: fullRaw }]);
      speak(fullRaw);
    } catch(e) { /* ignored */ }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {phase === 'lobby' && (
         <div style={{ flex: 1 }}>
            <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
               <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Briefcase size={32} color="var(--neon-blue)" /> {t('HR Interview Simulator', 'HR நேர்காணல் பயிற்சி')}
               </h1>
               <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 600 }}>
                 {t("Practice real-time voice interviews. AI will grade your English, confidence, and STAR method usage.", "டிசிஎஸ் / இன்ஃபோசிஸ் போன்ற நிறுவனங்களுக்கான நேர்காணல் பயிற்சிக்கு தயார் ஆகுங்கள்.")}
               </p>
            </div>
            
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 16 }}>Select Target Company</h3>
            <div className="grid-2" style={{ gap: 16 }}>
               {['TCS Ninja / Digital', 'Infosys Specialist', 'Product Based (Amazon/Google)', 'UPSC Civil Services'].map((c, i) => (
                   <button key={i} className="card card-glow-blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }} onClick={() => startInterview(c)}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c}</div>
                      <ChevronRight size={20} color="var(--neon-blue)" />
                   </button>
               ))}
            </div>
         </div>
      )}

      {phase === 'interview' && (
         <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: speaking ? '1px solid var(--neon-blue)' : '1px solid var(--border)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bot size={20} color={speaking ? 'var(--neon-blue)' : 'var(--text-muted)'} />
                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>HR Manager (AI)</div>
             </div>
             <div style={{ display: 'flex', gap: 10 }}>
               <button className="btn btn-ghost btn-icon" onClick={speaking ? stopSpeaking : () => messages[messages.length-1]?.role === 'ai' && speak(messages[messages.length-1].content)}>
                  {speaking ? <VolumeX size={20} color="var(--neon-red)" /> : <Volume2 size={20} color="var(--neon-green)" />}
               </button>
               <button className="btn btn-red btn-sm" onClick={() => setPhase('lobby')}>End</button>
             </div>
          </div>

          <div className="chat-messages" style={{ flex: 1, padding: '24px 20px' }}>
            {messages.map((m, i) => (
               <div key={i} className={`chat-bubble ${m.role}`} style={{ maxWidth: '85%', fontSize: '1.05rem', lineHeight: 1.6, background: m.role === 'ai' ? 'var(--bg-card)' : 'rgba(59,130,246,0.1)', borderColor: m.role === 'ai' ? 'var(--border)' : 'rgba(59,130,246,0.3)' }}>
                 {m.role === 'ai' && <div className="bubble-header"><Bot size={14} color="var(--neon-blue)"/><span className="bubble-ai-name" style={{ color: 'var(--neon-blue)' }}>HR PANEL</span></div>}
                 {m.content}
               </div>
            ))}
            {transcript && (
               <div className="chat-bubble user" style={{ opacity: 0.7, maxWidth: '85%', background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }}>
                 <div className="bubble-header"><User size={14} color="var(--neon-blue)"/><span className="bubble-ai-name" style={{ color: 'var(--neon-blue)' }}>LISTENING...</span></div>
                 {transcript} <span style={{ animation: 'blink 1s infinite' }}>|</span>
               </div>
            )}
            {loading && !transcript && (
                <div className="chat-bubble ai"><div className="typing-dots"><span/><span/><span/></div></div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-card-hover)' }}>
             <button 
                onMouseDown={startListening} 
                onMouseUp={stopListening}
                onMouseLeave={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                style={{ 
                    width: 72, height: 72, borderRadius: 36, border: 'none', cursor: 'pointer',
                    background: isListening ? 'var(--neon-red)' : 'var(--neon-blue)',
                    boxShadow: isListening ? '0 0 30px rgba(239,68,68,0.6)' : 'var(--glow-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', transform: isListening ? 'scale(1.1)' : 'scale(1)'
                }}>
                {isListening ? <Mic size={32} color="#fff" /> : <MicOff size={28} color="rgba(255,255,255,0.8)" />}
             </button>
             <div style={{ position: 'absolute', bottom: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hold to speak. Release to send.</div>
          </div>
         </div>
      )}
    </div>
  );
};

export default InterviewSim;
