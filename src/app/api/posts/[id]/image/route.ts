import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const post = await Post.findById(id).select('+image imageType').lean<{
      image?: { buffer: ArrayBuffer } | Buffer;
      imageType?: string;
    }>();

    if (!post?.image) {
      return new Response('Not found', { status: 404 });
    }

    // lean() returns a BSON Binary; normalise to a Buffer.
    const raw = post.image as any;
    const bytes: Buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw.buffer);

    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': post.imageType || 'image/jpeg',
        'Content-Length': String(bytes.length),
        // URLs carry ?v=<imageVersion>, so a changed image gets a new URL.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('GET /api/posts/[id]/image error:', error);
    return new Response('Error loading image', { status: 500 });
  }
}
