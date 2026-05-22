import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET = 'fonosapp';
const BLOG_PREFIX = 'blog/posts/';
const IMAGE_PREFIX = 'blog/images/';

export interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  authorRole?: string;
  authorInstagram?: string;
  tags: string[];
  featuredImage?: string;
  readingTime?: number;
  featured?: boolean;
  seo?: { title: string; description: string; keywords: string[] };
}

export async function getAllPostsFromS3(): Promise<BlogPostData[]> {
  try {
    const { Contents } = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: BLOG_PREFIX,
      })
    );

    if (!Contents || Contents.length === 0) return [];

    const posts = await Promise.all(
      Contents.filter((obj) => obj.Key?.endsWith('.json')).map(async (obj) => {
        const { Body } = await s3.send(
          new GetObjectCommand({ Bucket: BUCKET, Key: obj.Key! })
        );
        const text = await Body!.transformToString();
        return JSON.parse(text) as BlogPostData;
      })
    );

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    console.error('Error fetching posts from S3:', error);
    return [];
  }
}

export async function getPostFromS3(
  slug: string
): Promise<BlogPostData | null> {
  try {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: `${BLOG_PREFIX}${slug}.json`,
      })
    );
    const text = await Body!.transformToString();
    return JSON.parse(text) as BlogPostData;
  } catch {
    return null;
  }
}

export async function savePostToS3(post: BlogPostData): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${BLOG_PREFIX}${post.slug}.json`,
      Body: JSON.stringify(post),
      ContentType: 'application/json',
    })
  );
}

export async function saveBlogImageToS3(
  slug: string,
  imageBuffer: Buffer
): Promise<string> {
  const key = `${IMAGE_PREFIX}${slug}.png`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
    })
  );
  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}
