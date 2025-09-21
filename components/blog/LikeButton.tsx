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
  }, [articleId, onLikeChange]);

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
      className={`flex items-center gap-1 text-sm transition-colors ${
        isLiked
          ? 'text-pink-500 hover:text-pink-600'
          : 'text-gray-400 hover:text-pink-500'
      }`}
      aria-label={isLiked ? 'Descurtir artigo' : 'Curtir artigo'}
    >
      <Heart
        className={`w-4 h-4 transition-all ${isLiked ? 'fill-current' : ''}`}
      />
      {likes > 0 && <span className="text-xs font-medium">{likes}</span>}
    </button>
  );
}
