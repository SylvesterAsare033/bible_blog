"use client";

import React, { useState, useEffect } from 'react';

interface VerseModalProps {
  reference: string | null;
  onClose: () => void;
}

const VERSIONS = [
  { id: 'web', name: 'World English Bible (WEB)' },
  { id: 'kjv', name: 'King James Version (KJV)' },
  { id: 'asv', name: 'American Standard Version (ASV)' },
  { id: 'bbe', name: 'Bible in Basic English (BBE)' },
  { id: 'darby', name: 'Darby Bible (DARBY)' },
  { id: 'dra', name: 'Douay-Rheims 1899 American Edition (DRA)' },
  { id: 'ylt', name: 'Young\'s Literal Translation (YLT)' },
  { id: 'almeida', name: 'João Ferreira de Almeida (Portuguese)' },
  { id: 'rccv', name: 'Romanian Corrected Cornilescu Version (Romanian)' },
  { id: 'clementine', name: 'Clementine Latin Vulgate (Latin)' },
  { id: 'cherokee', name: 'Cherokee New Testament (Cherokee)' },
];

const VerseModal: React.FC<VerseModalProps> = ({ reference, onClose }) => {
  const [verseText, setVerseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [translation, setTranslation] = useState<string>("web");

  useEffect(() => {
    if (reference) {
      setLoading(true);
      setError("");
      setVerseText("");
      
      // Fetch from bible-api.com with translation
      fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }
          setVerseText(data.text);
        })
        .catch(err => {
          console.error("Failed to fetch verse:", err);
          setError(err.message || "Could not retrieve this scripture. Please check your connection or try another version.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [reference, translation]);

  if (!reference) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="date-ornament" style={{ marginBottom: '0.5rem', color: 'var(--gold)' }}>The Living Word</div>
        <h3 className="modal-title">{reference}</h3>
        
        <div style={{ margin: '1rem 0' }}>
            <select 
                className="modal-select"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
            >
                {VERSIONS.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                ))}
            </select>
        </div>

        <div className="divider-gold" style={{ margin: '1rem auto 2rem', width: '60px' }}></div>
        
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '1rem' }}>
          {loading ? (
            <p className="loading-text">Seeking the Word...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <p className="verse-text" style={{ textAlign: 'left', fontWeight: 400, fontStyle: 'normal' }}>
                {verseText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerseModal;
