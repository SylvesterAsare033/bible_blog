import mongoose, { Schema, model, models } from 'mongoose';

export interface IPost {
  quote: string;
  insight: string;
  remember?: string;
  prayer?: string;
  image?: Buffer;
  imageType?: string;
  imageVersion?: number;
  likes?: number;
  reference: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    quote: {
      type: String,
      required: [true, 'Please provide a quote.'],
    },
    insight: {
      type: String,
      required: [true, 'Please provide your insight.'],
    },
    remember: {
      type: String,
    },
    prayer: {
      type: String,
    },
    // Raw image bytes are never returned by default queries; they are served
    // separately from /api/posts/[id]/image so post lists stay lightweight.
    image: {
      type: Buffer,
      select: false,
    },
    imageType: {
      type: String,
    },
    // Timestamp of the last image change; used for cache-busting and to tell
    // whether a post has an image without loading the bytes.
    imageVersion: {
      type: Number,
    },
    likes: {
      type: Number,
      default: 0,
    },
    reference: {
      type: String,
      required: [true, 'Please provide a reference (e.g. John 3:16).'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date for this post.'],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Post || model<IPost>('Post', PostSchema);
