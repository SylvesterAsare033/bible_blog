import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import { parseImageFields, toClientPost, ImageError } from '@/lib/postImage';

export const dynamic = 'force-dynamic';

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
    const { imageData, removeImage, ...body } = await request.json();
    const imageFields = parseImageFields({ imageData });
    
    // Ensure the date is stored as a midnight date for consistency
    const postDate = new Date(body.date);
    postDate.setHours(0, 0, 0, 0);
    
    const post = await Post.create({
      ...body,
      ...imageFields,
      date: postDate,
    });
    
    return NextResponse.json(toClientPost(post), { status: 201 });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    if (error instanceof ImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A post already exists for this date.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, imageData, removeImage, ...updateData } = body;
    const imageFields = parseImageFields({ imageData, removeImage });

    if (!_id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Ensure date is midnight if it's being updated
    if (updateData.date) {
        const postDate = new Date(updateData.date);
        postDate.setHours(0, 0, 0, 0);
        updateData.date = postDate;
    }

    const post = await Post.findByIdAndUpdate(_id, { ...updateData, ...imageFields }, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(toClientPost(post));
  } catch (error: any) {
    console.error("PUT /api/posts error:", error);
    if (error instanceof ImageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 11000) {
        return NextResponse.json({ error: 'A post already exists for this date.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
