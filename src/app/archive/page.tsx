"use client";

import { useEffect, useState } from "react";
import SocialShare from "@/components/SocialShare";

interface Post {
  _id: string;
  quote: string;
  insight: string;
  reference: string;
  date: string;
}

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch archive:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="editorial-card" style={{ opacity: 0.5 }}>
        <p>Consulting the archives...</p>
      </div>
    );
  }

  return (
    <div className="archive-list">
      <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <div className="date-ornament">Chronicles</div>
        <h1 className="logo" style={{ fontSize: '4rem', marginBottom: '1rem' }}>The Archive</h1>
        <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '1.2rem' }}>A treasury of daily reflections and spiritual light.</p>
      </header>
      
      {posts.length === 0 ? (
        <div className="editorial-card">
          <p>The journey has just begun. No records yet.</p>
        </div>
      ) : (
        posts.map((post) => (
          <article key={post._id} className="archive-item">
            <div className="date-ornament" style={{ justifyContent: 'flex-start' }}>
              {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <h2 className="quote-hero" style={{ fontSize: '2.5rem', textAlign: 'left' }}>
              “{post.quote}”
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="scripture-ref" style={{ marginBottom: 0 }}>{post.reference}</span>
              <a href={`/?date=${new Date(post.date).toISOString().split('T')[0]}`} className="share-label" style={{ textDecoration: 'none', color: 'var(--crimson)' }}>View Full →</a>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
