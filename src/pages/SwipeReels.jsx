import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronDown, CheckCircle, XCircle, Home, Loader2, Sparkles } from 'lucide-react';
import { aiGenerate } from '../services/ai';

const SwipeReels = ({ lang = 'en' }) => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState(null); // 'correct', 'wrong', null
  const [feedback, setFeedback] = useState('');

  const t = (en, ta) => lang === 'ta' ? ta : en;
  const topics = ['Newton\'s Laws', 'Photosynthesis', 'Chemical Bonding', 'Thermodynamics', 'Genetics'];

  const generateNextReel = async () => {
    setLoading(true);
    setAnswerState(null);
    setFeedback('');
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const prompt = `Create a 1-minute micro-learning "reel" natively in ${lang === 'ta' ? 'Tamil' : 'English'} about "${randomTopic}".
Return exactly in this format with these tags:
<CONCEPT>
Short definition or formula.
</CONCEPT>
<EXAMPLE>
A 1-2 sentence real-world example.
</EXAMPLE>
<QUESTION>
A True/False statement about this concept.
</QUESTION>
<ANSWER>
True or False
</ANSWER>
<EXPLANATION>
Why it is True or False.
</EXPLANATION>`;

    try {
      let fullRaw = '';
      await aiGenerate(prompt, (_, text) => { fullRaw = text; });
      
      const extract = (tag) => {
         const m = fullRaw.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
         return m ? m[1].trim() : '';
      };
      
      const reel = {
        topic: randomTopic,
        concept: extract('CONCEPT'),
        example: extract('EXAMPLE'),
        question: extract('QUESTION'),
        answer: extract('ANSWER')?.toLowerCase().includes('true'),
        explanation: extract('EXPLANATION')
      };
      
      setReels(prev => [...prev, reel]);
      setCurrentIndex(reels.length);
    } catch (e) {
      console.error('Reel generation error', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    generateNextReel();
  }, [lang]);

  const handleAnswer = (isTrue) => {
    const current = reels[currentIndex];
    if (current.answer === isTrue) {
      setAnswerState('correct');
      setFeedback('🔥 ' + t('Brilliant! Correct.', 'மிக அருமை! சரியான பதில்.'));
    } else {
      setAnswerState('wrong');
      setFeedback('💡 ' + t('Not quite! ', 'தவறு! ') + current.explanation);
    }
  };

  const currentReel = reels[currentIndex];

  return (
    <div style={{ maxWidth: 450, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PlayCircle size={24} color="var(--neon-purple)" />
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t('Micro-Learning Reels', 'நுண் கற்றல் ரீல்ஸ்')}</h2>
      </div>

      <div style={{ flex: 1, position: 'relative', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading && !currentReel ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <Loader2 size={40} color="var(--neon-purple)" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: 'var(--text-secondary)' }}>{t('Creating a personalized reel...', 'உங்களுக்கான ரீல் தயாராகிறது...')}</div>
            </div>
        ) : currentReel ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(168,85,247,0.15)', color: 'var(--neon-purple)', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, marginBottom: 16, alignSelf: 'flex-start' }}>
                    {currentReel.topic.toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>{t('Concept', 'கான்செப்ட்')}</h3>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>{currentReel.concept}</p>
                    
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--neon-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={16}/> {t('Real World Example', 'நடைமுறை உதாரணம்')}</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32, paddingLeft: 12, borderLeft: '3px solid var(--neon-cyan)' }}>{currentReel.example}</p>

                    <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--neon-orange)', marginBottom: 12 }}>{t('RAPID FIRE T/F', 'விரைவு கேள்வி')}</div>
                        <p style={{ marginBottom: 16, color: 'var(--text-primary)', fontSize: '1rem' }}>{currentReel.question}</p>
                        
                        {answerState ? (
                            <div style={{ padding: 12, borderRadius: 12, background: answerState === 'correct' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: answerState === 'correct' ? 'var(--neon-green)' : 'var(--neon-red)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {feedback}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <button className="btn btn-green" onClick={() => handleAnswer(true)}>{t('TRUE', 'சரி')}</button>
                                <button className="btn btn-red" onClick={() => handleAnswer(false)}>{t('FALSE', 'தவறு')}</button>
                            </div>
                        )}
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} onClick={generateNextReel} disabled={loading}>
                    {loading ? <Loader2 className="spinner" size={20} /> : <><ChevronDown size={20}/> <span>{t('Swipe for Next', 'அடுத்த ரீல் செல்லவும்')}</span></>}
                </button>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default SwipeReels;
