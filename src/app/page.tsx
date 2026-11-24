import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import { postImagePath } from "@/lib/postImage";
import PostView from "@/components/PostView";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string }> };

/**
 * Builds per-post Open Graph tags on the server so link previews
 * (WhatsApp, Facebook, X, etc.) show the post's quote and image.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { date } = await searchParams;
  const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "")
    ? date!
    : new Date().toISOString().split("T")[0];

  try {
    await dbConnect();
    const post = await Post.findOne({ date: new Date(targetDate) }).lean<{
      _id: unknown;
      quote: string;
      reference: string;
      insight: string;
      imageVersion?: number;
    }>();
    if (!post) return {};

    const title = `“${post.quote}” — ${post.reference}`;
    const description = post.insight.replace(/\s+/g, " ").slice(0, 200);
    const image = postImagePath(post);
    const url = `/?date=${targetDate}`;

    return {
      title: { absolute: `${post.reference} | Daily Light` },
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title,
        description,
        siteName: "Daily Light",
        ...(image && {
          images: [{ url: image, width: 1200, alt: post.reference }],
        }),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch (error) {
    console.error("generateMetadata error:", error);
    return {};
  }
}

export default function Home() {
  return <PostView />;
}
