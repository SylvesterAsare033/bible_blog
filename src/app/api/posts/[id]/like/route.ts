import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: post.likes });
  } catch (error: any) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
