import React, { useState, useEffect } from 'react';
import {
  Flame, Target, Brain, MessageSquare, BookOpen, Trophy,
  TrendingUp, Clock, Star, Zap, Users, ChevronRight,
  Calendar, CheckCircle, AlertCircle, Play, Download, BarChart3,
  PlayCircle, Network, Search
} from 'lucide-react';
import { checkAIStatus } from '../services/ai';

const Dashboard = ({ userGoal, setPage }) => {
  const [aiOnline, setAiOnline] = useState(null);
  const [todayDate] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [streakDays] = useState([true, true, true, true, true, true, false]);

  useEffect(() => {
    const h = todayDate.getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    checkAIStatus().then(s => setAiOnline(s.online));
  }, []);

  const stats = [
    { label: 'Study Streak', value: '6 Days', icon: Flame, color: 'var(--neon-primary)', bg: 'rgba(249,115,22,0.12)' },
    { label: 'Questions Solved', value: '284', icon: CheckCircle, color: 'var(--neon-green)', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Mock Tests', value: '12', icon: Trophy, color: 'var(--neon-purple)', bg: 'rgba(168,85,247,0.12)' },
    { label: 'AI Sessions', value: '38', icon: Brain, color: 'var(--neon-blue)', bg: 'rgba(59,130,246,0.12)' },
  ];

  const quickActions = [
    { label: 'AI Mentor Chat', desc: 'Ask doubts, get guided', icon: MessageSquare, page: 'ai-chat', color: 'var(--neon-primary)', glow: 'var(--glow-primary)' },
    { label: 'Mock Test', desc: 'Test your knowledge', icon: Trophy, page: 'mock-test', color: 'var(--neon-purple)', glow: 'var(--glow-purple)' },
    { label: 'Study Planner', desc: 'AI-generated daily plan', icon: Calendar, page: 'study-plan', color: 'var(--neon-blue)', glow: 'var(--glow-blue)' },
    { label: 'Resources', desc: 'PYQs & Syllabus PDFs', icon: Download, page: 'resources', color: 'var(--neon-cyan)', glow: 'var(--glow-cyan)' },
  ];

  const goalModules = {
    entrance: [
      { name: 'NEET Physics', progress: 62, color: 'orange' },
      { name: 'NEET Chemistry', progress: 45, color: 'blue' },
      { name: 'NEET Biology', progress: 78, color: 'green' },
    ],
    govt: [
      { name: 'General Studies', progress: 55, color: 'orange' },
      { name: 'Current Affairs', progress: 70, color: 'blue' },
      { name: 'Essay Writing', progress: 30, color: 'green' },
    ],
    placement: [
      { name: 'DSA & Coding', progress: 50, color: 'orange' },
      { name: 'Aptitude', progress: 65, color: 'blue' },
      { name: 'Core CS', progress: 40, color: 'green' },
    ],
  };

  const modules = goalModules[userGoal] || goalModules.entrance;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Flame size={22} color="var(--neon-primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AGNI Prep AI</span>
            <div style={{
              marginLeft: 8, padding: '2px 10px',
              background: aiOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${aiOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
              color: aiOnline ? 'var(--neon-green)' : 'var(--neon-red)',
            }}>
              {aiOnline === null ? 'Checking AI...' : aiOnline ? 'AI Online ✨' : 'AI Offline'}
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {greeting}, Warrior! 🔥
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500 }}>
            Your AI-powered exam preparation is ready. Keep the streak going — consistency beats talent every time.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setPage('ai-chat')}>
              <Brain size={16} /> Talk to AI Mentor
            </button>
            <button className="btn btn-secondary" onClick={() => setPage('mock-test')}>
              <Play size={16} /> Start Mock Test
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Quick Actions */}
        <div className="card card-glow-orange">
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>Quick Actions</div>
            <div className="section-desc">Jump right into preparation</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map((a, i) => (
              <button key={i} className="resource-item btn" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }}
                onClick={() => setPage(a.page)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(0,0,0,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  <a.icon size={18} color={a.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="card card-glow-blue">
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: '1rem' }}>Subject Progress</div>
            <div className="section-desc">Your syllabus completion tracker</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {modules.map((m, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{m.progress}%</span>
                </div>
                <div className="progress-wrap">
                  <div className={`progress-fill progress-${m.color}`} style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* 7-day streak */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>This Week</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['M','T','W','T','F','S','S'].map((day, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className={
                    i === 6 ? 'streak-day streak-future' :
                    i === 5 ? 'streak-day streak-today' :
                    'streak-day streak-done'
                  }>{i < 5 ? '✓' : i === 5 ? 'T' : day}</div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next-Gen Smart Learning */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Star size={20} color="var(--neon-purple)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Next-Gen Learning Tools</h2>
        </div>
        <div className="grid-3">
          <button className="card card-glow-purple" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setPage('swipe-reels')}>
            <PlayCircle size={24} color="var(--neon-purple)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Micro-Learning Reels</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Swipe through bite-sized 1-minute flashcards with real-world examples.</p>
          </button>
          
          <button className="card card-glow-cyan" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setPage('mind-map')}>
            <Network size={24} color="var(--neon-cyan)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Visual Mind Map Explorer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Break down complex chapters into an interactive visual hierarchy.</p>
          </button>

          <button className="card card-glow-green" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setPage('case-studies')}>
            <Search size={24} color="var(--neon-green)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Sherlock Case Studies</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Solve interactive mysteries to deeply understand science concepts.</p>
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card card-glow-purple">
        <div className="section-header">
          <div>
            <div className="section-title" style={{ fontSize: '1rem' }}>Today's Study Plan</div>
            <div className="section-desc">AI-generated schedule for your goal</div>
          </div>
          <button className="btn btn-sm btn-purple" onClick={() => setPage('study-plan')}>
            <Calendar size={14} /> Full Plan
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { time: '6:00 AM', task: 'Physics — Electrostatics', done: true, color: 'var(--neon-green)' },
            { time: '8:00 AM', task: 'Chemistry — Organic reactions', done: true, color: 'var(--neon-green)' },
            { time: '11:00 AM', task: '30 MCQ Practice set', done: false, color: 'var(--neon-primary)' },
            { time: '3:00 PM', task: 'Biology — Genetics chapter', done: false, color: 'var(--text-muted)' },
            { time: '6:00 PM', task: 'Mock Test — 40 questions', done: false, color: 'var(--text-muted)' },
            { time: '8:30 PM', task: 'Formula revision + AI chat', done: false, color: 'var(--text-muted)' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            }}>
              {item.done
                ? <CheckCircle size={18} color="var(--neon-green)" />
                : <Clock size={18} color="var(--text-muted)" />}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.task}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
