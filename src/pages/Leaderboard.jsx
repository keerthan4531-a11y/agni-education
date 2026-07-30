import React, { useState } from 'react';
import { Trophy, Medal, Star, Shield, Crown } from 'lucide-react';

const Leaderboard = ({ lang = 'en' }) => {
  const t = (en, ta) => lang === 'ta' ? ta : en;
  const userName = localStorage.getItem('agni_name') || 'You';

  const leaders = [
    { rank: 1, name: 'Karthik S.', rankTitle: 'Grandmaster Elite', xp: 12450, icon: Crown, color: '#fbbf24' },
    { rank: 2, name: 'Priya R.', rankTitle: 'Diamond Elite', xp: 11200, icon: Shield, color: '#38bdf8' },
    { rank: 3, name: 'Saran K.', rankTitle: 'Diamond Elite', xp: 10850, icon: Shield, color: '#38bdf8' },
    { rank: 4, name: 'Arjun V.', rankTitle: 'Platinum Scholar', xp: 9500, icon: Star, color: '#a78bfa' },
    { rank: 5, name: 'Meena P.', rankTitle: 'Platinum Scholar', xp: 9200, icon: Star, color: '#a78bfa' },
    { rank: 6, name: 'Rahul D.', rankTitle: 'Gold Scholar', xp: 8100, icon: Medal, color: '#fcd34d' },
    { rank: 7, name: 'Anitha B.', rankTitle: 'Gold Scholar', xp: 7950, icon: Medal, color: '#fcd34d' },
    { rank: 142, name: userName, rankTitle: 'Silver Warrior', xp: 3450, icon: Trophy, color: '#cbd5e1', isUser: true },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
         <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}>
           <Crown size={40} color="#fff" />
         </div>
         <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>{t('Tamil Nadu Statewide Ranks', 'மாநில அளவிலான தரவரிசை')}</h1>
         <p style={{ color: 'var(--text-secondary)' }}>{t('Compete with lakhs of students. Climb the ranks to Grandmaster.', 'லட்சக்கணக்கான மாணவர்களுடன் போட்டி போடுங்கள். உயரிய நிலையை அடையுங்கள்.')}</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {leaders.map((leader, i) => {
          const ItemIcon = leader.icon;
          return (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', padding: '16px 24px', 
              borderBottom: '1px solid var(--border)',
              background: leader.isUser ? 'rgba(249,115,22,0.1)' : 'transparent',
              borderLeft: leader.isUser ? '4px solid var(--neon-primary)' : '4px solid transparent',
              position: 'relative'
            }}>
               <div style={{ width: 40, fontSize: '1.2rem', fontWeight: 900, color: leader.rank <= 3 ? leader.color : 'var(--text-muted)' }}>
                  #{leader.rank}
               </div>
               <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <ItemIcon size={20} color={leader.color} />
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: leader.isUser ? 'var(--neon-primary)' : 'var(--text-primary)', marginBottom: 2 }}>
                     {leader.name} {leader.isUser && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--neon-primary)', color: '#fff', borderRadius: 10, marginLeft: 8 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: leader.color, fontWeight: 600 }}>{leader.rankTitle}</div>
               </div>
               <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {leader.xp.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP</span>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
