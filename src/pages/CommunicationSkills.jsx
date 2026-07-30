import React, { useState } from 'react';
import { Mic, MessageSquare, CheckCircle, RotateCcw, Volume2, Brain, Star, Users } from 'lucide-react';
import { ollamaGenerate } from '../services/ollama';

const HR_QUESTIONS = [
  "Tell me about yourself.",
  "What are your strengths and weaknesses?",
  "Why do you want to join our company?",
  "Where do you see yourself in 5 years?",
  "Describe a challenge you faced and how you overcame it.",
  "What do you know about TCS / Infosys / Wipro?",
  "How do you handle pressure and tight deadlines?",
  "What is your greatest achievement?",
  "Why should we hire you?",
  "Do you prefer working in a team or individually?",
];

const GD_TOPICS = [
  "Artificial Intelligence: Boon or Bane for India?",
  "Should coding be mandatory in school curriculum?",
  "Climate change: Government duty or individual responsibility?",
  "Work from home vs Office: Which is better?",
  "Social media influence on youth: Positive or Negative?",
  "India's startup ecosystem: Opportunities and Challenges",
  "Electric vehicles: Are we ready?",
  "Reservation system in India: Need reform?",
];

const ESSAY_TOPICS = [
  "Digital India: Progress and Challenges",
  "Role of Education in Nation Building",
  "India's Growing Middle Class",
  "Environmental Sustainability vs Economic Growth",
  "Youth and Democracy in India",
];

