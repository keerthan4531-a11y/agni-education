import React, { useState } from 'react';
import { Download, FileText, ExternalLink, BookOpen, Search, Filter } from 'lucide-react';
import { SYLLABUS_LINKS, PYQ_LINKS, EXAM_CATEGORIES } from '../data/examData';

const RESOURCE_TABS = ['Syllabus PDFs', 'Previous Year Papers', 'Study Notes'];

const STUDY_NOTES = [
  { title: 'Physics Formula Sheet — All Chapters', type: 'PDF', size: '2.4 MB', category: 'NEET/JEE', color: 'orange' },
  { title: 'Organic Chemistry Reactions Chart', type: 'PDF', size: '1.8 MB', category: 'NEET/JEE', color: 'green' },
  { title: 'Biology Diagrams — NEET Important', type: 'PDF', size: '3.1 MB', category: 'NEET', color: 'blue' },
  { title: 'UPSC GS Paper I — Complete Notes', type: 'PDF', size: '5.2 MB', category: 'UPSC', color: 'purple' },
  { title: 'Current Affairs Monthly Digest', type: 'PDF', size: '1.2 MB', category: 'Govt Exams', color: 'cyan' },
  { title: 'Aptitude Shortcut Tricks — All Topics', type: 'PDF', size: '0.9 MB', category: 'Placement', color: 'orange' },
  { title: 'DSA Patterns — LeetCode Cheat Sheet', type: 'PDF', size: '0.7 MB', category: 'Placement', color: 'blue' },
  { title: 'Integration & Differentiation — Quick Reference', type: 'PDF', size: '0.5 MB', category: 'JEE', color: 'purple' },
  { title: 'Indian Polity — Laxmikant Summary', type: 'PDF', size: '4.2 MB', category: 'UPSC/TNPSC', color: 'cyan' },
  { title: 'TNPSC Tamil Nadu History & Culture', type: 'PDF', size: '2.8 MB', category: 'TNPSC', color: 'green' },
];

const OFFICIAL_LINKS = [
  { name: 'NTA Official (NEET/JEE/CUET)', url: 'https://nta.ac.in', color: 'orange', desc: 'Official question papers, syllabi, results' },
  { name: 'JEE Advanced', url: 'https://jeeadv.ac.in', color: 'blue', desc: 'IIT JEE Advanced official website' },
  { name: 'UPSC Official', url: 'https://upsc.gov.in', color: 'purple', desc: 'Civil Services exam papers & notification' },
  { name: 'TNPSC Official', url: 'https://www.tnpsc.gov.in', color: 'cyan', desc: 'Tamil Nadu Public Service Commission' },
  { name: 'SSC Official', url: 'https://ssc.nic.in', color: 'green', desc: 'Staff Selection Commission question papers' },
  { name: 'IBPS Official', url: 'https://www.ibps.in', color: 'orange', desc: 'Bank PO/Clerk exam resources' },
];

const Resources = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExam, setSelectedExam] = useState('neet');
  const [search, setSearch] = useState('');

  const filteredNotes = STUDY_NOTES.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (url, name) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Study Resources</div>
          <div className="section-desc">Syllabi, Previous Year Papers, and Study Materials</div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" style={{ paddingLeft: 36, width: 220 }} placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Exam Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {['neet', 'jee', 'upsc', 'tnpsc'].map(e => (
          <button key={e} className={`topic-chip ${selectedExam === e ? 'active' : ''}`}
            onClick={() => setSelectedExam(e)} style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
            {e}
          </button>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {RESOURCE_TABS.map((t, i) => (
          <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
            {t}
          </button>
        ))}
      </div>

      {/* Syllabus PDFs */}
      {activeTab === 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {(SYLLABUS_LINKS[selectedExam] || SYLLABUS_LINKS.neet).map((item, i) => (
              <div key={i} className="resource-item" onClick={() => handleDownload(item.url, item.name)}>
                <div className="resource-icon-wrap" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <FileText size={18} color="var(--neon-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.subject} • Official PDF</div>
                </div>
                <button className="btn btn-primary btn-sm">
                  <Download size={13} /> Download
                </button>
              </div>
            ))}
          </div>

          {/* Official Portals */}
          <div className="section-title" style={{ fontSize: '1rem', marginBottom: 14 }}>Official Exam Portals</div>
          <div className="grid-2">
            {OFFICIAL_LINKS.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
                className={`card card-glow-${link.color}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <ExternalLink size={15} color={`var(--neon-${link.color === 'orange' ? 'primary' : link.color})`} />
                  <span className={`badge badge-${link.color === 'orange' ? 'orange' : link.color}`}>Official</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{link.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{link.desc}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Previous Year Papers */}
      {activeTab === 1 && (
        <div>
          <div style={{ marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Question papers sourced from official NTA/UPSC portals. Click to download from official website.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(PYQ_LINKS[selectedExam] || PYQ_LINKS.neet).map((item, i) => (
              <div key={i} className="resource-item" onClick={() => window.open(item.url, '_blank')}>
                <div className="resource-icon-wrap" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <BookOpen size={18} color="var(--neon-purple)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Year: {item.year} • Official Question Paper</div>
                </div>
                <button className="btn btn-purple btn-sm">
                  <ExternalLink size={13} /> Open Portal
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(59,130,246,0.06)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--neon-blue)', marginBottom: 6 }}>Where to find more papers?</div>
            <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 2 }}>
              <li>NTA official site: <a href="https://nta.ac.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)' }}>nta.ac.in</a></li>
              <li>UPSC: <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)' }}>upsc.gov.in/examinations/previous-question-papers</a></li>
              <li>JEE Advanced: <a href="https://jeeadv.ac.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)' }}>jeeadv.ac.in</a></li>
              <li>TNPSC: <a href="https://www.tnpsc.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)' }}>tnpsc.gov.in</a></li>
            </ul>
          </div>
        </div>
      )}

      {/* Study Notes */}
      {activeTab === 2 && (
        <div>
          <div className="grid-2">
            {filteredNotes.map((note, i) => (
              <div key={i} className={`card card-glow-${note.color}`} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                    background: `rgba(${note.color === 'orange' ? '249,115,22' : note.color === 'blue' ? '59,130,246' : note.color === 'green' ? '16,185,129' : note.color === 'purple' ? '168,85,247' : '6,182,212'},0.12)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid rgba(${note.color === 'orange' ? '249,115,22' : note.color === 'blue' ? '59,130,246' : note.color === 'green' ? '16,185,129' : note.color === 'purple' ? '168,85,247' : '6,182,212'},0.2)`,
                  }}>
                    <FileText size={18} color={`var(--neon-${note.color === 'orange' ? 'primary' : note.color})`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{note.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge badge-${note.color === 'orange' ? 'orange' : note.color}`}>{note.category}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{note.size}</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 14, width: '100%' }}>
                  <Download size={13} /> Download Note
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
