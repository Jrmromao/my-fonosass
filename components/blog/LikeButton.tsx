'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LikeButtonProps {
  articleId: string;
  initialLikes?: number;
  onLikeChange?: (likes: number, isLiked: boolean) => void;
}

export default function LikeButton({
  articleId,
  initialLikes = 0,
  onLikeChange,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial like status
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const response = await fetch(`/api/blog/${articleId}/like`);
        if (response.ok) {
          const data = await response.json();
          setLikes(data.likeCount);
          setIsLiked(data.isLiked);
          onLikeChange?.(data.likeCount, data.isLiked);
        }
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    };

    loadLikeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]); // onLikeChange intentionally excluded to prevent infinite loop

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/blog/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress: null, // Will be detected server-side
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likeCount);
        setIsLiked(data.liked);
        onLikeChange?.(data.likeCount, data.liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2 ${
        isLiked
          ? 'bg-coral-50 text-coral-800'
          : 'text-neutral-600 hover:bg-violet-50 hover:text-coral-800'
      } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      aria-label={isLiked ? 'Descurtir artigo' : 'Curtir artigo'}
      aria-pressed={isLiked}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
        aria-hidden
      />
      {likes > 0 && (
        <span className="min-w-[1rem] text-center text-xs">{likes}</span>
      )}
    </button>
  );
}
