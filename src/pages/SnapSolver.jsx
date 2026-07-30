import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { aiGenerate } from '../services/ai';

const SnapSolver = ({ lang = 'en' }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [solution, setSolution] = useState('');
  const fileInputRef = useRef(null);
  const t = (en, ta) => lang === 'ta' ? ta : en;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setSolution('');
    setLoading(true);

    try {
        // 1. OCR with Tesseract
        setStatus(t('Scanning image (OCR)...', 'படம் ஸ்கேன் செய்யப்படுகிறது...'));
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        const extractedText = text.trim();
        
        if(!extractedText) {
            setSolution("Could not read any text from the image. Please try a clearer picture.");
            setLoading(false);
            return;
        }

        // 2. AI Solve
        setStatus(t('AI analyzing the problem...', 'AI கணக்கை பகுப்பாய்வு செய்கிறது...'));
        const prompt = `Solve this problem step-by-step like a friendly teacher natively in ${lang === 'ta' ? 'Tamil' : 'English'}. Explain each step clearly so a beginner can understand. Problem: "${extractedText}"`;
        
        let rawAnswer = '';
        await aiGenerate(prompt, (_, full) => { rawAnswer = full; setSolution(full); });

    } catch (e) {
        console.error(e);
        setSolution("Error processing the image! " + e.message);
    }
    setLoading(false);
    setStatus('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(6,182,212,0.3)', marginBottom: 0 }}>
         <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Camera size={32} color="var(--neon-cyan)" /> {t('Snap-Solver AI', 'புகைப்பட தீர்வு AI')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 600 }}>
              {t("Stuck on a problem from your book? Just snap a photo. AI will read it and break it down step-by-step for you.", "புத்தகத்தில் கடினமான கணக்கா? புகைப்படம் எடுங்கள். AI அதை உங்களுக்கு படியாக விளக்கும்.")}
            </p>
         </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
          {/* Uploader */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, border: '2px dashed var(--border)', background: 'var(--bg-surface)', textAlign: 'center', minHeight: 300 }}>
              {image ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={image} alt="Problem" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }} />
                      <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}><Upload size={16}/> {t('Upload Different Image', 'வேறு படம் பதிவேற்று')}</button>
                  </div>
              ) : (
                  <>
                      <div style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                          <ImageIcon size={40} color="var(--text-muted)" />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>{t('Upload Problem Image', 'கணக்கை படமாக பதிவேற்று')}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>{t('Clear photos work best for accurate OCR.', 'தெளிவான புகைப்படங்கள் சரியான முடிவுகளை தரும்.')}</p>
                      
                      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                      
                      <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                          <Camera size={20} /> {t('Snap / Upload', 'படம் பிடி / பதிவேற்று')}
                      </button>
                  </>
              )}
          </div>

          {/* Solution Area */}
          <div className="card card-glow-cyan" style={{ display: 'flex', flexDirection: 'column', minHeight: 300 }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} /> {t('AI Step-by-Step Solution', 'AI படி-படியான தீர்வு')}
             </h3>
             
             {loading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Loader2 size={40} color="var(--neon-cyan)" className="spinner" />
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{status}</div>
                </div>
             ) : solution ? (
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', flex: 1, overflowY: 'auto' }}>
                    {solution}
                </div>
             ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {t('Your incredibly detailed solution will appear here.', 'விவரமான தீர்வு இங்கே தோன்றும்.')}
                </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default SnapSolver;
