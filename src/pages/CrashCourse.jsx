import React, { useState, useEffect, useRef } from 'react';
import {
  Flame, Target, Brain, Zap, CheckCircle, Trophy,
  Calendar, TrendingUp, BookOpen, Star, RefreshCw, Layers, MessageCircle, Send,
  Gamepad2, Wand2, Orbit, ChevronRight, Maximize2, SkipForward, PlayCircle
} from 'lucide-react';
import { ollamaGenerate, ollamaChat } from '../services/ollama';
import { EXAM_SYLLABUS, crashCourseManager } from '../data/crashCourseData';
import ReactMarkdown from 'react-markdown';

const CrashCourse = ({ lang = 'en' }) => {
  const t = (en, ta) => lang === 'ta' ? ta : en;
  const [phase, setPhase] = useState('setup'); // setup | diagnostic | dashboard | flash | review | roadmap | boost | micro
  const [store, setStore] = useState(crashCourseManager.getData());
  const [selectedExam, setSelectedExam] = useState('neet');
  const [userLevel, setUserLevel] = useState('intermediate');

  // Diagnostic state
  const [diagQuestions, setDiagQuestions] = useState([]);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagCurrent, setDiagCurrent] = useState(0);
  const [diagAnswers, setDiagAnswers] = useState({});
  const [diagRevealed, setDiagRevealed] = useState({});

  // Flash / Smart Learning
  const [flashTopic, setFlashTopic] = useState(null);
  const [flashContent, setFlashContent] = useState({}); // { eli5, visual, trick, q }
  const [flashLoading, setFlashLoading] = useState(false);
  const [flashStep, setFlashStep] = useState('learn'); // learn | quiz | feedback | doubt | teach
  const [doubtMessages, setDoubtMessages] = useState([]);
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [teachInput, setTeachInput] = useState('');
  const [teachFeedback, setTeachFeedback] = useState('');
  const [teachLoading, setTeachLoading] = useState(false);
  const doubtEndRef = useRef(null);

  // Daily plan state
  const [dailyPlan, setDailyPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  // Morning Review (Spaced Repetition) State
  const [reviewTopics, setReviewTopics] = useState([]);
  const [reviewCurrent, setReviewCurrent] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewQ, setReviewQ] = useState(null);

  useEffect(() => {
    const data = crashCourseManager.getData();
    setStore(data);
    if (data.exam && data.diagnosticDone) setPhase('dashboard');
    else if (data.exam) setPhase('diagnostic');
  }, []);

  useEffect(() => {
    if (flashStep === 'doubt') doubtEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [doubtMessages, flashStep]);

  const refresh = () => setStore(crashCourseManager.getData());

  const getAllTopics = (exam) => {
    const syllabus = EXAM_SYLLABUS[exam];
    if (!syllabus) return [];
    const topics = [];
    Object.values(syllabus.subjects).forEach(sub => {
      sub.topics.forEach(tp => topics.push({ ...tp, subject: sub.label }));
    });
    return topics;
  };

  // ── SETUP ──────────────────────────────────────────────────────────────────
  const startCrashCourse = () => {
    crashCourseManager.init(selectedExam, userLevel);
    setStore(crashCourseManager.getData());
    if (userLevel === 'beginner') {
       crashCourseManager.saveDiagnostic({});
       refresh();
       setPhase('dashboard');
    } else {
       generateDiagnostic(selectedExam);
    }
  };

  // ── DIAGNOSTIC TEST ────────────────────────────────────────────────────────
  // (Simplified diagnostic generation to save space, keeping core logic)
  const generateDiagnostic = async (exam) => {
    setDiagLoading(true); setPhase('diagnostic');
    const topics = getAllTopics(exam);
    const selected = topics.sort(() => 0.5 - Math.random()).slice(0, 15);
    const questions = selected.map((tp, i) => ({
      id: i, question: `Self-assess: Rate your knowledge of "${tp.name}" (${tp.subject})`,
      options: ['I know nothing', 'I know basics', 'I\'m decent', 'I\'m confident'],
      correct: -1, topic: tp.name, topicId: tp.id, difficulty: 'Self', isSelfAssess: true,
    }));
    setDiagQuestions(questions);
    setDiagLoading(false);
  };

  const handleDiagAnswer = (qi, oi) => {
    if (diagRevealed[qi]) return;
    setDiagAnswers(p => ({ ...p, [qi]: oi }));
  };

  const finishDiagnostic = () => {
    const topicScores = {};
    diagQuestions.forEach((q, i) => {
      const ans = diagAnswers[i];
      topicScores[q.topicId] = ans === 3 ? 80 : ans === 2 ? 55 : ans === 1 ? 30 : 10;
    });
    crashCourseManager.saveDiagnostic(topicScores);
    refresh();
    setPhase('dashboard');
  };

  // ── 30-DAY SMART LEARNING SYSTEM (FLASH LEARNING) ──────────────────────────
  const startFlashLearn = async (topicId) => {
    const allTopics = getAllTopics(store.exam);
    const topic = allTopics.find(t => t.id === topicId);
    if (!topic) return;
    setFlashTopic(topic);
    setFlashStep('learn');
    setFlashLoading(true); setTeachInput(''); setTeachFeedback('');
    setPhase('flash');

    const langInst = lang === 'ta' ? 'Explain in Tamil-English mix. Use super simple Tamil.' : 'Use super simple English.';
    
    // THE 30-DAY GAME CHANGER PROMPT: ELI5 + Visual + Memory Trick + MCQ
    const prompt = `You are the ultimate AI private tutor for ${EXAM_SYLLABUS[store.exam]?.label}. ${langInst}
Teach the concept "${topic.name}". Make it incredible.

Format exactly like this with these tags:
<ELI5>
Provide an "Explain Like I'm 5" analogy. E.g. Current = water flowing through a pipe. Make it 2-3 lines.
</ELI5>

<VISUAL>
Provide a very short ASCII mind map or flow chart representing the core concept.
</VISUAL>

<TRICK>
Provide a funny or clever mnemonic/shortcut to remember the formula or concept.
</TRICK>

<QUIZ>
Q. [Create 1 MCQ testing the concept]
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [A/B/C/D]
Explanation: [Why this is correct]
</QUIZ>`;

    try {
      let result = '';
      await ollamaGenerate(prompt, (_, full) => { result = full; });
      
      const parts = { eli5: '', visual: '', trick: '', q: null };
      
      const extract = (tag) => {
         const m = result.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
         return m ? m[1].trim() : '';
      };
      
      parts.eli5 = extract('ELI5') || result;
      parts.visual = extract('VISUAL');
      parts.trick = extract('TRICK');
      
      const quizBlock = extract('QUIZ');
      if (quizBlock) {
        const lines = quizBlock.split('\n').filter(l => l.trim());
        const qText = lines[0]?.replace(/^Q[.\d]*\s*/, '').trim();
        const opts = [];
        let correct = -1, explanation = '';
        for (const line of lines) {
          const om = line.trim().match(/^([A-D])[.)]\s*(.*)/);
          if (om) opts.push(om[2]);
          const am = line.trim().match(/^Answer:\s*([A-D])/i);
          if (am) correct = am[1].charCodeAt(0) - 65;
          const em = line.trim().match(/^Explanation:\s*(.*)/i);
          if (em) explanation = em[1];
        }
        if (qText && opts.length >= 4 && correct >= 0) {
          parts.q = { question: qText, options: opts.slice(0, 4), correct, explanation };
        }
      }
      setFlashContent(parts);
    } catch (err) {
      setFlashContent({ eli5: `Error: ${err.message}` });
    }
    setFlashLoading(false);
  };

  const handleFlashAnswer = async (oi) => {
    if (!flashContent.q) return;
    const correct = oi === flashContent.q.correct;
    crashCourseManager.recordAnswer(flashTopic.id, correct);
    refresh();
    
    if (correct) {
      setFlashStep('teach'); // Move to teach back mode if correct!
    } else {
      setFlashStep('feedback');
      setFlashLoading(true);
      try {
        let result = '';
        await ollamaGenerate(
          `A student got this wrong: Q: ${flashContent.q.question}
Correct answer: ${flashContent.q.options[flashContent.q.correct]}
Explain why gently like a teacher in 2 lines. ${lang === 'ta' ? 'Use Tamil.' : ''}`, (_, full) => { result = full; });
        setTeachFeedback(result);
      } catch { setTeachFeedback(flashContent.q.explanation || 'Review this again.'); }
      setFlashLoading(false);
    }
  };

  const submitTeachBack = async () => {
    if (!teachInput.trim() || teachLoading) return;
    setTeachLoading(true);
    try {
       let result = '';
       await ollamaGenerate(
          `You taught the student about "${flashTopic.name}".
The student is trying to teach it back to you to prove they learned it.
Student says: "${teachInput}"
Evaluate their understanding. If it's mostly correct, say "🔥 Brilliant!" and add 1 sentence to refine it.
If completely wrong, correct them gently. ${lang === 'ta' ? 'Use Tamil.' : ''}`, (_, full) => { result = full; });
       setTeachFeedback(result);
       crashCourseManager.addXP(40); // Gamification: +40 XP for teaching back
       refresh();
    } catch { setTeachFeedback("Good effort! You've earned XP!"); }
    setTeachLoading(false);
  };

  // ── DAILY PLAN GENERATION ──────────────────────────────────────────────────
  const generateDailyPlan = async () => {
    setPlanLoading(true);
    const weakNames = getAllTopics(store.exam).filter(t => (store.topicScores?.[t.id] || 0) < 50).slice(0, 5).map(t => t.name).join(', ');
    const day = store.day || 1;
    
    try {
      let result = '';
      await ollamaGenerate(
        `Create DAY ${day} Crash Course schedule for ${EXAM_SYLLABUS[store.exam]?.label}. ${lang === 'ta' ? 'Use Tamil.' : 'In English'}
Focus on: ${weakNames || 'Important topics'}
Output strictly:
🌟 MORNING (6AM-9AM): [Task]
⚡ AFTERNOON: [Task]
📚 EVENING: [Task]
🧠 NIGHT: [Task]`, (_, full) => { result = full; });
      setDailyPlan(result);
    } catch (err) { setDailyPlan(`Error: ${err.message}`); }
    setPlanLoading(false);
  };

  // ── MORNING REVIEW (SPACED REPETITION) ───────────────────────────────────
  const startMorningReview = async () => {
    const queue = store.spacedQueue || [];
    const pending = queue.filter(q => q.dueDay <= (store.day || 1));
    if (pending.length === 0) { setPhase('dashboard'); return; }
    setReviewTopics(pending); setReviewCurrent(0); setPhase('review');
    await loadReviewQuestion(pending[0].topicId);
  };

  const loadReviewQuestion = async (topicId) => {
    setReviewLoading(true); setReviewQ(null);
    const topic = getAllTopics(store.exam).find(t => t.id === topicId);
    if (!topic) { setReviewLoading(false); return; }

    try {
      let raw = '';
      await ollamaGenerate(`Generate ONE MCQ on "${topic.name}". Format: Q. \nA) \nB) \nC) \nD) \nAnswer: A`, (_, full) => { raw = full; });
      const lines = raw.split('\n').filter(l => l.trim());
      const qText = lines[0]?.replace(/^Q[.\d]*\s*/, '').trim();
      const opts = []; let correct = -1;
      for (const line of lines) {
        const om = line.trim().match(/^([A-D])[.)]\s*(.*)/); if (om) opts.push(om[2]);
        const am = line.trim().match(/^Answer:\s*([A-D])/i); if (am) correct = am[1].charCodeAt(0) - 65;
      }
      if (qText && opts.length >= 4 && correct >= 0) setReviewQ({ question: qText, options: opts.slice(0, 4), correct, topicName: topic.name, topicId: topic.id });
      else setReviewQ({ error: true });
    } catch { setReviewQ({ error: true }); }
    setReviewLoading(false);
  };

  const handleReviewAnswer = (oi) => {
    if (!reviewQ) return;
    crashCourseManager.recordAnswer(reviewQ.topicId, oi === reviewQ.correct);
    crashCourseManager.addXP(20); // Bonus XP for reviewing
    refresh();
    if (reviewCurrent + 1 < reviewTopics.length) {
       setReviewCurrent(p => p + 1); loadReviewQuestion(reviewTopics[reviewCurrent + 1].topicId);
    } else { setPhase('dashboard'); }
  };

  // ── UI HELPERS ─────────────────────────────────────────────────────────────
  const enterFocusMode = () => {
     try { document.documentElement.requestFullscreen(); } catch(e){}
     alert(t('Focus Mode Activated. Do not leave this tab until your task is done!', 'கவனக் குவிப்பு Mode. வேலையை முடிக்கும் வரை இந்த tabs-ஐ மூட வேண்டாம்!'));
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — SETUP & ROADMAP
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'setup' || phase === 'roadmap') {
    return (
      <div>
        {phase === 'setup' ? (
          <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px', background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flame size={36} color="#fff" /></div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{t('30-Day Smart Learning System', '30 நாள் போர் திட்டம்')} 🔥</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 32 }}>{t('Your personal AI teacher with Explain-Like-I\'m-5, Micro Learning, and Gamification.', 'Explain-Like-I\'m-5, நுண் கற்றல் மற்றும் கேமிஃபிகேஷன் கொண்ட உங்கள் தனிப்பட்ட AI ஆசிரியர்.')}</p>

            <div className="input-group" style={{ marginBottom: 20, textAlign: 'left' }}>
              <label className="input-label">{t('Target Exam', 'உங்கள் இலக்கு தேர்வு')}</label>
              <div className="grid-2" style={{ gap: 10 }}>
                {Object.entries(EXAM_SYLLABUS).map(([id, ex]) => (
                  <button key={id} onClick={() => setSelectedExam(id)} style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${selectedExam === id ? 'var(--neon-primary)' : 'var(--border)'}`, color: selectedExam === id ? 'var(--neon-primary)' : 'var(--text-secondary)' }}>{ex.label}</button>
                ))}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 32, textAlign: 'left' }}>
              <label className="input-label">{t('Your Level', 'உங்கள் நிலை')}</label>
              <div className="grid-2" style={{ gap: 10 }}>
                 <button onClick={() => setUserLevel('beginner')} style={{ padding: '14px', borderRadius: 12, border: `1px solid ${userLevel === 'beginner' ? 'var(--neon-blue)' : 'var(--border)'}`, color: userLevel === 'beginner' ? 'var(--neon-blue)' : 'var(--text-secondary)' }}>📚 Beginner</button>
                 <button onClick={() => setUserLevel('intermediate')} style={{ padding: '14px', borderRadius: 12, border: `1px solid ${userLevel === 'intermediate' ? 'var(--neon-green)' : 'var(--border)'}`, color: userLevel === 'intermediate' ? 'var(--neon-green)' : 'var(--text-secondary)' }}>🎯 Intermediate</button>
              </div>
            </div>
            
            <button className="btn btn-secondary btn-lg" style={{ width: '100%', marginBottom: 16 }} onClick={() => setPhase('roadmap')}><BookOpen size={18} /> {t('View 80/20 Roadmap', '80/20 திட்டம் காண்க')}</button>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={startCrashCourse}><Flame size={18} /> {t('Start Challenge', 'தொடங்கு')}</button>
          </div>
        ) : (
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPhase('setup')}>{t('Back', 'திரும்பு')}</button>
            <h2 style={{ marginTop: 20, color: 'var(--text-primary)' }}>{t('High-Yield 80/20 Roadmap', 'High-Yield 80/20 திட்டம்')}</h2>
            <div className="grid-3" style={{ marginTop: 20 }}>
               {getAllTopics(selectedExam).sort((a,b) => b.weight - a.weight).slice(0, 15).map((t, i) => (
                  <div key={i} className="card"><div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{t.name}</div><div style={{ color: 'var(--neon-primary)' }}>{t.weight}% Weightage</div></div>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — DIAGNOSTIC OR REVIEW (Simplified)
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'diagnostic' || phase === 'review') {
      const isReview = phase === 'review';
      const maxQs = isReview ? reviewTopics.length : diagQuestions.length;
      const curQIndex = isReview ? reviewCurrent : diagCurrent;
      const activeQ = isReview ? reviewQ : diagQuestions[diagCurrent];
      
      if ((isReview && reviewLoading) || (!isReview && diagLoading)) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 48, height: 48, margin: '0 auto' }} /></div>;
      if (!activeQ) return null;

      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
             <div className="section-title">{isReview ? t('Morning Active Recall!', 'காலை திருப்புதல்!') : t('Diagnostic Test', 'சோதனை தேர்வு')}</div>
             <div className="section-desc">{t(`Q ${curQIndex + 1}/${maxQs}`, `கேள்வி ${curQIndex + 1}/${maxQs}`)}</div>
          </div>
          <div className="card card-glow-orange">
             <span className="badge badge-orange" style={{ marginBottom: 10 }}>{isReview ? activeQ.topicName : activeQ.topic}</span>
             <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>{activeQ.question}</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {activeQ.options.map((opt, oi) => {
                    let cls = 'quiz-option';
                    if (!isReview && diagAnswers[diagCurrent] === oi) cls += ' selected';
                    return <button key={oi} className={cls} onClick={() => isReview ? handleReviewAnswer(oi) : handleDiagAnswer(diagCurrent, oi)}><div className="option-letter">{String.fromCharCode(65 + oi)}</div><span>{opt}</span></button>;
                 })}
             </div>
             {!isReview && <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} disabled={diagCurrent === 0} onClick={() => setDiagCurrent(p=>p-1)}>Prev</button>}
             {!isReview && <button className="btn btn-primary btn-sm" style={{ marginTop: 12, marginLeft: 8 }} onClick={() => curQIndex >= maxQs - 1 ? finishDiagnostic() : setDiagCurrent(p=>p+1)}>{curQIndex >= maxQs - 1 ? 'Finish' : 'Next'}</button>}
          </div>
        </div>
      );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — FLASH LEARNING (Gamified Flow)
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'flash') {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPhase('dashboard')}>← {t('Back', 'திரும்பு')}</button>
          <div style={{ display: 'flex', gap: 8 }}>
             <span className="badge badge-purple"><Gamepad2 size={12} style={{marginRight: 4}}/> +XP Mode</span>
             <button className="btn btn-secondary btn-sm" onClick={enterFocusMode}><Maximize2 size={14} /></button>
          </div>
        </div>

        {flashLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}><Wand2 size={40} color="var(--neon-blue)" style={{ margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} /> <div style={{ color: 'var(--text-primary)' }}>{t('AI is generating ELI5 concepts & shortcuts...', 'AI குறுங்கற்றலை உருவாக்குகிறது...')}</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* ELI5 Concept */}
            <div className="card card-glow-blue" style={{ borderLeft: '4px solid var(--neon-blue)' }}>
              <div style={{ fontWeight: 800, color: 'var(--neon-blue)', fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Orbit size={16} /> {t('EXPLAIN LIKE I\'M 5 (ELI5)', 'எளிமையான விளக்கம் (ELI5)')}</div>
              <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>{flashContent.eli5}</div>
            </div>

            {/* Visual & Tricks */}
            <div className="grid-2" style={{ gap: 20 }}>
               {flashContent.visual && (
                 <div className="card" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--neon-cyan)', fontSize: '0.85rem', marginBottom: 10 }}>📊 VISUAL MAP</div>
                    <pre style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflowX: 'auto' }}>{flashContent.visual}</pre>
                 </div>
               )}
               {flashContent.trick && (
                 <div className="card card-glow-green" style={{ background: 'rgba(16,185,129,0.05)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--neon-green)', fontSize: '0.85rem', marginBottom: 10 }}>💡 MEMORY TRICK</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{flashContent.trick}"</div>
                 </div>
               )}
            </div>

            {/* MCQ Quiz */}
            {flashContent.q && flashStep === 'learn' && (
              <div className="card card-glow-orange" style={{ borderLeft: '4px solid var(--neon-orange)' }}>
                <div style={{ fontWeight: 800, color: 'var(--neon-primary)', fontSize: '0.85rem', marginBottom: 12 }}>❓ {t('KNOWLEDGE CHECK', 'அறிவு சோதனை')}</div>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>{flashContent.q.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {flashContent.q.options.map((opt, oi) => (
                    <button key={oi} className="quiz-option" onClick={() => handleFlashAnswer(oi)}>
                      <div className="option-letter">{String.fromCharCode(65 + oi)}</div><span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {flashStep === 'feedback' && (
              <div className="card card-glow-red">
                 <div style={{ fontWeight: 700, color: 'var(--neon-red)', marginBottom: 8 }}>{t('Oops! Let\'s fix that.', 'தவறு! திருத்திக்கொள்வோம்.')}</div>
                 <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{teachFeedback}</div>
                 <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setPhase('dashboard')}>{t('Back to Dashboard', 'டாஷ்போர்டுக்கு திரும்பு')}</button>
              </div>
            )}

            {/* Teach Back Method (!) */}
            {flashStep === 'teach' && (
              <div className="card card-glow-purple" style={{ border: '2px dashed rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.05)' }}>
                 <div style={{ fontWeight: 800, color: 'var(--neon-purple)', fontSize: '1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><MessageCircle size={18} /> {t('TEACH BACK MODE 🔥', 'நீங்களே கற்பியுங்கள் 🔥')}</div>
                 <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t('You got it right! To lock it in your memory forever, explain what you just learned in your own words below. AI will evaluate you.', 'சரியான பதில்! இதை நிரந்தரமாக நினைவில் வைக்க, நீங்கள் கற்றுக்கொண்டதை நீங்களே விளக்குங்கள்.')}</p>
                 
                 <div className="input-group">
                    <textarea className="input-field" rows={3} placeholder={t("So basically, this concept means...", "அதாவது இந்த கான்செப்ட் என்னவென்றால்...")} value={teachInput} onChange={e=>setTeachInput(e.target.value)} disabled={teachLoading} />
                 </div>
                 
                 {teachFeedback ? (
                    <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: 'var(--neon-green)', fontWeight: 600 }}>{teachFeedback}</div>
                 ) : (
                    <button className="btn btn-purple" style={{ marginTop: 12 }} onClick={submitTeachBack} disabled={teachLoading || !teachInput.trim()}>
                       {teachLoading ? 'Evaluating...' : t('Submit & Earn 40 XP', 'சமர்ப்பித்து 40 XP பெறுக')}
                    </button>
                 )}
                 {teachFeedback && <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setPhase('dashboard')}>{t('Awesome! Return to Dashboard', 'டாஷ்போர்டுக்கு திரும்பு')}</button>}
              </div>
            )}

          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER — DASHBOARD (With Gamification & Tools)
  // ══════════════════════════════════════════════════════════════════════════
  const allTopics = getAllTopics(store.exam || 'neet');
  const weakTopics = allTopics.filter(t => (store.topicScores?.[t.id] || 0) < 50);
  const xp = store.xp || 0;
  const level = store.playerLevel || 1;
  const xpNeeded = level * 100;
  const xpPercent = (xp % 100) / 100 * 100;

  return (
    <div>
      {/* Top Gamification Bar */}
      <div className="card" style={{ padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, background: 'linear-gradient(90deg, rgba(249,115,22,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(249,115,22,0.3)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--neon-primary)', color: '#000', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>{level}</div>
            <div>
               <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{t('Level', 'நிலை')} {level} Scholar</div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{xp} Total XP</div>
            </div>
         </div>
         <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
               <span>{xp % 100} XP</span><span>{100 - (xp % 100)} XP to Next Level</span>
            </div>
            <div className="progress-wrap" style={{ height: 6 }}><div className="progress-fill progress-orange" style={{ width: `${xpPercent}%` }} /></div>
         </div>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={enterFocusMode}><Maximize2 size={14}/> {t('Focus Mode', 'கவனக் குவிப்பு')}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => startMorningReview()}>
               <RefreshCw size={14}/> {t('Revise', 'திருப்புதல்')} {(store.spacedQueue || []).filter(q => q.dueDay <= (store.day || 1)).length > 0 && <span style={{ color: 'var(--neon-green)', fontWeight: 700, marginLeft: 4 }}>•</span>}
            </button>
         </div>
      </div>

      <div className="grid-3" style={{ gap: 20, marginBottom: 20 }}>
         {/* Weakness Radar */}
         <div className="card card-glow-red" style={{ flex: 1, minHeight: 400 }}>
             <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Target size={16} color="var(--neon-red)" /> {t('Attack List (80/20)', 'தாக்க வேண்டிய பட்டியல்')}
             </div>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t('Master these to level up fast!', 'இவற்றை கற்றால் விரைவாக Level-UP! (Micro-Learning Mode)')}</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weakTopics.slice(0, 6).map(tp => (
                   <div key={tp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tp.name}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--neon-red)', fontWeight: 700 }}>{store.topicScores?.[tp.id] || 0}%</span>
                      <button className="btn btn-primary btn-sm" style={{ padding: '6px 10px' }} onClick={() => startFlashLearn(tp.id)}>
                        <Brain size={12} /> {t('ELI5 Learn', 'கற்று')}
                      </button>
                   </div>
                ))}
             </div>
         </div>

         {/* Daily Battle Plan */}
         <div className="card card-glow-blue" style={{ flex: 1, minHeight: 400 }}>
             <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--neon-blue)" /> {t(`Day ${store.day || 1} Battle Plan`, `நாள் ${store.day || 1} போர் திட்டம்`)}
             </div>
             {dailyPlan ? (
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{dailyPlan}</div>
             ) : (
               <div style={{ textAlign: 'center', paddingTop: 40 }}>
                 <p style={{ color: 'var(--text-muted)', marginBottom: 14, fontSize: '0.85rem' }}>{t('Generate structured daily timetable focusing entirely on weak areas.', 'உங்கள் பலவீனங்களை மட்டுமே வைத்து தினசரி அட்டவணை உருவாக்கவும்.')}</p>
                 <button className="btn btn-primary" onClick={generateDailyPlan} disabled={planLoading}>
                   {planLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Generate...</> : 'Generate Today\'s Plan'}
                 </button>
               </div>
             )}
         </div>

         {/* 5-Min Power Boost & Badges */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 400 }}>
            <div className="card card-glow-purple" style={{ textAlign: 'center', padding: '30px 20px', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))' }}>
               <Zap size={36} color="var(--neon-purple)" style={{ margin: '0 auto 12px' }} />
               <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: 8 }}>{t('5-Minute Boost Mode', '5-நிமிட Power Boost')}</div>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t('No time? Take a rapid 10-question AI quiz to earn massive XP instantly.', 'நேரம் இல்லையா? 10-கேள்விகள் கொண்ட அதிவேக AI தேர்வு எழுதி அதிக XP பெறுங்கள்.')}</p>
               <button className="btn btn-purple" style={{ width: '100%' }} onClick={() => startFlashLearn(weakTopics[0]?.id)}> {/* Using FlashLearn as a proxy for now */}
                 <PlayCircle size={16} /> {t('Start Quick Boost', 'தொடங்கு')}
               </button>
            </div>

            <div className="card" style={{ flex: 1 }}>
               <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--neon-cyan)', marginBottom: 12 }}><Star size={14}/> {t('Achievements', 'சாதனைகள்')}</div>
               {(store.badges || []).length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('No badges yet. Keep learning!', 'சாதனைகள் இல்லை. தொடர்ந்து பயிலுங்கள்!')}</div>
               ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                     {store.badges.map((b, i) => <span key={i} className="badge badge-blue">🏆 {b}</span>)}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default CrashCourse;
