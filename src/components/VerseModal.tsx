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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!reference) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verse-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="kicker">Scripture</p>
        <h3 className="modal__title" id="verse-modal-title">{reference}</h3>

        <select
          className="modal-select"
          aria-label="Bible translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
        >
          {VERSIONS.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <div className="modal__body">
          {loading ? (
            <p className="modal__status">Loading…</p>
          ) : error ? (
            <p className="modal__status is-error">{error}</p>
          ) : (
            <p className="verse-text">{verseText.trim()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerseModal;
