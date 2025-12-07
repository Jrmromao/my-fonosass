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
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-all duration-200 ${
        isLiked
          ? 'text-pink-600 bg-pink-50 hover:bg-pink-100'
          : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={isLiked ? 'Descurtir artigo' : 'Curtir artigo'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-current scale-110' : 'hover:scale-105'
        }`}
      />
      {likes > 0 && (
        <span className="text-xs font-medium min-w-[1rem] text-center">
          {likes}
        </span>
      )}
    </button>
  );
}
