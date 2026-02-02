"use client";

import React from 'react';

interface SocialShareProps {
  quote: string;
  reference: string;
  url?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ quote, reference, url }) => {
  const shareText = `"${quote}" — ${reference}`;
  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';

  const shareActions = {
    whatsapp: () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
    },
    twitter: () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
    },
    facebook: () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
    },
    copy: () => {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="share-suite">
      <span className="share-label">Share the light</span>
      
      <button onClick={shareActions.whatsapp} className="share-btn" title="Share on WhatsApp">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.767 5.767 0 1.267.405 2.436 1.096 3.393L6.471 17.828l2.607-.852c.886.529 1.916.832 3.023.832 3.111 0 5.635-2.524 5.635-5.635 0-3.111-2.524-5.635-5.635-5.635l-.07-.001zm.07 10.3c-.947 0-1.832-.276-2.582-.751l-.185-.117-.184.06-1.54.503.49-1.503.06-.184-.117-.185c-.475-.75-.751-1.635-.751-2.582 0-2.617 2.129-4.746 4.746-4.746s4.746 2.129 4.746 4.746-2.129 4.746-4.746 4.746l-.001-.001z"/></svg>
      </button>

      <button onClick={shareActions.twitter} className="share-btn" title="Share on Twitter">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </button>

      <button onClick={shareActions.facebook} className="share-btn" title="Share on Facebook">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
      </button>

      <button onClick={shareActions.copy} className="share-btn" title="Copy Link">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

export default SocialShare;
