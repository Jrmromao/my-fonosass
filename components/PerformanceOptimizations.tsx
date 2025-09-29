'use client';

import { useEffect, useRef, useState } from 'react';

// Performance optimization utilities
export function usePerformanceOptimizations() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);

      // Preload critical images
      const criticalImages = [
        '/placeholder.svg?height=200&width=400',
        // Add other critical images here
      ];

      criticalImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    // Optimize scroll performance
    const optimizeScroll = () => {
      let ticking = false;

      const updateScroll = () => {
        // Throttle scroll events
        if (!ticking) {
          requestAnimationFrame(() => {
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', updateScroll, { passive: true });
      return () => window.removeEventListener('scroll', updateScroll);
    };

    // Optimize resize performance
    const optimizeResize = () => {
      let resizeTimeout: NodeJS.Timeout;

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Handle resize logic here
        }, 250);
      };

      window.addEventListener('resize', handleResize, { passive: true });
      return () => {
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', handleResize);
      };
    };

    preloadCriticalResources();
    const cleanupScroll = optimizeScroll();
    const cleanupResize = optimizeResize();

    return () => {
      cleanupScroll();
      cleanupResize();
    };
  }, []);
}

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: `${width}px ${height}px`,
      }}
    />
  );
}

// Lazy loading wrapper
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

export function LazyWrapper({
  children,
  fallback = <div className="h-32 bg-gray-100 animate-pulse rounded" />,
  threshold = 0.1,
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}

// Animation performance optimization
export function useOptimizedAnimation() {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Only enable animations after initial load
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return shouldAnimate;
}
