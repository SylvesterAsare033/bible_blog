"use client";

import { useEffect, useState } from "react";
import SocialShare from "@/components/SocialShare";
import VerseModal from "@/components/VerseModal";

interface Post {
  _id: string;
  quote: string;
  insight: string;
  reference: string;
  remember?: string;
  likes?: number;
  date: string;
}

export default function Home() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  const [hasLiked, setHasLiked] = useState(false);

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
          // Check if user has already liked this post
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
          if (likedPosts.includes(data._id)) {
            setHasLiked(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, []);

  const handleLike = async () => {
    if (!post?._id || hasLiked) return;
    
    // Prevent further clicks immediately
    setHasLiked(true);
    
    // Optimistic UI update
    const currentLikes = post.likes || 0;
    setPost({ ...post, likes: currentLikes + 1 });

    // Store in local storage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    likedPosts.push(post._id);
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));

    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      if (!res.ok) {
        // Revert on error
        setPost({ ...post, likes: currentLikes });
        setHasLiked(false);
        const updatedLikedPosts = likedPosts.filter((id: string) => id !== post._id);
        localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
      } else {
        const data = await res.json();
        setPost({ ...post, likes: data.likes });
      }
    } catch (err) {
      console.error("Failed to like post:", err);
      setPost({ ...post, likes: currentLikes });
      setHasLiked(false);
      const updatedLikedPosts = likedPosts.filter((id: string) => id !== post._id);
      localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
    }
  };

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

        {post.remember && (
          <div className="remember-box">
            <span className="remember-label">To Carry With You</span>
            <p className="remember-text">{post.remember}</p>
          </div>
        )}

        <div className="interaction-suite">
          <SocialShare quote={post.quote} reference={post.reference} />
          
          <button 
            className={`like-btn-main ${hasLiked ? 'already-liked' : ''}`} 
            onClick={handleLike} 
            disabled={hasLiked}
            aria-label={hasLiked ? "Already liked" : "Like this insight"}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="like-count">{post.likes || 0}</span>
          </button>
        </div>
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
