const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB after decoding

/**
 * Turns the `imageData` / `removeImage` fields sent by the admin form into
 * the fields stored on the Post document. Returns undefined when the request
 * doesn't touch the image.
 */
export function parseImageFields(body: {
  imageData?: string;
  removeImage?: boolean;
}): Record<string, unknown> | undefined {
  if (body.removeImage) {
    return { $unset: { image: 1, imageType: 1, imageVersion: 1 } };
  }
  if (!body.imageData) return undefined;

  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(body.imageData);
  if (!match || !ALLOWED_TYPES.includes(match[1])) {
    throw new ImageError("Image must be a JPEG, PNG or WebP file.");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) {
    throw new ImageError("Image is too large (max 2 MB).");
  }
  return { image: buffer, imageType: match[1], imageVersion: Date.now() };
}

export class ImageError extends Error {}

/** Public URL path of a post's image, versioned so caches refresh on change. */
export function postImagePath(post: { _id: unknown; imageVersion?: number }) {
  return post.imageVersion
    ? `/api/posts/${String(post._id)}/image?v=${post.imageVersion}`
    : undefined;
}

/** Strips the raw image bytes from a document before sending it as JSON. */
export function toClientPost(doc: { toObject?: () => Record<string, unknown> }) {
  const obj = (doc.toObject ? doc.toObject() : doc) as Record<string, unknown>;
  delete obj.image;
  return obj;
}
