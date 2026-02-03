"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  quote: string;
  reference: string;
  insight: string;
  date: string;
}

export default function Admin() {
  const [formData, setFormData] = useState({
    quote: "",
    reference: "",
    insight: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post._id);
    setFormData({
      quote: post.quote,
      reference: post.reference,
      insight: post.insight,
      date: new Date(post.date).toISOString().split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      quote: "",
      reference: "",
      insight: "",
      date: new Date().toISOString().split('T')[0]
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...formData, _id: editingId } : formData;

      const res = await fetch("/api/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      if (editingId) {
          // Update local list
          setPosts(posts.map(p => p._id === editingId ? data : p));
          cancelEdit(); // Reset form
          alert("Post updated successfully!");
      } else {
           // Add to top of list
           setPosts([data, ...posts]);
           // Reset form but keep date for convenience or reset? Let's reset.
           cancelEdit();
           alert("Post created successfully!");
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="editorial-card" style={{ textAlign: 'left', marginBottom: '4rem' }}>
        <div className="date-ornament" style={{ justifyContent: 'flex-start' }}>The Registry</div>
        <h1 className="logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {editingId ? "Edit Insight" : "Publish Insight"}
        </h1>
        <p style={{ opacity: 0.6, marginBottom: '4rem', fontStyle: 'italic' }}>Capture the eternal wisdom for today's generation.</p>
        
        {error && (
          <div style={{ color: 'var(--crimson)', marginBottom: '3rem', fontWeight: 600 }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label-editorial">The Holy Word (Quote)</label>
            <input 
              className="input-editorial"
              required
              value={formData.quote}
              onChange={(e) => setFormData({...formData, quote: e.target.value})}
              placeholder="Enter the scripture text..."
            />
          </div>

          <div className="form-field">
            <label className="form-label-editorial">Scripture Reference</label>
            <input 
              className="input-editorial"
              required
              value={formData.reference}
              onChange={(e) => setFormData({...formData, reference: e.target.value})}
              placeholder="e.g. Genesis 1:1"
            />
          </div>

          <div className="form-field">
            <label className="form-label-editorial">Reflections & Depth (Insight)</label>
            <textarea 
              className="input-editorial"
              required
              style={{ minHeight: '150px', lineHeight: '1.6' }}
              value={formData.insight}
              onChange={(e) => setFormData({...formData, insight: e.target.value})}
              placeholder="Share the revelation..."
            />
          </div>

          <div className="form-field">
            <label className="form-label-editorial">Publication Date</label>
            <input 
              type="date"
              className="input-editorial"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div style={{ marginTop: '4rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-editorial" disabled={loading}>
              {loading ? "Saving..." : (editingId ? "Update Insight" : "Commit to Archive")}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="btn-editorial" 
                style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink-light)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="editorial-card" style={{ textAlign: 'left' }}>
        <h2 className="logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Archive</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {posts.map((post) => (
            <div key={post._id} className="admin-archive-item">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <span className="date-ornament" style={{ fontSize: '0.8rem' }}>
                      {new Date(post.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>{post.reference}</h3>
                  </div>
                  <button 
                    onClick={() => handleEdit(post)}
                    className="btn-secondary-editorial"
                  >
                    Edit
                  </button>
               </div>
               <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', opacity: 0.8, fontSize: '1.1rem', color: 'var(--gold)' }}>"{post.quote}"</p>
               <p style={{ fontSize: '1rem', lineHeight: '1.7', opacity: 0.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                 {post.insight}
               </p>
            </div>
          ))}
          {posts.length === 0 && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No insights recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
