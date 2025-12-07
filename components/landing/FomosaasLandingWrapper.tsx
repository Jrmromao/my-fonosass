import { BlogPost } from '@/lib/blog';
import FomosaasLanding from './FomosaasLanding';

export default function FomosaasLandingWrapper() {
  // Temporarily disable blog posts to fix build issue
  const featuredBlogPosts: BlogPost[] = [];

  return <FomosaasLanding featuredBlogPosts={featuredBlogPosts} />;
}
