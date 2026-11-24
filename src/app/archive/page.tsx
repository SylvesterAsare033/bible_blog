"use client";

import { useEffect, useState } from "react";

interface Post {
  _id: string;
  quote: string;
  reference: string;
  date: string;
  imageVersion?: number;
}

// Post dates are stored as midnight UTC, so format them in UTC to avoid
// showing the previous day for readers west of Greenwich.
const fmt = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

function groupByMonth(posts: Post[]) {
  const groups: { month: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const month = fmt(post.date, { month: "long", year: "numeric" });
    const last = groups[groups.length - 1];
    if (last?.month === month) last.posts.push(post);
    else groups.push({ month, posts: [post] });
  }
  return groups;
}

export default function Archive() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Archive | Daily Light";
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

  return (
    <div className="archive">
      <header className="page-head">
        <p className="kicker">The Archive</p>
        <h1 className="page-title">Every reflection</h1>
        <p className="page-lede">
          Each day&rsquo;s verse and reflection, newest first.
        </p>
      </header>

      {loading ? (
        <div className="skeleton" aria-busy="true" style={{ justifyItems: "start" }}>
          <span style={{ width: "8rem" }} />
          <span style={{ width: "100%", height: "1.5rem" }} />
          <span style={{ width: "80%", height: "1.5rem" }} />
        </div>
      ) : posts.length === 0 ? (
        <p className="page-lede">No reflections have been published yet.</p>
      ) : (
        groupByMonth(posts).map(({ month, posts }) => (
          <section key={month} className="archive-month">
            <h2 className="archive-month__title">{month}</h2>
            <ol className="archive-list">
              {posts.map((post) => (
                <li key={post._id} className="archive-entry">
                  <a
                    href={`/?date=${new Date(post.date).toISOString().split("T")[0]}`}
                    className="archive-entry__link"
                  >
                    <span className="archive-entry__date">
                      <span className="archive-entry__day">{fmt(post.date, { day: "numeric" })}</span>
                      <span className="archive-entry__weekday">{fmt(post.date, { weekday: "short" })}</span>
                    </span>
                    <span>
                      <span className="archive-entry__quote">&ldquo;{post.quote}&rdquo;</span>
                      <span className="archive-entry__ref">{post.reference}</span>
                    </span>
                    {post.imageVersion && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="archive-entry__thumb"
                        src={`/api/posts/${post._id}/image?v=${post.imageVersion}`}
                        alt=""
                        loading="lazy"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
