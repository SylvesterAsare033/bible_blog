import mongoose, { Schema, model, models } from 'mongoose';

export interface IPost {
  quote: string;
  insight: string;
  remember?: string;
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
