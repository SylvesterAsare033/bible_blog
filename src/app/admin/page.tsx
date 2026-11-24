"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Post {
  _id: string;
  quote: string;
  reference: string;
  insight: string;
  remember?: string;
  prayer?: string;
  imageVersion?: number;
  date: string;
  likes?: number;
}

/**
 * Resizes an image in the browser to at most 1200px wide and re-encodes it as
 * JPEG, keeping it small enough for WhatsApp link previews (~300 KB max).
 */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs onto white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.85;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  // base64 is ~4/3 the byte size; step quality down until under ~280 KB.
  while (dataUrl.length * 0.75 > 280 * 1024 && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

export default function Admin() {
  const [formData, setFormData] = useState({
    quote: "",
    reference: "",
    insight: "",
    remember: "",
    prayer: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Image state: a newly picked image (data URL), the preview shown, and
  // whether the existing image should be removed on save.
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const resetImage = () => {
    setImageData(null);
    setImagePreview(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setProcessingImage(true);
    setError("");
    try {
      const dataUrl = await compressImage(file);
      setImageData(dataUrl);
      setImagePreview(dataUrl);
      setRemoveImage(false);
    } catch (err) {
      console.error(err);
      setError("Could not read that image. Try a JPEG or PNG.");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      remember: post.remember || "",
      prayer: post.prayer || "",
      date: new Date(post.date).toISOString().split('T')[0]
    });
    setImageData(null);
    setRemoveImage(false);
    setImagePreview(
      post.imageVersion ? `/api/posts/${post._id}/image?v=${post.imageVersion}` : null
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      quote: "",
      reference: "",
      insight: "",
      remember: "",
      prayer: "",
      date: new Date().toISOString().split('T')[0]
    });
    resetImage();
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...formData,
        ...(editingId && { _id: editingId }),
        ...(imageData && { imageData }),
        ...(editingId && removeImage && !imageData && { removeImage: true }),
      };

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
            <label className="form-label-editorial">Call to Remembrance (Optional)</label>
            <input 
              className="input-editorial"
              value={formData.remember}
              onChange={(e) => setFormData({...formData, remember: e.target.value})}
              placeholder="A short takeaway or reminder..."
            />
          </div>

          <div className="form-field">
            <label className="form-label-editorial">A Prayer (Optional)</label>
            <textarea 
              className="input-editorial"
              style={{ minHeight: '120px', lineHeight: '1.6' }}
              value={formData.prayer}
              onChange={(e) => setFormData({...formData, prayer: e.target.value})}
              placeholder="Lord, help us to..."
            />
          </div>

          <div className="form-field">
            <label className="form-label-editorial">Feature Image (Optional)</label>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
              Shown at the top of the post and as the preview when shared on WhatsApp. A wide (landscape) image works best.
            </p>
            {imagePreview && (
              <div className="admin-image-preview">
                <img src={imagePreview} alt="Selected feature" />
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                disabled={processingImage}
              />
              {imagePreview && (
                <button type="button" className="btn-secondary-editorial" onClick={handleRemoveImage}>
                  Remove Image
                </button>
              )}
              {processingImage && <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Preparing image…</span>}
            </div>
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
            <button type="submit" className="btn-editorial" disabled={loading || processingImage}>
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
               {post.imageVersion && (
                 <img
                   src={`/api/posts/${post._id}/image?v=${post.imageVersion}`}
                   alt=""
                   style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', marginBottom: '1.5rem' }}
                 />
               )}
               {post.remember && (
                 <p style={{ marginTop: '1rem', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--stone)', opacity: 0.8 }}>
                   <strong>Remember:</strong> {post.remember}
                 </p>
               )}
               <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.5 }}>
                 Likes: {post.likes || 0}
               </div>
            </div>
          ))}
          {posts.length === 0 && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>No insights recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
