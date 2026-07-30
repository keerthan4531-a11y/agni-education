import React, { useState, useEffect } from 'react';
import { Swords, Copy, Users, Zap, CheckCircle, XCircle, Trophy } from 'lucide-react';

const AgniBattles = ({ lang = 'en' }) => {
  const [phase, setPhase] = useState('lobby'); // lobby -> match -> result
  const [battleCode, setBattleCode] = useState('');
  const [status, setStatus] = useState('');
  const [time, setTime] = useState(180); // 3 mins
  
  // Game State
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  
  const t = (en, ta) => lang === 'ta' ? ta : en;

  const questions = [
    { q: "Powerhouse of the cell?", opts: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], ans: 1 },
    { q: "Value of g on Earth?", opts: ["9.8 m/s²", "9.8 cm/s²", "10 m/s", "100 m/s²"], ans: 0 },
    { q: "Water chemical formula?", opts: ["HO2", "H2O2", "H2O", "OH"], ans: 2 },
    { q: "Newton's First Law is also called?", opts: ["Law of Force", "Law of Inertia", "Law of Momentum", "Law of Action"], ans: 1 },
    { q: "Speed of light in vacuum?", opts: ["3 x 10^8 m/s", "3 x 10^5 km/s", "Both A and B", "None"], ans: 2 },
  ];

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setBattleCode(code);
    setStatus('Waiting for opponent...');
    
    // Simulate opponent joining after 4 seconds
    setTimeout(() => {
        setStatus('Opponent "Ramesh_99" joined!');
        setTimeout(() => setPhase('match'), 2000);
    }, 4000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`Join my AGNI BATTLE! Room: ${battleCode}`);
    alert('Code copied! Share via WhatsApp.');
  };

  useEffect(() => {
    let timer;
    if (phase === 'match' && time > 0) {
      timer = setInterval(() => setTime(p => p - 1), 1000);
    } else if (time === 0 && phase === 'match') {
      setPhase('result');
    }
    return () => clearInterval(timer);
  }, [phase, time]);

  // Simulate opponent answering randomly
  useEffect(() => {
      let oppInterval;
      if (phase === 'match') {
          oppInterval = setInterval(() => {
              // 70% chance opponent gets it right, scores 10 points
              if(Math.random() > 0.3) setOpponentScore(p => p + 10);
          }, 6000);
      }
      return () => clearInterval(oppInterval);
  }, [phase]);

  const handleAnswer = (oi) => {
      if(oi === questions[currentQ].ans) {
          setMyScore(p => p + 15); // Faster answer simulation
      } else {
          setMyScore(p => Math.max(0, p - 5)); // Penalty
      }
      
      if(currentQ < questions.length - 1) {
          setCurrentQ(p => p + 1);
      } else {
          setPhase('result');
      }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {phase === 'lobby' && (
        <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-surface)' }}>
           <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f97316)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(239,68,68,0.4)', animation: 'flame-pulse 1s infinite alternate' }}>
               <Swords size={40} color="#fff" />
           </div>
           <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>{t('Multiplayer AGNI Battles', 'மல்டிபிளேயர் போர்')}</h1>
           <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>{t('Challenge your friends to a 3-minute live duel. Winner steals XP!', 'நண்பர்களுக்கு சவால் விடுங்கள். 3 நிமிட நேரடி போட்டி. வெற்றி பெறுபவருக்கு எதிராளியின் XP கிடைக்கும்!')}</p>
           
           {!battleCode ? (
               <button className="btn btn-primary btn-lg" onClick={generateCode}><Swords size={20}/> {t('Create Battle Room', 'போர் அறையை உருவாக்கு')}</button>
           ) : (
               <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--neon-primary)', padding: 24, borderRadius: 16 }}>
                   <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>{t('Room Code', 'அறை குறியீடு')}</div>
                   <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--neon-primary)', letterSpacing: 8, marginBottom: 16 }}>{battleCode}</div>
                   <button className="btn btn-secondary" onClick={copyCode}><Copy size={16}/> {t('Share on WhatsApp', 'வாட்ஸ்அப்பில் பகிரவும்')}</button>
                   <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12, fontWeight: 700, color: 'var(--neon-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Users size={18} /> {status}
                   </div>
               </div>
           )}
        </div>
      )}

      {phase === 'match' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           {/* Top HUD */}
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>YOU</div>
                 <div style={{ fontSize: '1.8rem', color: 'var(--neon-primary)', fontWeight: 900 }}>{myScore}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--neon-red)', padding: '6px 16px', borderRadius: 20, fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace' }}>
                    {formatTime(time)}
                 </div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Time Remaining</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>RAMESH_99</div>
                 <div style={{ fontSize: '1.8rem', color: 'var(--neon-blue)', fontWeight: 900 }}>{opponentScore}</div>
              </div>
           </div>

           {/* Question Area */}
           <div className="card card-glow-orange" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                  <span className="badge badge-orange" style={{ marginBottom: 16 }}>Q {currentQ + 1} / {questions.length}</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{questions[currentQ].q}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 {questions[currentQ].opts.map((opt, oi) => (
                    <button key={oi} className="quiz-option" style={{ padding: 20, justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600 }} onClick={() => handleAnswer(oi)}>
                        {opt}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
           <Trophy size={64} color={myScore >= opponentScore ? "var(--neon-green)" : "var(--neon-red)"} style={{ margin: '0 auto 20px', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }} />
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
              {myScore >= opponentScore ? t('VICTORY!', 'வெற்றி!') : t('DEFEAT', 'தோல்வி')}
           </h1>
           <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>{myScore >= opponentScore ? t('You dominated the arena.', 'கலக்கிட்டீங்க!') : t('Train harder and come back.', 'இன்னும் பயிற்சி தேவை.')}</p>
           
           <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 40 }}>
              <div>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 4 }}>Your Score</div>
                 <div style={{ fontSize: '3rem', color: myScore >= opponentScore ? 'var(--neon-green)' : 'var(--text-primary)', fontWeight: 900 }}>{myScore}</div>
              </div>
              <div>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 4 }}>Ramesh_99</div>
                 <div style={{ fontSize: '3rem', color: myScore < opponentScore ? 'var(--neon-red)' : 'var(--text-muted)', fontWeight: 900 }}>{opponentScore}</div>
              </div>
           </div>

           <button className="btn btn-primary" onClick={() => setPhase('lobby')}><Swords size={18}/> {t('Play Again', 'மீண்டும் விளையாடு')}</button>
        </div>
      )}
    </div>
  );
};

export default AgniBattles;
