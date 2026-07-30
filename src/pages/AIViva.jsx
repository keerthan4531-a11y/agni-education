import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, User, Bot, Loader2, PlayCircle, Trophy } from 'lucide-react';
import { ollamaChat } from '../services/ollama';

const AIViva = ({ lang = 'en' }) => {
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
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      
      recognitionRef.current.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Automatically send when stops listening if there is text
        if (transcript.trim()) {
          handleSendVoice(transcript);
        }
      };
    }

    return () => {
        if(recognitionRef.current) recognitionRef.current.stop();
        if(synthRef.current) synthRef.current.cancel();
    };
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const startListening = () => {
    if(!recognitionRef.current) return alert("Your browser doesn't support speech recognition. Use Chrome.");
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
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
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

  const startVivaSession = async () => {
    setMessages([]);
    setLoading(true);
    const systemPrompt = `You are a strict but encouraging teacher conducting a Viva (Oral Test) for a 12th standard student natively in ${lang === 'ta' ? 'Tamil' : 'English'}. Include Tamil slang like "Thambi" or "Paappa" if in Tamil. First, introduce yourself and ask a challenging question about Physics (e.g., Newton's laws or Optics). Keep it conversational, short, and to the point. Wait for my answer.`;
    
    try {
      let fullRaw = '';
      await ollamaChat([{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Start the viva.' }], (_, text) => { fullRaw = text; });
      setMessages([{ role: 'ai', content: fullRaw }]);
      speak(fullRaw);
    } catch(e) {
      setMessages([{ role: 'ai', content: 'Error loading viva. Is Ollama running?' }]);
    }
    setLoading(false);
  };

  const handleSendVoice = async (userText) => {
    if(!userText.trim() || loading) return;
    setTranscript('');
    const newHistory = [...messages, { role: 'user', content: userText.trim() }];
    setMessages(newHistory);
    setLoading(true);
    
    stopSpeaking(); // Stop any current AI speech
    
    try {
      const chatHistory = [
          { role: 'system', content: `You are a strict but encouraging teacher conducting an oral Viva natively in ${lang === 'ta' ? 'Tamil' : 'English'}. If the student's answer is wrong, say "Close, but what about X?". If correct, praise them and ask the next question.` },
          ...newHistory
      ];
      let fullRaw = '';
      await ollamaChat(chatHistory, (_, text) => { fullRaw = text; });
      
      setMessages([...newHistory, { role: 'ai', content: fullRaw }]);
      speak(fullRaw);
    } catch(e) {
       setMessages([...newHistory, { role: 'ai', content: 'Connection lost.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {messages.length === 0 ? (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))' }}>
           <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--neon-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: 'var(--glow-purple)', animation: 'flame-pulse 2s infinite' }}>
              <Mic size={40} color="#fff" />
           </div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{t('AI Viva Mode', 'AI நேர்முகத் தேர்வு')}</h1>
           <p style={{ color: 'var(--text-secondary)', marginBottom: 30, maxWidth: 400 }}>{t('Practice speaking out loud to a strict AI examiner. The best way to build confidence and anchor memory.', 'கடினமான AI ஆசிரியரிடம் பேசி பயிற்சி செய்யுங்கள். நினைவாற்றலை அதிகரிக்க இதுவே சிறந்த வழி.')}</p>
           <button className="btn btn-primary btn-lg" onClick={startVivaSession} disabled={loading}>
              {loading ? <Loader2 className="spinner" /> : <><PlayCircle size={20}/> {t('Start Viva Action', 'தொடங்கு')}</>}
           </button>
        </div>
      ) : (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: speaking ? '1px solid var(--neon-purple)' : '1px solid var(--border)' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bot size={20} color={speaking ? 'var(--neon-purple)' : 'var(--text-muted)'} />
                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t('Viva Examiner', 'தேர்வாளர்')}</div>
             </div>
             <button className="btn btn-ghost btn-icon" onClick={speaking ? stopSpeaking : () => messages[messages.length-1]?.role === 'ai' && speak(messages[messages.length-1].content)}>
                {speaking ? <VolumeX size={20} color="var(--neon-red)" /> : <Volume2 size={20} color="var(--neon-green)" />}
             </button>
          </div>

          <div className="chat-messages" style={{ flex: 1, padding: '24px 20px' }}>
            {messages.map((m, i) => (
               <div key={i} className={`chat-bubble ${m.role}`} style={{ maxWidth: '85%', fontSize: '1.05rem', lineHeight: 1.6 }}>
                 {m.role === 'ai' && <div className="bubble-header"><Bot size={14} color="var(--neon-purple)"/><span className="bubble-ai-name">AGNI EXAMINER</span></div>}
                 {m.content}
               </div>
            ))}
            {transcript && (
               <div className="chat-bubble user" style={{ opacity: 0.7, maxWidth: '85%' }}>
                 <div className="bubble-header"><User size={14} color="var(--neon-orange)"/><span className="bubble-ai-name">LISTENING...</span></div>
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
                    background: isListening ? 'var(--neon-red)' : 'var(--neon-primary)',
                    boxShadow: isListening ? '0 0 30px rgba(239,68,68,0.6)' : 'var(--glow-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)'
                }}>
                {isListening ? <Mic size={32} color="#fff" /> : <MicOff size={28} color="rgba(255,255,255,0.8)" />}
             </button>
             <div style={{ position: 'absolute', bottom: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                 {t('Hold to speak. Release to send.', 'பேச அழுத்திப் பிடிக்கவும். அனுப்ப விடுவிக்கவும்.')}
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIViva;
