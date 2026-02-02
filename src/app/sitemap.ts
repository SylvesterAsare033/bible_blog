import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dailylight.blog';

  // Static routes
  const routes = [
    '',
    '/archive',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Dynamic posts
  let posts: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    // Fetch last 100 posts for sitemap
    const postDocs = await Post.find({}).sort({ date: -1 }).limit(100).lean();
    
    posts = postDocs.map((post: any) => ({
      url: `${baseUrl}/?date=${new Date(post.date).toISOString().split('T')[0]}`,
      lastModified: new Date(post.updatedAt || post.date),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return [...routes, ...posts];
}
