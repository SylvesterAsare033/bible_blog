import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const post = await Post.findOne({ date: new Date(date) });
      return NextResponse.json(post || { error: 'No post found for this date' });
    }

    const posts = await Post.find({}).sort({ date: -1 });
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Ensure the date is stored as a midnight date for consistency
    const postDate = new Date(body.date);
    postDate.setHours(0, 0, 0, 0);
    
    const post = await Post.create({
      ...body,
      date: postDate,
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A post already exists for this date.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
