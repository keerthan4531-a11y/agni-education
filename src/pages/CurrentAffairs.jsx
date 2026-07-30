import React, { useState } from 'react';
import { Newspaper, RefreshCw, BookOpen, Tag, ExternalLink } from 'lucide-react';
import { CURRENT_AFFAIRS } from '../data/examData';
import { aiGenerate } from '../services/ai';

const CATEGORIES = ['All', 'Economy', 'Education', 'Science & Tech', 'Governance', 'International Relations', 'Environment', 'Defence'];

const CurrentAffairs = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = selectedCategory === 'All'
    ? CURRENT_AFFAIRS
    : CURRENT_AFFAIRS.filter(i => i.category === selectedCategory);

  const getAIAnalysis = async (item) => {
    setSelectedItem(item);
    setAiAnalysis('');
    setLoading(true);
    try {
      let result = '';
      await aiGenerate(
        `You are a UPSC/TNPSC exam expert. Analyze this current affairs topic from an exam perspective:

Topic: ${item.title}
Summary: ${item.summary}
Category: ${item.category}

Provide:
1. **Exam Relevance**: Which exams (UPSC/TNPSC/SSC/etc.) is this relevant for?
2. **Key Facts to Remember** (bullet points, exam-ready)
3. **UPSC Prelims MCQ** (3 likely questions based on this topic)
4. **Mains/Essay Angle** (if applicable): Key arguments for UPSC mains
5. **Related Topics**: What other topics should you also study?

Make it directly usable in exams.`,
        (_, full) => { result = full; }
      );
      setAiAnalysis(result);
    } catch (err) {
      setAiAnalysis(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Current Affairs</div>
          <div className="section-desc">Daily news with AI-powered exam analysis for UPSC, TNPSC, SSC</div>
        </div>
        <button className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} className={`topic-chip ${selectedCategory === c ? 'active' : ''}`} onClick={() => setSelectedCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* News List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item, i) => (
            <div key={i}
              onClick={() => getAIAnalysis(item)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: selectedItem?.title === item.title ? 'rgba(249,115,22,0.4)' : 'var(--border)',
                background: selectedItem?.title === item.title ? 'rgba(249,115,22,0.05)' : 'var(--bg-card)',
              }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Newspaper size={18} color="var(--neon-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span className="badge badge-blue">{item.category}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 5 }}>{item.title}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div style={{ position: 'sticky', top: 0, height: 'fit-content' }}>
          {aiAnalysis ? (
            <div className="card card-glow-orange">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} color="var(--neon-primary)" /> Exam Analysis
              </div>
              <div style={{ padding: '10px 14px', background: 'rgba(249,115,22,0.06)', borderRadius: 8, border: '1px solid rgba(249,115,22,0.15)', marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--neon-primary)' }}>{selectedItem?.title}</div>
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {aiAnalysis}
              </div>
            </div>
          ) : loading ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 250 }}>
              <div className="spinner" style={{ width: 32, height: 32, marginBottom: 16 }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI analyzing for exam perspective...</div>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', border: '1px dashed var(--border)' }}>
              <Newspaper size={40} color="var(--text-muted)" style={{ marginBottom: 14 }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select a news item</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>AI will analyze it for UPSC/TNPSC relevance</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentAffairs;
