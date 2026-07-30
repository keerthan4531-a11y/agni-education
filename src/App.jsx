import React, { useState, useEffect } from 'react';
import {
  Flame, LayoutDashboard, MessageSquare, Trophy, Calendar,
  Download, Newspaper, Mic, User, ChevronLeft, ChevronRight,
  Brain, Target, BookOpen, Zap, Menu, X, Globe,
  PlayCircle, Network, Search, Crown
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import MockTest from './pages/MockTest';
import StudyPlan from './pages/StudyPlan';
import Resources from './pages/Resources';
import CurrentAffairs from './pages/CurrentAffairs';
import SwipeReels from './pages/SwipeReels';
import MindMap from './pages/MindMap';
import CaseStudies from './pages/CaseStudies';
import AIViva from './pages/AIViva';
import AgniBattles from './pages/AgniBattles';
import SnapSolver from './pages/SnapSolver';
import Leaderboard from './pages/Leaderboard';
import InterviewSim from './pages/InterviewSim';
import CrashCourse from './pages/CrashCourse';
import CommunicationSkills from './pages/CommunicationSkills';
import Profile from './pages/Profile';

const NAV_SECTIONS = [
  {
    label: 'Main',
    labelTa: 'முகப்பு',
    items: [
      { id: 'dashboard', label: 'Dashboard', labelTa: 'டாஷ்போர்டு', icon: LayoutDashboard },
      { id: 'ai-chat', label: 'AI Mentor Chat', labelTa: 'AI மாணவர் உதவி', icon: MessageSquare, badge: 'AI' },
      { id: 'crash-course', label: '30-Day Do or Die', labelTa: '30 நாள் போர் திட்டம்', icon: Flame, badge: 'NEW' },
      { id: 'mock-test', label: 'Mock Tests', labelTa: 'பயிற்சி தேர்வு', icon: Trophy },
      { id: 'study-plan', label: 'Study Planner', labelTa: 'படிப்பு திட்டம்', icon: Calendar },
    ],
  },
  {
    label: 'Viral Features',
    labelTa: 'பிரபலமான திறன் கற்றல்',
    items: [
      { id: 'ai-viva', label: 'AI Voice Viva', labelTa: 'AI நேர்காணல்', icon: Mic, badge: 'HOT' },
      { id: 'agni-battles', label: '1v1 Live Battles', labelTa: 'நேரடி போர்', icon: Trophy, badge: 'LIVE' },
      { id: 'snap-solver', label: 'Snap & Solve', labelTa: 'புகைப்பட தீர்வு', icon: Target },
      { id: 'leaderboard', label: 'State Ranks', labelTa: 'மாநில தரவரிசை', icon: Crown },
    ],
  },
  {
    label: 'Smart Learning',
    labelTa: 'திறன் கற்றல்',
    items: [
      { id: 'swipe-reels', label: 'Micro Reels', labelTa: 'நுண் கற்றல் ரீல்ஸ்', icon: PlayCircle, badge: 'HOT' },
      { id: 'mind-map', label: 'Visual Mind Map', labelTa: 'மனவரைபடம்', icon: Network },
      { id: 'case-studies', label: 'Sherlock Cases', labelTa: 'கேஸ் ஸ்டடீஸ்', icon: Search },
    ],
  },
  {
    label: 'Exam Prep',
    labelTa: 'தேர்வு தயாரிப்பு',
    items: [
      { id: 'resources', label: 'Syllabus & PYQs', labelTa: 'பாடத்திட்டம் & கேள்விகள்', icon: BookOpen },
      { id: 'current-affairs', label: 'Current Affairs', labelTa: 'நடப்பு நிகழ்வுகள்', icon: Newspaper },
      { id: 'interview-sim', label: 'HR Interview Sim', labelTa: 'HR நேர்காணல்', icon: User },
      { id: 'communication', label: 'Communication', labelTa: 'தொடர்பு திறன்', icon: Mic },
    ],
  },
  {
    label: 'My Account',
    labelTa: 'என் கணக்கு',
    items: [
      { id: 'profile', label: 'My Profile', labelTa: 'என் சுயவிவரம்', icon: User },
    ],
  },
];

const PAGE_TITLES = {
  'dashboard':      { en: { title: 'Dashboard', subtitle: 'Your preparation at a glance' }, ta: { title: 'டாஷ்போர்டு', subtitle: 'உங்கள் தயாரிப்பு நிலை' } },
  'ai-chat':        { en: { title: 'AI Mentor Chat', subtitle: 'Powered by Ollama — gemini-3-flash-preview' }, ta: { title: 'AI மாணவர் உதவி', subtitle: 'Ollama AI மூலம் — gemini-3-flash-preview' } },
  'crash-course':   { en: { title: '30-Day Do or Die', subtitle: 'Emergency highly-personalized crash course' }, ta: { title: '30 நாள் போர் திட்டம்', subtitle: 'தனிப்பட்ட அவசர கால தயாரிப்பு' } },
  'mock-test':      { en: { title: 'Mock Test Center', subtitle: 'NEET · JEE · UPSC · Placement' }, ta: { title: 'பயிற்சி தேர்வு', subtitle: 'நீட் · ஜேஈஈ · UPSC · வேலை' } },
  'study-plan':     { en: { title: 'Study Planner', subtitle: 'AI-generated personalized schedule' }, ta: { title: 'படிப்பு திட்டம்', subtitle: 'AI-உருவாக்கும் தனிப்பட்ட அட்டவணை' } },
  'resources':      { en: { title: 'Resources', subtitle: 'Syllabus PDFs · PYQs · Study Notes' }, ta: { title: 'வளங்கள்', subtitle: 'பாடத்திட்டம் · கேள்விகள் · குறிப்புகள்' } },
  'current-affairs':{ en: { title: 'Current Affairs', subtitle: 'Daily news with exam analysis' }, ta: { title: 'நடப்பு நிகழ்வுகள்', subtitle: 'தேர்வு கண்ணோட்டத்தில் செய்திகள்' } },
  'communication':  { en: { title: 'Communication Trainer', subtitle: 'HR Interview · GD · Essay · Spoken English' }, ta: { title: 'தொடர்பு திறன்', subtitle: 'HR நேர்காணல் · GD · கட்டுரை · ஆங்கிலம்' } },
  'profile':        { en: { title: 'My Profile', subtitle: 'Progress · Achievements · Settings' }, ta: { title: 'என் சுயவிவரம்', subtitle: 'முன்னேற்றம் · சாதனைகள் · அமைப்புகள்' } },
  'swipe-reels':    { en: { title: 'Micro-Learning Reels', subtitle: 'Swipe & Learn in seconds' }, ta: { title: 'நுண் கற்றல் ரீல்ஸ்', subtitle: 'ஸ்வைப் செய்து நொடிகளில் கற்கவும்' } },
  'mind-map':       { en: { title: 'Visual Mind Map', subtitle: 'AI generated topic hierarchy' }, ta: { title: 'மனவரைபடம்', subtitle: 'AI உருவாக்கும் பாட வரைபடம்' } },
  'case-studies':   { en: { title: 'Sherlock Cases', subtitle: 'Solve real-world mysteries' }, ta: { title: 'ரியல்-வேர்ல்ட் கேஸ் ஸ்டடீஸ்', subtitle: 'மர்மங்களை தீர்த்து கற்கவும்' } },
  'ai-viva':        { en: { title: 'AI Voice Viva', subtitle: 'Real-time oral testing' }, ta: { title: 'AI நேர்காணல்', subtitle: 'நேரடி வாய்வழி சோதனை' } },
  'agni-battles':   { en: { title: 'Agni Battles (Live)', subtitle: '1v1 Multiplayer Quizzes' }, ta: { title: 'மல்டிபிளேயர் போர்', subtitle: 'நேரடி வினாடி வினா' } },
  'snap-solver':    { en: { title: 'Snap-Solver AI', subtitle: 'Photo to Step-by-Step Answer' }, ta: { title: 'புகைப்பட தீர்வு', subtitle: 'படி-படியான விடை காணவும்' } },
  'leaderboard':    { en: { title: 'Global Ranks', subtitle: 'Tamil Nadu Live Standings' }, ta: { title: 'மாநில தரவரிசை', subtitle: 'முன்னிலை அறிக்கை' } },
  'interview-sim':  { en: { title: 'HR Interview Sim', subtitle: 'AI Voice Placements Prep' }, ta: { title: 'HR நேர்காணல்', subtitle: 'AI மூலம் வேலைவாய்ப்பு பயிற்சி' } },
};

const GOALS = [
  { id: 'entrance', label: 'NEET / JEE / CUET', labelTa: 'நீட் / ஜேஈஈ / CUET', icon: Target, color: 'var(--neon-green)' },
  { id: 'govt', label: 'UPSC / TNPSC / SSC', labelTa: 'UPSC / TNPSC / SSC', icon: Trophy, color: 'var(--neon-blue)' },
  { id: 'placement', label: 'IT Placement (TCS/Infosys)', labelTa: 'IT வேலை (TCS/Infosys)', icon: Zap, color: 'var(--neon-purple)' },
  { id: 'product', label: 'Product Company / DSA', labelTa: 'தயாரிப்பு நிறுவனம் / DSA', icon: Brain, color: 'var(--neon-primary)' },
];

const OnboardingModal = ({ onComplete }) => {
  const [name, setName]     = useState('');
  const [goal, setGoal]     = useState('');
  const [lang, setLang]     = useState('en');

  const t = (en, ta) => lang === 'ta' ? ta : en;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 520 }}>
        {/* Language toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 20, padding: 4 }}>
            {[{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ்' }].map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{
                  padding: '5px 14px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: lang === l.code ? 'var(--neon-primary)' : 'transparent',
                  color: lang === l.code ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s',
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-primary)',
            animation: 'flame-pulse 2s ease-in-out infinite',
          }}>
            <Flame size={32} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            {t('Welcome to AGNI Prep AI', 'AGNI Prep AI-க்கு வரவேற்கிறோம்')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {t("India's smartest AI-powered exam preparation platform. Let's set up your personalized learning journey.",
               "இந்தியாவின் மிகச் சிறந்த AI தேர்வு தயாரிப்பு தளம். உங்கள் தனிப்பட்ட பயணத்தை தொடங்குவோம்.")}
          </p>
        </div>

        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">{t('Your Name', 'உங்கள் பெயர்')}</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            placeholder={t('Enter your name...', 'உங்கள் பெயரை உள்ளிடுங்கள்...')} style={{ fontSize: '1rem' }} />
        </div>

        <div className="input-group" style={{ marginBottom: 28 }}>
          <label className="input-label">{t('Your Primary Goal', 'உங்கள் முக்கிய இலக்கு')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setGoal(g.id)}
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  border: `1px solid ${goal === g.id ? 'rgba(249,115,22,0.5)' : 'var(--border)'}`,
                  background: goal === g.id ? 'rgba(249,115,22,0.1)' : 'var(--bg-input)',
                  color: goal === g.id ? 'var(--neon-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.15s', textAlign: 'left',
                }}>
                <g.icon size={18} color={goal === g.id ? 'var(--neon-primary)' : g.color} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{lang === 'ta' ? g.labelTa : g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
          disabled={!name.trim() || !goal}
          onClick={() => onComplete(name.trim(), goal, lang)}>
          <Flame size={18} /> {t('Start My AGNI Journey', 'என் AGNI பயணம் தொடங்கும்')}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage]                   = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userName, setUserName]           = useState(() => localStorage.getItem('agni_name') || '');
  const [userGoal, setUserGoal]           = useState(() => localStorage.getItem('agni_goal') || '');
  const [lang, setLang]                   = useState(() => localStorage.getItem('agni_lang') || 'en');
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('agni_name'));

  const t = (en, ta) => lang === 'ta' ? ta : en;

  const handleOnboardingComplete = (name, goal, selectedLang) => {
    localStorage.setItem('agni_name', name);
    localStorage.setItem('agni_goal', goal);
    localStorage.setItem('agni_lang', selectedLang);
    setUserName(name);
    setUserGoal(goal);
    setLang(selectedLang);
    setShowOnboarding(false);
  };

  const handleSetGoal = (g) => { localStorage.setItem('agni_goal', g); setUserGoal(g); };
  const handleSetName = (n) => { localStorage.setItem('agni_name', n); setUserName(n); };

  const navigate = (id) => { setPage(id); setMobileSidebarOpen(false); };

  const toggleLang = () => {
    const next = lang === 'en' ? 'ta' : 'en';
    localStorage.setItem('agni_lang', next);
    setLang(next);
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':        return <Dashboard userGoal={userGoal} setPage={navigate} lang={lang} />;
      case 'ai-chat':          return <AIChat lang={lang} />;
      case 'crash-course':     return <CrashCourse lang={lang} />;
      case 'mock-test':        return <MockTest lang={lang} />;
      case 'study-plan':       return <StudyPlan userGoal={userGoal} lang={lang} />;
      case 'resources':        return <Resources lang={lang} />;
      case 'current-affairs':  return <CurrentAffairs lang={lang} />;
      case 'communication':    return <CommunicationSkills lang={lang} />;
      case 'profile':          return <Profile userGoal={userGoal} setUserGoal={handleSetGoal} userName={userName} setUserName={handleSetName} lang={lang} />;
      case 'swipe-reels':      return <SwipeReels lang={lang} />;
      case 'mind-map':         return <MindMap lang={lang} />;
      case 'case-studies':     return <CaseStudies lang={lang} />;
      case 'ai-viva':          return <AIViva lang={lang} />;
      case 'agni-battles':     return <AgniBattles lang={lang} />;
      case 'snap-solver':      return <SnapSolver lang={lang} />;
      case 'leaderboard':      return <Leaderboard lang={lang} />;
      case 'interview-sim':    return <InterviewSim lang={lang} />;
      default:                 return <Dashboard userGoal={userGoal} setPage={navigate} lang={lang} />;
    }
  };

  const pageInfo = PAGE_TITLES[page]?.[lang] || PAGE_TITLES['dashboard'][lang];

  return (
    <div className="app-wrapper">
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 99 }} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => setSidebarCollapsed(p => !p)}>
          <div className="logo-flame">
            <Flame size={22} color="#fff" />
          </div>
          {!sidebarCollapsed && (
            <div className="logo-info">
              <div className="logo-text">AGNI Prep</div>
              <div className="logo-sub">{t('AI Study Platform', 'AI படிப்பு தளம்')}</div>
            </div>
          )}
        </div>

        {/* User mini */}
        {!sidebarCollapsed && userName && (
          <div style={{
            margin: '8px 10px', padding: '10px 12px', borderRadius: 10,
            background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.4), rgba(239,68,68,0.4))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.85rem', color: '#fff',
              }}>
                {userName[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t('6-day streak', '6 நாள் தொடர்ச்சி')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="sidebar-section">
            {!sidebarCollapsed && (
              <div className="sidebar-section-label">{lang === 'ta' ? section.labelTa : section.label}</div>
            )}
            {section.items.map(item => (
              <button key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => navigate(item.id)}
                title={sidebarCollapsed ? (lang === 'ta' ? item.labelTa : item.label) : undefined}
              >
                <item.icon size={18} className="nav-icon" />
                {!sidebarCollapsed && (
                  <span className="nav-label">{lang === 'ta' ? item.labelTa : item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}

        {/* Collapse toggle */}
        {!sidebarCollapsed && (
          <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
            <button className="nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={() => setSidebarCollapsed(true)}>
              <ChevronLeft size={18} className="nav-icon" />
              <span className="nav-label">{t('Collapse', 'சுருக்கு')}</span>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
            <button className="nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer' }} onClick={() => setSidebarCollapsed(false)}>
              <ChevronRight size={18} className="nav-icon" />
            </button>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          {/* Hamburger — always visible, controls mobile sidebar */}
          <button
            className="btn btn-ghost btn-icon mobile-menu-btn"
            style={{ display: 'none', flexShrink: 0 }}
            onClick={() => setMobileSidebarOpen(p => !p)}
            aria-label="Toggle Menu"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <div className="topbar-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pageInfo.title}
            </div>
            <div className="topbar-subtitle">{pageInfo.subtitle}</div>
          </div>

          <div className="topbar-right">
            {/* Language Toggle */}
            <button onClick={toggleLang}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 700,
              }}>
              <Globe size={13} />
              {lang === 'ta' ? 'தமிழ்' : 'EN'}
            </button>

            <div className="ai-status">
              <div className="ai-dot" />
              <span style={{ whiteSpace: 'nowrap' }}>Ollama AI</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {page === 'ai-chat' ? (
          renderPage()
        ) : (
          <div className="page-area">
            {renderPage()}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
