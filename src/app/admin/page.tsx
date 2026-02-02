"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [formData, setFormData] = useState({
    quote: "",
    reference: "",
    insight: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editorial-card" style={{ textAlign: 'left' }}>
      <div className="date-ornament" style={{ justifyContent: 'flex-start' }}>The Registry</div>
      <h1 className="logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Publish Insight</h1>
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

        <div style={{ marginTop: '4rem' }}>
          <button type="submit" className="btn-editorial" disabled={loading}>
            {loading ? "Registering..." : "Commit to Archive"}
          </button>
        </div>
      </form>
    </div>
  );
}
