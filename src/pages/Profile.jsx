import React, { useState } from 'react';
import { User, Target, Trophy, TrendingUp, Calendar, Edit, CheckCircle, Flame, BarChart3, Star, Award } from 'lucide-react';

const GOAL_OPTIONS = [
  { id: 'neet', label: 'NEET — Medical', bg: 'rgba(16,185,129,0.1)', color: 'var(--neon-green)' },
  { id: 'jee', label: 'JEE — Engineering', bg: 'rgba(59,130,246,0.1)', color: 'var(--neon-blue)' },
  { id: 'upsc', label: 'UPSC — IAS/IPS', bg: 'rgba(168,85,247,0.1)', color: 'var(--neon-purple)' },
  { id: 'tnpsc', label: 'TNPSC — State Govt', bg: 'rgba(6,182,212,0.1)', color: 'var(--neon-cyan)' },
  { id: 'placement', label: 'IT Placement', bg: 'rgba(249,115,22,0.1)', color: 'var(--neon-primary)' },
  { id: 'product', label: 'Product Company', bg: 'rgba(234,179,8,0.1)', color: 'var(--neon-yellow)' },
];

const WEEKLY_DATA = [
  { day: 'Mon', hours: 5.5, questions: 42 },
  { day: 'Tue', hours: 6, questions: 38 },
  { day: 'Wed', hours: 4, questions: 27 },
  { day: 'Thu', hours: 7, questions: 55 },
  { day: 'Fri', hours: 6.5, questions: 48 },
  { day: 'Sat', hours: 8, questions: 65 },
  { day: 'Sun', hours: 3, questions: 0 },
];

const maxHours = Math.max(...WEEKLY_DATA.map(d => d.hours));

const Profile = ({ userGoal, setUserGoal, userName, setUserName }) => {
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempGoal, setTempGoal] = useState(userGoal);

  const handleSave = () => {
    setUserName(tempName);
    setUserGoal(tempGoal);
    setEditing(false);
  };

  const badges = [
    { label: '7-Day Streak', icon: Flame, color: 'var(--neon-primary)', unlocked: true },
    { label: '100 Questions', icon: Target, color: 'var(--neon-blue)', unlocked: true },
    { label: 'First Mock Test', icon: Trophy, color: 'var(--neon-yellow)', unlocked: true },
    { label: 'AI Power User', icon: Star, color: 'var(--neon-purple)', unlocked: true },
    { label: '30-Day Streak', icon: Award, color: 'var(--neon-green)', unlocked: false },
    { label: '1000 Questions', icon: Target, color: 'var(--neon-cyan)', unlocked: false },
  ];

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">My Profile</div>
          <div className="section-desc">Track your progress and manage your goal</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(e => !e)}>
          <Edit size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Profile Card */}
        <div className="card card-glow-orange">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(239,68,68,0.3))',
              border: '2px solid rgba(249,115,22,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-head)',
              color: 'var(--neon-primary)',
            }}>
              {(userName || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="input" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Your name" />
                  <div className="section-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Goal</div>
                  {GOAL_OPTIONS.map(g => (
                    <button key={g.id} onClick={() => setTempGoal(g.id)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, border: `1px solid ${tempGoal === g.id ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                        background: tempGoal === g.id ? 'rgba(249,115,22,0.1)' : 'transparent',
                        color: tempGoal === g.id ? 'var(--neon-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                      {tempGoal === g.id && <CheckCircle size={14} color="var(--neon-primary)" />}
                      {g.label}
                    </button>
                  ))}
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>
                    <CheckCircle size={14} /> Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{userName || 'Student'}</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                      background: GOAL_OPTIONS.find(g => g.id === userGoal)?.bg || 'rgba(249,115,22,0.1)',
                      color: GOAL_OPTIONS.find(g => g.id === userGoal)?.color || 'var(--neon-primary)',
                    }}>
                      {GOAL_OPTIONS.find(g => g.id === userGoal)?.label || 'NEET'}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 20 }}>
                    {[{ l: 'Study Days', v: 23 }, { l: 'Questions', v: 284 }, { l: 'Mock Tests', v: 12 }].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{s.v}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress */}
          {!editing && (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Goal Progress</div>
              {[
                { label: 'Syllabus Covered', value: 45, color: 'orange' },
                { label: 'Practice Questions', value: 62, color: 'blue' },
                { label: 'Mock Test Avg', value: 58, color: 'green' },
              ].map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{p.value}%</span>
                  </div>
                  <div className="progress-wrap">
                    <div className={`progress-fill progress-${p.color}`} style={{ width: `${p.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Activity */}
        <div className="card card-glow-blue">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
            <BarChart3 size={16} color="var(--neon-blue)" /> Weekly Activity
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140, marginBottom: 8 }}>
            {WEEKLY_DATA.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div title={`${d.hours}hrs, ${d.questions} questions`} style={{
                  width: '100%', height: `${(d.hours / maxHours) * 120}px`,
                  background: d.day === 'Sat' ? 'linear-gradient(180deg, #f97316, #ef4444)' : 'rgba(59,130,246,0.4)',
                  borderRadius: '4px 4px 0 0', transition: 'all 0.3s',
                  boxShadow: d.day === 'Sat' ? '0 0 10px rgba(249,115,22,0.4)' : 'none',
                  cursor: 'default',
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {WEEKLY_DATA.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.day}</div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: 'rgba(249,115,22,0.06)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.15)' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--neon-primary)' }}>40h</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This week</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--neon-green)' }}>275</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Questions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Award size={16} color="var(--neon-yellow)" /> Achievements
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {badges.map((b, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '14px 18px', borderRadius: 12,
              background: b.unlocked ? `rgba(0,0,0,0.3)` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${b.unlocked ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
              opacity: b.unlocked ? 1 : 0.4,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: b.unlocked ? `rgba(${b.color === 'var(--neon-primary)' ? '249,115,22' : b.color === 'var(--neon-blue)' ? '59,130,246' : b.color === 'var(--neon-green)' ? '16,185,129' : b.color === 'var(--neon-purple)' ? '168,85,247' : b.color === 'var(--neon-cyan)' ? '6,182,212' : '234,179,8'},0.2)` : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <b.icon size={22} color={b.unlocked ? b.color : 'var(--text-muted)'} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: b.unlocked ? 'var(--text-secondary)' : 'var(--text-muted)', textAlign: 'center', maxWidth: 70 }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
