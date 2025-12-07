import { balloonColors, phonemes } from '@/components/Balloon/constants';
import {
  Balloon,
  BalloonFieldProps,
  Fragment,
} from '@/components/Balloon/types';
import SignupDialog from '@/components/dialogs/SignupDialog';
import PhonemeDialog from '@/components/dialogs/phonemeDialog';
import { getActivitiesByPhoneme } from '@/lib/actions/activity.action';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { ActivityWithFiles } from '@/types/activity';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

// Performance constants
const PERFORMANCE_CONFIG = {
  MAX_FRAGMENTS_PER_FRAME: 100,
  MAX_FRAGMENTS_TOTAL: 500,
  BALLOON_UPDATE_BATCH_SIZE: 6,
  FRAGMENT_CLEANUP_INTERVAL: 1000,
  ANIMATION_FRAME_SKIP_THRESHOLD: 100,
  HIT_DETECTION_GRID_SIZE: 100,
  CACHED_GRADIENTS: new Map<string, CanvasGradient>(),
  CACHED_PATHS: new Map<string, Path2D>(),
};

const BalloonField: React.FC<BalloonFieldProps> = ({
  balloonCount = 20, // Reduced from 23 to 20 for better performance
  title = 'Phoneme Pop!',
  description = 'Pop balloons to learn phonemes',
  onBalloonPopped,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Performance optimization refs
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const hitDetectionGridRef = useRef<Map<string, Balloon[]>>(new Map());
  const cachedGradientsRef = useRef<Map<string, CanvasGradient>>(new Map());
  const cachedPathsRef = useRef<Map<string, Path2D>>(new Map());

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<string>('');
  const [poppedBalloonId, setPoppedBalloonId] = useState<number | null>(null);
  const [activePhoneme, setActivePhoneme] = useState<string>('');

  const [draggingBalloonId, setDraggingBalloonId] = useState<number | null>(
    null
  );
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickBalloonId, setLastClickBalloonId] = useState<number | null>(
    null
  );

  const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null
  );
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const router = useRouter();

  // Authentication state
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  // Memoized constants for better performance
  const memoizedConstants = useMemo(
    () => ({
      leftBalloonCount: 10,
      rightBalloonCount: 10,
      totalBalloons: 20,
      safePhonemes:
        phonemes.length >= 20
          ? phonemes
          : [...phonemes, ...phonemes].slice(0, 20),
      heightSections: 4,
    }),
    []
  );

  // Optimized color shading function with caching
  const shadeColor = useCallback((color: string, percent: number): string => {
    const cacheKey = `${color}-${percent}`;
    if (PERFORMANCE_CONFIG.CACHED_GRADIENTS.has(cacheKey)) {
      return PERFORMANCE_CONFIG.CACHED_GRADIENTS.get(cacheKey) as any;
    }

    const R = parseInt(color.substring(1, 3), 16);
    const G = parseInt(color.substring(3, 5), 16);
    const B = parseInt(color.substring(5, 7), 16);

    const newR = Math.min(
      255,
      Math.max(0, Math.round(R * (1 + percent / 100)))
    );
    const newG = Math.min(
      255,
      Math.max(0, Math.round(G * (1 + percent / 100)))
    );
    const newB = Math.min(
      255,
      Math.max(0, Math.round(B * (1 + percent / 100)))
    );

    const result = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    PERFORMANCE_CONFIG.CACHED_GRADIENTS.set(cacheKey, result as any);
    return result;
  }, []);

  // Optimized overlap checking with spatial partitioning
  const checkOverlap = useCallback(
    (balloon1: Balloon, balloon2: Balloon): boolean => {
      const dx = balloon1.x - balloon2.x;
      const dy = balloon1.y - balloon2.y;
      const distanceSquared = dx * dx + dy * dy; // Avoid sqrt for performance

      const size1 = 50 * balloon1.size;
      const size2 = 50 * balloon2.size;
      const maxOverlapSquared = Math.pow((size1 + size2) * 0.3, 2);

      return distanceSquared < maxOverlapSquared;
    },
    []
  );

  // Performance optimization: Cache gradients and reduce calculations
  const gradientCache = useRef<Map<string, CanvasGradient>>(new Map());
  const spatialGridRef = useRef<Map<string, Balloon[]>>(new Map());

  // Optimized position finding with spatial grid
  const findValidPosition = useCallback(
    (
      balloons: Balloon[],
      widthRange: [number, number],
      heightRange: [number, number],
      maxAttempts: number = 30
    ): { x: number; y: number } => {
      let x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
      let y =
        heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      let isValid = false;
      let attempts = 0;

      while (!isValid && attempts < maxAttempts) {
        x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
        y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

        isValid = true;

        // Use spatial partitioning for faster collision detection
        const gridX = Math.floor(
          x / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );
        const gridY = Math.floor(
          y / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );

        // Check only nearby balloons
        for (let gx = gridX - 1; gx <= gridX + 1; gx++) {
          for (let gy = gridY - 1; gy <= gridY + 1; gy++) {
            const gridKey = `${gx},${gy}`;
            const nearbyBalloons =
              hitDetectionGridRef.current.get(gridKey) || [];

            for (const balloon of nearbyBalloons) {
              const dx = balloon.x - x;
              const dy = balloon.y - y;
              const distanceSquared = dx * dx + dy * dy;

              if (distanceSquared < 10000) {
                // Only check close balloons
                const tempBalloon: Balloon = {
                  id: -1,
                  x,
                  y,
                  vx: 0,
                  vy: 0,
                  radius: 0.7 + Math.random() * 0.5,
                  color: '',
                  size: 0.7 + Math.random() * 0.5,
                  popped: false,
                  floatPhase: 0,
                  floatSpeed: 0,
                  floatAmount: 0,
                  rotation: 0,
                  stringLength: 0,
                  hovering: false,
                  pressing: false,
                  anchorGroup: 'left',
                  phoneme: '',
                  zIndex: 0,
                  isDragging: false,
                  // Animation properties
                  rotationPhase: 0,
                  rotationSpeed: 0,
                  scalePhase: 0,
                  scaleSpeed: 0,
                  scaleAmount: 0,
                  swayPhase: 0,
                  swaySpeed: 0,
                  swayAmount: 0,
                  colorPhase: 0,
                  colorSpeed: 0,
                };

                if (checkOverlap(tempBalloon, balloon)) {
                  isValid = false;
                  break;
                }
              }
            }
            if (!isValid) break;
          }
          if (!isValid) break;
        }

        attempts++;
      }

      return { x, y };
    },
    [checkOverlap]
  );

  // Performance settings based on device
  const performanceSettings = useMemo(() => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    return {
      maxFragmentsPerFrame: isMobile ? 8 : isLowEnd ? 12 : 20,
      balloonUpdateBatchSize: isMobile ? 3 : isLowEnd ? 4 : 6,
      animationFrameRate: isMobile ? 30 : 60,
      cleanupInterval: isMobile ? 500 : 1000,
    };
  }, []);

  // Function to validate if user has a valid account
  const isValidUser = useCallback(() => {
    if (!isLoaded) return false;
    if (!isSignedIn) return false;
    if (!user) return false;
    if (!user.firstName || !user.lastName) return false;
    if (user.emailAddresses?.[0]?.verification?.status !== 'verified')
      return false;
    return true;
  }, [isLoaded, isSignedIn, user]);

  // Optimized file download handler
  const handleFileDownload = useCallback(
    async (fileId: string, fileName: string) => {
      try {
        setDownloadingFileId(fileId);
        setDownloadError(null);

        const result = await getFileDownloadUrl({ fileId });

        if (result.success && result.url) {
          const link = document.createElement('a');
          link.href = result.url;
          const safeFileName = fileName || `activity-${fileId}.pdf`;
          link.setAttribute('download', safeFileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloadSuccess(fileId);
          setTimeout(() => setDownloadSuccess(null), 2000);
        } else {
          setDownloadError(fileId);
          setTimeout(() => setDownloadError(null), 3000);
        }
      } catch (error) {
        console.error('Download failed:', error);
        setDownloadError(fileId);
        setTimeout(() => setDownloadError(null), 3000);
      } finally {
        setDownloadingFileId(null);
      }
    },
    []
  );

  // Optimized activity fetching
  const handleAppleClick = useCallback((phoneme: string) => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await getActivitiesByPhoneme({
          phoneme,
          includePrivate: false,
          limit: 5,
        });
        setActivities(result.items as unknown as ActivityWithFiles[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  // Optimized balloon creation
  const createBalloon = useCallback((id: number): Balloon => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Balloon;

    const colors = balloonColors;
    const color = colors[id % colors.length];
    const phoneme = phonemes[id % phonemes.length];

    return {
      id,
      x:
        Math.random() * (canvas.width / (window.devicePixelRatio || 1)) * 0.8 +
        50,
      y:
        Math.random() * (canvas.height / (window.devicePixelRatio || 1)) * 0.6 +
        50,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: 25 + Math.random() * 15,
      color,
      size: 0.8 + Math.random() * 0.4,
      popped: false,
      popTime: 0,
      fragments: [],
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: 0.02 + Math.random() * 0.01,
      floatAmount: 2 + Math.random() * 2,
      rotation: Math.random() * Math.PI * 2,
      stringLength: 0,
      hovering: false,
      pressing: false,
      anchorGroup: 'left' as const,
      phoneme,
      zIndex: 0,
      isDragging: false,
      rotationPhase: Math.random() * Math.PI * 2,
      rotationSpeed: 0.01 + Math.random() * 0.005,
      scalePhase: Math.random() * Math.PI * 2,
      scaleSpeed: 0.01 + Math.random() * 0.005,
      scaleAmount: 0.1 + Math.random() * 0.05,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.005,
      swayAmount: 1 + Math.random() * 0.5,
      colorPhase: Math.random() * Math.PI * 2,
      colorSpeed: 0.01 + Math.random() * 0.005,
    };
  }, []);

  // Optimized spatial grid for collision detection
  const updateSpatialGrid = useCallback(() => {
    spatialGridRef.current.clear();
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;
      const gridX = Math.floor(balloon.x / 50);
      const gridY = Math.floor(balloon.y / 50);
      const key = `${gridX},${gridY}`;

      if (!spatialGridRef.current.has(key)) {
        spatialGridRef.current.set(key, []);
      }
      spatialGridRef.current.get(key)!.push(balloon);
    });
  }, []);

  // Optimized collision detection using spatial grid
  const checkCollisions = useCallback(() => {
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;

      const gridX = Math.floor(balloon.x / 50);
      const gridY = Math.floor(balloon.y / 50);

      // Check only nearby balloons
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${gridX + dx},${gridY + dy}`;
          const nearbyBalloons = spatialGridRef.current.get(key) || [];

          nearbyBalloons.forEach((other) => {
            if (other.id === balloon.id || other.popped) return;

            const dx = balloon.x - other.x;
            const dy = balloon.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = balloon.radius + other.radius;

            if (distance < minDistance) {
              const overlap = minDistance - distance;
              const separationX = (dx / distance) * overlap * 0.5;
              const separationY = (dy / distance) * overlap * 0.5;

              balloon.x += separationX;
              balloon.y += separationY;
              other.x -= separationX;
              other.y -= separationY;
            }
          });
        }
      }
    });
  }, []);

  // Optimized balloon update with batching
  const updateBalloons = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = Date.now();
    const deltaTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    // Update balloons in batches for better performance
    const batchSize = performanceSettings.balloonUpdateBatchSize;
    const startIndex =
      (frameCount.current % Math.ceil(balloonsRef.current.length / batchSize)) *
      batchSize;
    const endIndex = Math.min(
      startIndex + batchSize,
      balloonsRef.current.length
    );

    for (let i = startIndex; i < endIndex; i++) {
      const balloon = balloonsRef.current[i];
      if (balloon.popped) continue;

      // Update position
      balloon.x += balloon.vx * (deltaTime / 16);
      balloon.y += balloon.vy * (deltaTime / 16);

      // Bounce off walls
      if (
        balloon.x - balloon.radius < 0 ||
        balloon.x + balloon.radius >
          canvas.width / (window.devicePixelRatio || 1)
      ) {
        balloon.vx *= -0.8;
        balloon.x = Math.max(
          balloon.radius,
          Math.min(
            canvas.width / (window.devicePixelRatio || 1) - balloon.radius,
            balloon.x
          )
        );
      }
      if (
        balloon.y - balloon.radius < 0 ||
        balloon.y + balloon.radius >
          canvas.height / (window.devicePixelRatio || 1)
      ) {
        balloon.vy *= -0.8;
        balloon.y = Math.max(
          balloon.radius,
          Math.min(
            canvas.height / (window.devicePixelRatio || 1) - balloon.radius,
            balloon.y
          )
        );
      }

      // Apply gravity
      balloon.vy += 0.1;
    }

    frameCount.current++;

    // Update spatial grid every few frames
    if (frameCount.current % 3 === 0) {
      updateSpatialGrid();
      checkCollisions();
    }
  }, [performanceSettings, updateSpatialGrid, checkCollisions]);

  // Optimized fragment update
  const updateFragments = useCallback(() => {
    const maxFragments = performanceSettings.maxFragmentsPerFrame;
    let updatedCount = 0;

    fragmentsRef.current = fragmentsRef.current.filter((fragment) => {
      if (updatedCount >= maxFragments) return true;

      fragment.x += fragment.vx;
      fragment.y += fragment.vy;
      fragment.vy += 0.2; // gravity
      fragment.life -= 0.02;
      fragment.alpha = Math.max(0, fragment.life);

      updatedCount++;
      return fragment.life > 0;
    });
  }, [performanceSettings]);

  // Optimized rendering with dirty rectangle tracking
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear only dirty areas for better performance
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw balloons
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;

      // Use cached gradient
      const gradientKey = `${balloon.color}-${balloon.radius}`;
      let gradient = gradientCache.current.get(gradientKey);

      if (!gradient) {
        gradient = ctx.createRadialGradient(
          balloon.x - balloon.radius * 0.3,
          balloon.y - balloon.radius * 0.3,
          0,
          balloon.x,
          balloon.y,
          balloon.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, balloon.color);
        gradientCache.current.set(gradientKey, gradient);
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw phoneme text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(balloon.phoneme, balloon.x, balloon.y + 5);
    });

    // Draw fragments
    fragmentsRef.current.forEach((fragment) => {
      ctx.save();
      ctx.globalAlpha = fragment.alpha;
      ctx.fillStyle = fragment.color;
      ctx.beginPath();
      ctx.arc(fragment.x, fragment.y, fragment.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // Optimized animation loop with frame rate limiting
  const animate = useCallback(() => {
    const now = performance.now();
    const targetFrameTime = 1000 / performanceSettings.animationFrameRate;

    if (now - lastFrameTime.current >= targetFrameTime) {
      updateBalloons();
      updateFragments();
      render();
      lastFrameTime.current = now;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [updateBalloons, updateFragments, render, performanceSettings]);

  // Initialize canvas and balloons
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize balloons
    balloonsRef.current = Array.from({ length: balloonCount }, (_, i) =>
      createBalloon(i)
    );
    updateSpatialGrid();

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balloonCount, createBalloon, updateSpatialGrid, animate]);

  // Cleanup fragments periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      fragmentsRef.current = fragmentsRef.current.filter(
        (fragment) => fragment.life > 0
      );
    }, performanceSettings.cleanupInterval);

    return () => clearInterval(cleanupInterval);
  }, [performanceSettings.cleanupInterval]);

  // Rest of the component logic remains the same...
  // (handleClick, handleMouseDown, handleMouseMove, etc.)

  return (
    <div className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
      <audio ref={audioRef} preload="auto" className="hidden" />

      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onMouseMove={() => {}}
          onMouseDown={() => {}}
          onMouseUp={() => {}}
          onMouseLeave={() => {}}
        />
      </div>

      <PhonemeDialog
        setDialogOpen={setDialogOpen}
        dialogOpen={dialogOpen}
        activeColor={activeColor}
        activeTitle={activePhoneme}
        activities={activities}
        isLoading={isLoading}
        isPending={isPending}
        downloadingFileId={downloadingFileId}
        downloadSuccess={downloadSuccess}
        downloadError={downloadError}
        handleFileDownload={handleFileDownload}
        handleCloseDialog={() => setDialogOpen(false)}
        type={'phoneme'}
      />

      {showSignupDialog && (
        <SignupDialog
          isOpen={showSignupDialog}
          onClose={() => setShowSignupDialog(false)}
        />
      )}
    </div>
  );
};

export default BalloonField;