const CommunicationSkills = () => {
  const [activeFeature, setActiveFeature] = useState('hr');
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [essayTopic, setEssayTopic] = useState(0);

  const features = [
    { id: 'hr', label: 'HR Interview Practice', icon: MessageSquare, color: 'orange' },
    { id: 'gd', label: 'Group Discussion', icon: Users, color: 'blue' },
    { id: 'essay', label: 'Essay Writing (UPSC)', icon: Brain, color: 'purple' },
    { id: 'spoken', label: 'Spoken English', icon: Mic, color: 'green' },
  ];

  const getHRFeedback = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setAiFeedback('');
    try {
      let result = '';
      await ollamaGenerate(
        `You are a professional HR interview coach at a top IT company. Evaluate this answer:

Question: "${HR_QUESTIONS[currentQ]}"
Candidate's Answer: "${userAnswer}"

Provide feedback in this format:
1. **Score**: X/10
2. **What's Good**: (specific positives)
3. **What to Improve**: (specific areas)  
4. **Suggested Better Answer**: (a polished high-scoring version)
5. **Tip**: (one golden tip for this type of question)

Be honest but encouraging. Use simple English.`,
        (_, full) => { result = full; }
      );
      setAiFeedback(result);
    } catch (err) {
      setAiFeedback(`Error: ${err.message}. Please ensure Ollama is running.`);
    }
    setLoading(false);
  };

  const getEssayFeedback = async () => {
    if (!essayText.trim()) return;
    setLoading(true);
    setAiFeedback('');
    try {
      let result = '';
      await ollamaGenerate(
        `You are a UPSC essay coach. Evaluate this essay written by an IAS aspirant:

Topic: "${ESSAY_TOPICS[essayTopic]}"
Essay: "${essayText}"

Provide UPSC-style evaluation:
1. **Total Score**: X/250 (UPSC standard)
2. **Introduction Quality**: Comment
3. **Content & Analysis**: Comment
4. **Language & Expression**: Comment
5. **Structure & Flow**: Comment
6. **Conclusion**: Comment
7. **Key Suggestions for improvement**

Be detailed and UPSC-specific.`,
        (_, full) => { result = full; }
      );
      setAiFeedback(result);
    } catch (err) {
      setAiFeedback(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const getGDPoints = async (topic) => {
    setLoading(true);
    setAiFeedback('');
    try {
      let result = '';
      await ollamaGenerate(
        `Prepare a Group Discussion guide for the topic: "${topic}"

Include:
1. **Opening Statement** (impactful 30-second opener)
2. **Key Points FOR** (3-4 strong arguments with examples)
3. **Key Points AGAINST** (2-3 counter-arguments)
4. **India-specific Data/Facts** (statistics to quote)
5. **Balanced Conclusion** (to conclude the GD)
6. **Communication Tips** (how to perform well in this GD)

Keep it sharp and ready to use in actual GD.`,
        (_, full) => { result = full; }
      );
      setAiFeedback(result);
    } catch (err) {
      setAiFeedback(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const getSpokenEnglishTip = async () => {
    setLoading(true);
    setAiFeedback('');
    try {
      let result = '';
      await ollamaGenerate(
        `Give me today's spoken English lesson for a Tamil-speaking engineering student preparing for IT placement interviews.

Include:
1. **5 Common Mistakes Tamil speakers make in English** (with corrections)
2. **10 Useful phrases for interviews** (formal)
3. **Today's vocabulary** (5 power words with usage)
4. **A short paragraph to read aloud** (for pronunciation practice)
5. **Self-introduction template** (for TCS/Infosys interview)

Make it practical and immediately usable.`,
        (_, full) => { result = full; }
      );
      setAiFeedback(result);
    } catch (err) {
      setAiFeedback(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Communication Skills Trainer</div>
          <div className="section-desc">AI-powered practice for interviews, GDs, essays, and spoken English</div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {features.map(f => (
          <button key={f.id}
            onClick={() => { setActiveFeature(f.id); setAiFeedback(''); setUserAnswer(''); }}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${activeFeature === f.id ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
              background: activeFeature === f.id ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
              color: activeFeature === f.id ? 'var(--neon-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
            <f.icon size={15} /> {f.label}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* LEFT: Input Panel */}
        <div>
          {activeFeature === 'hr' && (
            <div className="card card-glow-orange">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>HR Interview Practice</div>
              <div style={{ padding: '14px 16px', background: 'rgba(249,115,22,0.06)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.15)', marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--neon-primary)', letterSpacing: '0.06em', marginBottom: 6 }}>QUESTION {currentQ + 1}/{HR_QUESTIONS.length}</div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{HR_QUESTIONS[currentQ]}</p>
              </div>
              <div className="input-group" style={{ marginBottom: 14 }}>
                <label className="input-label">Your Answer</label>
                <textarea className="input" rows={5} value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here as you would speak in the interview..." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={getHRFeedback} disabled={loading || !userAnswer.trim()}>
                  {loading ? <><div className="spinner" style={{ width: 15, height: 15 }} /> Analyzing...</> : <><Brain size={15} /> Get AI Feedback</>}
                </button>
                <button className="btn btn-secondary btn-icon" onClick={() => { setCurrentQ(p => (p + 1) % HR_QUESTIONS.length); setUserAnswer(''); setAiFeedback(''); }}>
                  <RotateCcw size={16} />
                </button>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>All Questions:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {HR_QUESTIONS.map((_, i) => (
                    <button key={i} onClick={() => { setCurrentQ(i); setUserAnswer(''); setAiFeedback(''); }}
                      style={{
                        width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                        background: i === currentQ ? 'var(--neon-primary)' : 'rgba(255,255,255,0.07)',
                        color: i === currentQ ? '#000' : 'var(--text-muted)',
                      }}>{i + 1}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeFeature === 'gd' && (
            <div className="card card-glow-blue">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>Group Discussion Practice</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {GD_TOPICS.map((t, i) => (
                  <button key={i} onClick={() => { setAiFeedback(''); getGDPoints(t); }}
                    style={{
                      padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border)',
                      background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontSize: '0.84rem',
                    }}>
                    <span style={{ color: 'var(--neon-blue)', fontWeight: 700 }}>{i + 1}. </span>{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeFeature === 'essay' && (
            <div className="card card-glow-purple">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>UPSC Essay Writing</div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Choose Topic</label>
                <select className="input" value={essayTopic} onChange={e => setEssayTopic(Number(e.target.value))}>
                  {ESSAY_TOPICS.map((t, i) => <option key={i} value={i}>{t}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 14 }}>
                <label className="input-label">Write Your Essay (min 500 words)</label>
                <textarea className="input" rows={10} value={essayText} onChange={e => setEssayText(e.target.value)}
                  placeholder="Start writing your UPSC-quality essay here..." />
              </div>
              <button className="btn btn-purple" style={{ width: '100%' }} onClick={getEssayFeedback} disabled={loading || essayText.trim().length < 100}>
                {loading ? <><div className="spinner" style={{ width: 15, height: 15 }} /> Evaluating...</> : <><Star size={15} /> Evaluate Essay (UPSC)</>}
              </button>
            </div>
          )}

          {activeFeature === 'spoken' && (
            <div className="card card-glow-green">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>Spoken English Trainer</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                Get a personalized spoken English lesson designed for Tamil-medium students preparing for IT placement interviews. Daily practice will improve your fluency, grammar, and confidence.
              </p>
              <div style={{ padding: 16, background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: 'var(--neon-green)', fontSize: '0.85rem', marginBottom: 8 }}>Today's Focus</div>
                <ul style={{ paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 2 }}>
                  <li>Common Tamil-English mistakes & corrections</li>
                  <li>10 power phrases for interviews</li>
                  <li>Vocabulary building (5 words)</li>
                  <li>Pronunciation practice paragraph</li>
                  <li>Self-introduction template</li>
                </ul>
              </div>
              <button className="btn btn-green" style={{ width: '100%' }} onClick={getSpokenEnglishTip} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 15, height: 15 }} /> Generating Lesson...</> : <><Volume2 size={15} /> Get Today's Lesson</>}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: AI Feedback */}
        <div>
          {aiFeedback ? (
            <div className="card card-glow-green" style={{ position: 'sticky', top: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} color="var(--neon-green)" /> AI Feedback
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {aiFeedback}
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', border: '1px dashed var(--border)' }}>
              <Brain size={40} color="var(--text-muted)" style={{ marginBottom: 14 }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI feedback will appear here</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Submit your answer or select a topic to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationSkills;
