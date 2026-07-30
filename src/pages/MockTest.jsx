import React, { useState, useEffect } from 'react';
import {
  Trophy, ChevronRight, ChevronLeft, CheckCircle, XCircle,
  Clock, BarChart3, RotateCcw, Zap, Target, AlertCircle, Brain, PenLine
} from 'lucide-react';
import { SAMPLE_QUESTIONS, EXAM_CATEGORIES } from '../data/examData';
import { aiGenerate } from '../services/ai';

const ALL_QUESTIONS = [
  ...SAMPLE_QUESTIONS.neet_physics,
  ...SAMPLE_QUESTIONS.neet_biology,
  ...SAMPLE_QUESTIONS.jee_maths,
  ...SAMPLE_QUESTIONS.aptitude,
];

const EXAM_SETS = {
  neet_physics: { label: 'NEET Physics', questions: SAMPLE_QUESTIONS.neet_physics, color: 'orange', time: 180 },
  neet_biology: { label: 'NEET Biology', questions: SAMPLE_QUESTIONS.neet_biology, color: 'green', time: 180 },
  jee_maths:    { label: 'JEE Mathematics', questions: SAMPLE_QUESTIONS.jee_maths, color: 'blue', time: 180 },
  aptitude:     { label: 'Aptitude & Reasoning', questions: SAMPLE_QUESTIONS.aptitude, color: 'purple', time: 120 },
  full_neet:    { label: 'Full NEET Mock', questions: [...SAMPLE_QUESTIONS.neet_physics, ...SAMPLE_QUESTIONS.neet_biology], color: 'orange', time: 3600 },
  mixed:        { label: 'Mixed Practice', questions: ALL_QUESTIONS, color: 'cyan', time: 600 },
};

const AI_TOPICS = {
  neet: ['Mechanics', 'Thermodynamics', 'Electrochemistry', 'Genetics', 'Cell Biology', 'Organic Chemistry', 'Optics', 'Modern Physics'],
  jee:  ['Calculus', 'Coordinate Geometry', 'Electrostatics', 'Heat & Thermodynamics', 'Chemical Bonding', 'Algebra'],
  upsc: ['Indian Polity', 'Indian Economy', 'History', 'Geography', 'Science & Technology', 'Environment'],
  aptitude: ['Speed & Distance', 'Percentages', 'Profit & Loss', 'Number Series', 'Logical Reasoning', 'Data Interpretation'],
  placement: ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Operating Systems', 'DBMS'],
};

// Parse AI-generated questions from text
const parseAIQuestions = (text) => {
  const questions = [];
  const qBlocks = text.split(/\n(?=Q\d+[.:)]|\d+[.:)])/g).filter(b => b.trim());

  for (const block of qBlocks) {
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length < 5) continue;

    const qLine = lines[0].replace(/^[Q\d]+[.:)]\s*/i, '').trim();
    const options = [];
    let correctIdx = -1;
    let explanation = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const optMatch = line.match(/^([A-Da-d])[.)]\s*(.*)/);
      if (optMatch) {
        options.push(optMatch[2].trim());
      } else if (/^(Answer|Correct|Ans)\s*[=:]\s*/i.test(line)) {
        const letter = line.match(/[A-Da-d]/)?.[0]?.toUpperCase();
        if (letter) correctIdx = letter.charCodeAt(0) - 65;
      } else if (/^(Explanation|Explanation:)/i.test(line)) {
        explanation = lines.slice(i).join(' ').replace(/^Explanation:?\s*/i, '');
        break;
      }
    }

    if (qLine && options.length >= 4 && correctIdx >= 0) {
      questions.push({
        id: Date.now() + Math.random(),
        question: qLine,
        options: options.slice(0, 4),
        correct: correctIdx,
        explanation: explanation || 'Review the concept for this topic.',
        difficulty: 'Medium',
        topic: 'AI Generated',
        aiGenerated: true,
      });
    }
  }
  return questions;
};

