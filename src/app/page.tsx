"use client";

import { useEffect, useState } from "react";
import SocialShare from "@/components/SocialShare";
import VerseModal from "@/components/VerseModal";

interface Post {
  quote: string;
  insight: string;
  reference: string;
  date: string;
}

export default function Home() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date');
        const targetDate = dateParam || new Date().toISOString().split('T')[0];
        
        const res = await fetch(`/api/posts?date=${targetDate}`);
        const data = await res.json();
        
        if (data && !data.error) {
          setPost(data);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, []);

  if (loading) {
    return (
      <div className="editorial-card" style={{ opacity: 0.5 }}>
        <p>Gathering illumination...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="editorial-card">
        <div className="date-ornament">Silence</div>
        <h1 className="quote-hero">A quiet moment of reflection awaits.</h1>
        <p className="scripture-ref">No insight found for this day.</p>
        <div className="divider-gold"></div>
        <div style={{ marginTop: '2rem' }}>
          <a href="/admin" className="btn-editorial">Create First Post</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <article className="editorial-card">
        <div className="date-ornament">
          {new Date(post.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <h1 className="quote-hero">
          “{post.quote}”
        </h1>
        
        <span className="scripture-ref">{post.reference}</span>
        
        <div className="divider-gold"></div>
        
        <div className="insight-body">
          {post.insight.split('\n').map((para, i) => {
              const verseRegex = /(\b(?:[123]\s)?[A-Z][a-z]+\s\d{1,3}:\d{1,3}(?:-\d{1,3})?\b)/g;
              const parts = para.split(verseRegex);
              return (
                <p key={i}>
                  {parts.map((part, j) => {
                    if (part.match(verseRegex)) {
                      return (
                        <span 
                          key={j} 
                          className="scripture-highlight"
                          onClick={() => setSelectedVerse(part)}
                        >
                          {part}
                        </span>
                      );
                    }
                    return part;
                  })}
                </p>
              );
          })}
        </div>

        <SocialShare quote={post.quote} reference={post.reference} />
      </article>

      {selectedVerse && (
        <VerseModal 
          reference={selectedVerse} 
          onClose={() => setSelectedVerse(null)} 
        />
      )}
    </>
  );
}
