'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

interface LikeButtonProps {
  articleId: string;
  initialLikes?: number;
}

export default function LikeButton({
  articleId,
  initialLikes = 0,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setIsLiked(!isLiked);

    // Here you could save to localStorage or send to API
    // localStorage.setItem(`liked-${articleId}`, (!isLiked).toString());
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
