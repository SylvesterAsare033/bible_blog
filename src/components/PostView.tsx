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
  prayer?: string;
  imageVersion?: number;
  likes?: number;
  date: string;
}

// Matches references like "John 3:16", "1 Corinthians 13:4-7".
const VERSE_REGEX = /(\b(?:[123]\s)?[A-Z][a-z]+\s\d{1,3}:\d{1,3}(?:-\d{1,3})?\b)/;

export default function PostView() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);

  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get("date");
        const targetDate = dateParam || new Date().toISOString().split("T")[0];

        const res = await fetch(`/api/posts?date=${targetDate}`);
        const data = await res.json();

        if (data && !data.error) {
          setPost(data);
          // Check if user has already liked this post
          const likedPosts = JSON.parse(
            localStorage.getItem("likedPosts") || "[]",
          );
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

  useEffect(() => {
    document.title = post
      ? `${post.quote} | Daily Light`
      : "Daily Light | Bible Blog";
  }, [post]);

  const handleLike = async () => {
    if (!post?._id || hasLiked) return;

    // Prevent further clicks immediately
    setHasLiked(true);

    // Optimistic UI update
    const currentLikes = post.likes || 0;
    setPost({ ...post, likes: currentLikes + 1 });

    // Store in local storage
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    likedPosts.push(post._id);
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));

    try {
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        // Revert on error
        setPost({ ...post, likes: currentLikes });
        setHasLiked(false);
        const updatedLikedPosts = likedPosts.filter(
          (id: string) => id !== post._id,
        );
        localStorage.setItem("likedPosts", JSON.stringify(updatedLikedPosts));
      } else {
        const data = await res.json();
        setPost({ ...post, likes: data.likes });
      }
    } catch (err) {
      console.error("Failed to like post:", err);
      setPost({ ...post, likes: currentLikes });
      setHasLiked(false);
      const updatedLikedPosts = likedPosts.filter(
        (id: string) => id !== post._id,
      );
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikedPosts));
    }
  };

  if (loading) {
    return (
      <div className="skeleton" aria-busy="true" aria-label="Loading today's reflection">
        <span style={{ width: "10rem" }} />
        <span style={{ width: "90%", height: "2.5rem" }} />
        <span style={{ width: "70%", height: "2.5rem" }} />
        <span style={{ width: "8rem" }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="state">
        <p className="kicker">A quiet day</p>
        <h1 className="state__title">There&rsquo;s no reflection for this day yet.</h1>
        <p className="state__text">
          Browse earlier reflections in <a href="/archive">the archive</a>.
        </p>
      </div>
    );
  }

  const isoDate = new Date(post.date).toISOString().split("T")[0];
  const paragraphs = post.insight.split(/\n+/).filter((p) => p.trim());
  const prayerLines = post.prayer?.split(/\n+/).filter((p) => p.trim()) ?? [];

  return (
    <>
      <article className="post">
        <header className="post__header">
          <p className="kicker">
            <time dateTime={isoDate}>
              {new Date(post.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </p>
          <h1 className="post__verse">{post.quote}</h1>
          <p className="post__ref">{post.reference}</p>
        </header>

        {post.imageVersion ? (
          <figure className="post__hero">
            <img
              src={`/api/posts/${post._id}/image?v=${post.imageVersion}`}
              alt={`Illustration for ${post.reference}`}
            />
          </figure>
        ) : (
          <hr className="post__divider" />
        )}

        <div className="post__body prose">
          {paragraphs.map((para, i) => {
            const parts = para.split(VERSE_REGEX);
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <button
                      key={j}
                      type="button"
                      className="verse-link"
                      onClick={() => setSelectedVerse(part)}
                    >
                      {part}
                    </button>
                  ) : (
                    part
                  ),
                )}
              </p>
            );
          })}
        </div>

        {post.remember && (
          <aside className="post__takeaway">
            <p className="label">To carry with you</p>
            <p className="post__takeaway-text">{post.remember}</p>
          </aside>
        )}

        {prayerLines.length > 0 && (
          <section className="post__prayer" aria-label="Prayer">
            <h2 className="label">A prayer</h2>
            {prayerLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>
        )}

        <footer className="post__actions">
          <SocialShare
            quote={post.quote}
            reference={post.reference}
            url={`${window.location.origin}/?date=${isoDate}`}
          />
          <button
            type="button"
            className={`like-btn ${hasLiked ? "is-liked" : ""}`}
            onClick={handleLike}
            disabled={hasLiked}
            aria-label={hasLiked ? "You liked this reflection" : "Like this reflection"}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{post.likes || 0}</span>
          </button>
        </footer>

        <p className="post__more">
          <a href="/archive">Read earlier reflections →</a>
        </p>
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
