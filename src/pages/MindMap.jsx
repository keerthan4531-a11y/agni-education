import React, { useState } from 'react';
import { Network, Loader2, ArrowRight } from 'lucide-react';
import { ollamaGenerate } from '../services/ollama';

const MindMap = ({ lang = 'en' }) => {
  const [topic, setTopic] = useState('');
  const [mindmapData, setMindmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const t = (en, ta) => lang === 'ta' ? ta : en;

  const generateMap = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const prompt = `Create a hierarchical mind map structure natively in ${lang === 'ta' ? 'Tamil' : 'English'} for the topic: "${topic}".
Output purely a list of nodes in this exact format:
Root
- Subtopic 1
-- Detail A
-- Detail B
- Subtopic 2
-- Detail C

Do not include any other markdown or text. Just the indented list.`;

    try {
      let raw = '';
      await ollamaGenerate(prompt, (_, text) => { raw = text; });
      const nodes = raw.split('\n').filter(l => l.trim()).map(line => {
        const level = (line.match(/^-+/) || [''])[0].length;
        return { label: line.replace(/^-+\s*/, ''), level };
      });
      setMindmapData(nodes);
    } catch (e) {
      console.error(e);
      setMindmapData([{ label: 'Error generating map. Please try again.', level: 0 }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="welcome-banner" style={{ marginBottom: 0 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Network size={28} color="var(--neon-cyan)" /> {t('AI Visual Mind Map Explorer', 'AI மனவரைபடம் வளவி')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            {t('Enter any big chapter or concept, and the AI will break it down into a clear visual hierarchy.', 'ஏதேனும் ஒரு பெரிய பாடத்தை உள்ளிடவும், அதற்கான மனவரைபடத்தை AI உருவாக்கித் தரும்.')}
          </p>
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input className="input" style={{ flex: 1, maxWidth: 400 }} placeholder={t('e.g., Human Heart, Thermodynamics...', 'எ.கா., மனித இதயம், ஒளியியல்...')} value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateMap()} />
            <button className="btn btn-primary" onClick={generateMap} disabled={loading || !topic.trim()}>
              {loading ? <Loader2 className="spinner" size={18} /> : t('Generate Map', 'வரைபடம் உருவாக்கு')}
            </button>
          </div>
        </div>
      </div>

      {mindmapData.length > 0 && (
        <div className="card" style={{ padding: 40, overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mindmapData.map((node, i) => (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: 12, 
                marginLeft: node.level * 40,
                position: 'relative'
              }}>
                {node.level > 0 && (
                  <div style={{ position: 'absolute', left: -24, top: '50%', width: 20, height: 2, background: 'var(--border)' }} />
                )}
                {node.level === 0 ? (
                  <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))', border: '1px solid var(--neon-cyan)', padding: '12px 24px', borderRadius: 20, fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', boxShadow: 'var(--glow-cyan)' }}>
                    {node.label}
                  </div>
                ) : node.level === 1 ? (
                  <div style={{ background: 'var(--bg-card-hover)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: 8, fontWeight: 600, color: 'var(--neon-blue)', fontSize: '0.95rem' }}>
                    {node.label}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <ArrowRight size={14} color="var(--text-muted)" /> {node.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