const MockTest = ({ lang = 'en' }) => {
  const [phase, setPhase] = useState('select');
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [aiExplanation, setAiExplanation] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  // AI Generator state
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiGenCategory, setAiGenCategory] = useState('neet');
  const [aiGenTopic, setAiGenTopic] = useState('');
  const [aiGenCount, setAiGenCount] = useState(5);
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenError, setAiGenError] = useState('');

  const t = (en, ta) => lang === 'ta' ? ta : en;

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(timer); setTimerActive(false); finishTest(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [timerActive]);

  const startTest = (setKey, customQuestions = null) => {
    const set = customQuestions ? { key: 'ai_gen', label: 'AI Generated Test', questions: customQuestions, color: 'purple', time: customQuestions.length * 90 }
                                : { key: setKey, ...EXAM_SETS[setKey] };
    setSelectedSet(set);
    setAnswers({}); setRevealed({}); setCurrentQ(0);
    setAiExplanation({}); setTimeLeft(set.time);
    setTimerActive(true); setPhase('test');
  };

  const finishTest = () => { setTimerActive(false); setPhase('result'); };
  const selectOption = (qi, oi) => { if (!revealed[qi]) setAnswers(p => ({ ...p, [qi]: oi })); };
  const revealAnswer = (qi) => setRevealed(p => ({ ...p, [qi]: true }));

  const getAIExplanation = async (qi) => {
    if (aiExplanation[qi] || aiLoading[qi]) return;
    const q = selectedSet.questions[qi];
    setAiLoading(p => ({ ...p, [qi]: true }));
    try {
      let result = '';
      await aiGenerate(
        `Exam tutor: Explain this MCQ briefly (3-4 lines, simple language):\nQ: ${q.question}\nCorrect: ${q.options[q.correct]}\nTopic: ${q.topic}\nExplain why correct + why others are wrong.`,
        (_, full) => { result = full; }
      );
      setAiExplanation(p => ({ ...p, [qi]: result }));
    } catch {
      setAiExplanation(p => ({ ...p, [qi]: q.explanation }));
    } finally {
      setAiLoading(p => ({ ...p, [qi]: false }));
    }
  };

  // ── AI QUESTION GENERATOR ──────────────────────────────────────────────────
  const generateAIQuestions = async () => {
    if (!aiGenTopic) { setAiGenError(t('Please select a topic', 'தலைப்பை தேர்ந்தெடுக்கவும்')); return; }
    setAiGenLoading(true); setAiGenError('');
    const langInstruction = lang === 'ta' ? 'Write the questions in Tamil-English mix (Tanglish). Question in Tamil but options and explanation in English.' : 'Write in clear English.';
    const prompt = `You are an expert exam question setter for Indian competitive exams.
Generate exactly ${aiGenCount} multiple choice questions (MCQs) on the topic: "${aiGenTopic}" for ${aiGenCategory.toUpperCase()} exam.

${langInstruction}

Format EXACTLY like this for each question:
Q1. [Question text here]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
Answer: [Correct letter, e.g. A]
Explanation: [Brief explanation]

Generate all ${aiGenCount} questions now:`;

    try {
      let raw = '';
      await aiGenerate(prompt, (_, full) => { raw = full; });
      const parsed = parseAIQuestions(raw);
      if (parsed.length === 0) {
        setAiGenError(t('Could not parse questions. Try again.', 'கேள்விகள் உருவாக்க முடியவில்லை. மீண்டும் முயலவும்.'));
      } else {
        setShowAIGen(false);
        startTest(null, parsed);
      }
    } catch (err) {
      setAiGenError(`Error: ${err.message} — ${t('AI service error. Please try again.', 'AI சேவை பிழை. மீண்டும் முயலவும்.')}`);
    } finally {
      setAiGenLoading(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const getScore = () => {
    if (!selectedSet) return { correct: 0, wrong: 0, skipped: 0, score: 0, total: 0, maxScore: 0 };
    const total = selectedSet.questions.length;
    let correct = 0, wrong = 0;
    selectedSet.questions.forEach((q, i) => {
      if (answers[i] === undefined) return;
      if (answers[i] === q.correct) correct++;
      else wrong++;
    });
    return { correct, wrong, skipped: total - correct - wrong, score: correct * 4 - wrong, total, maxScore: total * 4 };
  };

  // ── SELECT PHASE ──────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">{t('Mock Test Center', 'பயிற்சி தேர்வு மையம்')}</div>
            <div className="section-desc">{t('Test your preparation with timed, exam-pattern practice sets', 'நேரமுள்ள தேர்வு தொகுப்புகளில் உங்கள் தயாரிப்பை சோதியுங்கள்')}</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAIGen(true)}>
            <Brain size={16} /> {t('AI Generate Questions', 'AI கேள்விகள் உருவாக்கு')}
          </button>
        </div>

        {/* AI Question Generator Modal */}
        {showAIGen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Brain size={18} color="var(--neon-purple)" /> {t('AI Question Generator', 'AI கேள்வி உருவாக்கி')}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowAIGen(false); setAiGenError(''); }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">{t('Exam Category', 'தேர்வு வகை')}</label>
                  <select className="input" value={aiGenCategory} onChange={e => { setAiGenCategory(e.target.value); setAiGenTopic(''); }}>
                    <option value="neet">NEET</option>
                    <option value="jee">JEE</option>
                    <option value="upsc">UPSC / TNPSC</option>
                    <option value="aptitude">Aptitude & Reasoning</option>
                    <option value="placement">DSA / Placement</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">{t('Topic', 'தலைப்பு')}</label>
                  <select className="input" value={aiGenTopic} onChange={e => setAiGenTopic(e.target.value)}>
                    <option value="">{t('-- Select topic --', '-- தலைப்பை தேர்ந்தெடு --')}</option>
                    {(AI_TOPICS[aiGenCategory] || []).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div style={{ marginTop: 6 }}>
                    <input className="input" placeholder={t('Or type a custom topic...', 'அல்லது தனிப்பட்ட தலைப்பை உள்ளிடுங்கள்...')}
                      value={aiGenTopic} onChange={e => setAiGenTopic(e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">{t('Number of Questions', 'கேள்விகளின் எண்ணிக்கை')}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[3, 5, 10].map(n => (
                      <button key={n} onClick={() => setAiGenCount(n)}
                        style={{
                          flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${aiGenCount === n ? 'rgba(168,85,247,0.5)' : 'var(--border)'}`,
                          background: aiGenCount === n ? 'rgba(168,85,247,0.12)' : 'var(--bg-input)',
                          color: aiGenCount === n ? 'var(--neon-purple)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {aiGenError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--neon-red)' }}>
                    {aiGenError}
                  </div>
                )}

                <button className="btn btn-purple btn-lg" style={{ width: '100%' }} onClick={generateAIQuestions} disabled={aiGenLoading || !aiGenTopic}>
                  {aiGenLoading
                    ? <><div className="spinner" style={{ width: 18, height: 18 }} /> {t('AI Generating Questions...', 'AI கேள்விகள் உருவாக்குகிறது...')}</>
                    : <><Brain size={18} /> {t('Generate & Start Test', 'உருவாக்கி தேர்வு தொடங்கு')}</>}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {t('Powered by AGNI AI Engine', 'AGNI AI இயந்திரத்தால் இயக்கப்படுகிறது')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid-3">
          {Object.entries(EXAM_SETS).map(([key, set]) => (
            <div key={key} className={`card card-glow-${set.color}`} style={{ cursor: 'pointer' }}
              onClick={() => startTest(key)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span className={`badge badge-${set.color === 'cyan' ? 'cyan' : set.color === 'green' ? 'green' : set.color === 'blue' ? 'blue' : set.color === 'purple' ? 'purple' : 'orange'}`}>
                  {set.questions.length} {t('Questions', 'கேள்விகள்')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <Clock size={13} /> {Math.floor(set.time / 60)} min
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{set.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                +4 {t('correct', 'சரி')} / -1 {t('wrong', 'தவறு')} • {t('Timed test', 'நேர தேர்வு')}
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Zap size={14} /> {t('Start Test', 'தேர்வு தொடங்கு')}
              </button>
            </div>
          ))}

          {/* AI Generate Card */}
          <div className="card card-glow-purple" style={{ cursor: 'pointer', border: '1px dashed rgba(168,85,247,0.4)' }}
            onClick={() => setShowAIGen(true)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="badge badge-purple">AI</span>
              <Brain size={16} color="var(--neon-purple)" />
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {t('AI Custom Test', 'AI தனிப்பட்ட தேர்வு')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {t('AI generates fresh questions on any topic you choose', 'உங்கள் விருப்பமான தலைப்பில் AI புதிய கேள்விகள் உருவாக்கும்')}
            </div>
            <button className="btn btn-purple btn-sm" style={{ width: '100%' }}>
              <Brain size={14} /> {t('Generate with AI', 'AI உருவாக்கு')}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--neon-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.9rem' }}>
                {t('Exam Instructions', 'தேர்வு வழிமுறைகள்')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {t(
                  '• Each correct answer = +4 marks. Wrong answer = -1 mark (negative marking).\n• Skipped questions = 0 marks (safe to skip if unsure)\n• AI explanation available for each question after revealing',
                  '• சரியான பதில் = +4 மதிப்பெண்கள். தவறான பதில் = -1 மதிப்பெண் (எதிர்மறை மதிப்பீடு).\n• தவிர்க்கப்பட்ட கேள்விகள் = 0 மதிப்பெண்கள்\n• விடை காட்டிய பிறகு AI விளக்கம் கிடைக்கும்'
                ).split('\n').map((line,i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TEST PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'test') {
    const q = selectedSet.questions[currentQ];
    const isRevealed = revealed[currentQ];
    const totalQ = selectedSet.questions.length;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedSet.label}
              {selectedSet.key === 'ai_gen' && <span className="badge badge-purple" style={{ marginLeft: 8 }}>AI Generated</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t('Question', 'கேள்வி')} {currentQ + 1} / {totalQ}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            background: timeLeft < 60 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${timeLeft < 60 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.2)'}`,
            borderRadius: 20,
          }}>
            <Clock size={16} color={timeLeft < 60 ? 'var(--neon-red)' : 'var(--neon-green)'} />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: timeLeft < 60 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={finishTest}>{t('Submit Test', 'தேர்வு சமர்ப்பி')}</button>
        </div>

        <div className="progress-wrap" style={{ marginBottom: 20 }}>
          <div className="progress-fill progress-orange" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} />
        </div>

        <div className="card card-glow-orange" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--neon-primary)', flexShrink: 0,
            }}>Q{currentQ + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-orange">{q.topic}</span>
                <span className={`badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{q.difficulty}</span>
                {q.aiGenerated && <span className="badge badge-purple">AI</span>}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.question}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oi) => {
              let cls = 'quiz-option';
              if (isRevealed) {
                if (oi === q.correct) cls += ' correct';
                else if (oi === answers[currentQ] && oi !== q.correct) cls += ' wrong';
              } else if (answers[currentQ] === oi) cls += ' selected';
              return (
                <button key={oi} className={cls} onClick={() => selectOption(currentQ, oi)}
                  style={{ cursor: isRevealed ? 'default' : 'pointer' }}>
                  <div className="option-letter">{String.fromCharCode(65 + oi)}</div>
                  <span>{opt}</span>
                  {isRevealed && oi === q.correct && <CheckCircle size={16} color="var(--neon-green)" style={{ marginLeft: 'auto' }} />}
                  {isRevealed && oi === answers[currentQ] && oi !== q.correct && <XCircle size={16} color="var(--neon-red)" style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>

          {!isRevealed && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => revealAnswer(currentQ)}>
              <CheckCircle size={14} /> {t('Reveal Answer', 'விடை காட்டு')}
            </button>
          )}

          {isRevealed && (
            <div style={{ marginTop: 14 }}>
              <div style={{ padding: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--neon-green)', marginBottom: 6 }}>
                  {t('EXPLANATION', 'விளக்கம்')}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {aiExplanation[currentQ] || q.explanation}
                </p>
              </div>
              {!aiExplanation[currentQ] && (
                <button className="btn btn-blue btn-sm" onClick={() => getAIExplanation(currentQ)} disabled={aiLoading[currentQ]}>
                  {aiLoading[currentQ] ? <><div className="spinner" style={{ width: 14, height: 14 }} /> {t('Generating...', 'உருவாக்குகிறது...')}</> : <><Zap size={14} /> {t('AI Deep Explanation', 'AI ஆழமான விளக்கம்')}</>}
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}>
            <ChevronLeft size={16} /> {t('Prev', 'முன்பு')}
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {selectedSet.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} style={{
                width: 28, height: 28, borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                background: i === currentQ ? 'var(--neon-primary)' : revealed[i] ? (answers[i] === selectedSet.questions[i].correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') : answers[i] !== undefined ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)',
                color: i === currentQ ? '#fff' : 'var(--text-secondary)',
              }}>{i + 1}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCurrentQ(p => Math.min(totalQ - 1, p + 1))} disabled={currentQ === totalQ - 1}>
            {t('Next', 'அடுத்து')} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ──────────────────────────────────────────────────────────
  if (phase === 'result') {
    const { correct, wrong, skipped, score, total, maxScore } = getScore();
    const pct = Math.round((correct / total) * 100);
    return (
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">{t('Test Results', 'தேர்வு முடிவுகள்')}</div>
            <div className="section-desc">{selectedSet.label}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPhase('select')}><RotateCcw size={14} /> {t('New Test', 'புதிய தேர்வு')}</button>
            <button className="btn btn-primary btn-sm" onClick={() => startTest(selectedSet.key)}><Zap size={14} /> {t('Retry', 'மீண்டும் முயல்')}</button>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: t('Score', 'மதிப்பெண்'), value: `${score}/${maxScore}`, color: 'var(--neon-primary)', bg: 'rgba(249,115,22,0.12)' },
            { label: t('Correct', 'சரி'), value: correct, color: 'var(--neon-green)', bg: 'rgba(16,185,129,0.12)' },
            { label: t('Wrong', 'தவறு'), value: wrong, color: 'var(--neon-red)', bg: 'rgba(239,68,68,0.12)' },
            { label: t('Skipped', 'தவிர்க்கப்பட்டது'), value: skipped, color: 'var(--neon-blue)', bg: 'rgba(59,130,246,0.12)' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon-wrap" style={{ background: s.bg }}><BarChart3 size={20} color={s.color} /></div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card card-glow-orange" style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '3rem', fontFamily: 'var(--font-head)', fontWeight: 800, color: pct >= 70 ? 'var(--neon-green)' : pct >= 50 ? 'var(--neon-primary)' : 'var(--neon-red)' }}>
            {pct}%
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>
            {pct >= 80 ? t('Excellent! You are ready!', 'அருமை! நீங்கள் தயாராக இருக்கிறீர்கள்!')
              : pct >= 60 ? t('Good! Keep improving!', 'நல்லது! தொடர்ந்து முன்னேறுங்கள்!')
              : t('Keep practicing! You can do it!', 'தொடர்ந்து பயிற்சி செய்யுங்கள்! உங்களால் முடியும்!')}
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="progress-wrap" style={{ maxWidth: 300, margin: '0 auto' }}>
              <div className={`progress-fill ${pct >= 70 ? 'progress-green' : 'progress-orange'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="section-title" style={{ marginBottom: 14 }}>{t('Review All Questions', 'அனைத்து கேள்விகளையும் மதிப்பாய்வு செய்யுங்கள்')}</div>
        {selectedSet.questions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correct;
          const isSkipped = userAns === undefined;
          return (
            <div key={i} className="card" style={{ marginBottom: 12, borderColor: isCorrect ? 'rgba(16,185,129,0.2)' : isSkipped ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {isCorrect ? <CheckCircle size={18} color="var(--neon-green)" /> : isSkipped ? <AlertCircle size={18} color="var(--neon-blue)" /> : <XCircle size={18} color="var(--neon-red)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{q.question}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neon-green)' }}>{t('Correct', 'சரியான பதில்')}: {q.options[q.correct]}</div>
                  {!isSkipped && !isCorrect && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--neon-red)' }}>{t('Your answer', 'உங்கள் பதில்')}: {q.options[userAns]}</div>
                  )}
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{q.explanation}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};

export default MockTest;
