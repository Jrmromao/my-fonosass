'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BalloonLightweightProps {
  className?: string;
}

export default function BalloonLightweight({
  className = '',
}: BalloonLightweightProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl relative overflow-hidden ${className}`}
    >
      {/* Static balloon elements for better performance */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-12 h-16 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full relative"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            >
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-300 rounded-full"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-pink-300"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to action overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Ver Exercícios Interativos
        </motion.button>
      </div>
    </div>
  );
}
