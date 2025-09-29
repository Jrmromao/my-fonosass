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

const BalloonField: React.FC<BalloonFieldProps> = ({
  balloonCount = 18, // Reduced from 23 to 18 for better performance
  title = 'Phoneme Pop!',
  description = 'Pop balloons to learn phonemes',
  onBalloonPopped,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const isAnimating = useRef<boolean>(false);

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

  // Performance optimization: Adaptive settings based on device
  const performanceSettings = useMemo(() => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isSlowConnection =
      navigator.connection &&
      (navigator.connection as any).effectiveType === 'slow-2g';

    return {
      maxFragmentsPerFrame: isMobile
        ? 6
        : isLowEnd
          ? 10
          : isSlowConnection
            ? 8
            : 15,
      balloonUpdateBatchSize: isMobile ? 2 : isLowEnd ? 3 : 4,
      animationFrameRate: isMobile ? 30 : isLowEnd ? 45 : 60,
      cleanupInterval: isMobile ? 300 : 500,
      maxFragments: isMobile ? 50 : isLowEnd ? 80 : 120,
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

  // Optimized balloon creation with better distribution
  const createBalloon = useCallback((id: number): Balloon => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Balloon;

    const colors = balloonColors;
    const color = colors[id % colors.length];
    const phoneme = phonemes[id % phonemes.length];
    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    return {
      id,
      x: Math.random() * (canvasWidth - 100) + 50,
      y: Math.random() * (canvasHeight - 100) + 50,
      vx: (Math.random() - 0.5) * 1.5, // Reduced velocity for smoother movement
      vy: (Math.random() - 0.5) * 1.5,
      radius: 22 + Math.random() * 12, // Slightly smaller balloons
      color,
      phoneme,
      popped: false,
      popTime: 0,
      fragments: [],
    };
  }, []);

  // Optimized spatial grid for collision detection
  const spatialGridRef = useRef<Map<string, Balloon[]>>(new Map());
  const gridSize = 60; // Increased grid size for better performance

  const updateSpatialGrid = useCallback(() => {
    spatialGridRef.current.clear();
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;
      const gridX = Math.floor(balloon.x / gridSize);
      const gridY = Math.floor(balloon.y / gridSize);
      const key = `${gridX},${gridY}`;

      if (!spatialGridRef.current.has(key)) {
        spatialGridRef.current.set(key, []);
      }
      spatialGridRef.current.get(key)!.push(balloon);
    });
  }, []);

  // Optimized collision detection
  const checkCollisions = useCallback(() => {
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;

      const gridX = Math.floor(balloon.x / gridSize);
      const gridY = Math.floor(balloon.y / gridSize);

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

            if (distance < minDistance && distance > 0) {
              const overlap = minDistance - distance;
              const separationX = (dx / distance) * overlap * 0.3; // Reduced separation force
              const separationY = (dy / distance) * overlap * 0.3;

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

  // Optimized balloon update with batching and reduced calculations
  const updateBalloons = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Update balloons in smaller batches for smoother performance
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

      // Update position with reduced velocity
      balloon.x += balloon.vx * 0.8; // Reduced movement speed
      balloon.y += balloon.vy * 0.8;

      // Bounce off walls with damping
      if (balloon.x - balloon.radius < 0) {
        balloon.vx = Math.abs(balloon.vx) * 0.7;
        balloon.x = balloon.radius;
      } else if (balloon.x + balloon.radius > canvasWidth) {
        balloon.vx = -Math.abs(balloon.vx) * 0.7;
        balloon.x = canvasWidth - balloon.radius;
      }

      if (balloon.y - balloon.radius < 0) {
        balloon.vy = Math.abs(balloon.vy) * 0.7;
        balloon.y = balloon.radius;
      } else if (balloon.y + balloon.radius > canvasHeight) {
        balloon.vy = -Math.abs(balloon.vy) * 0.7;
        balloon.y = canvasHeight - balloon.radius;
      }

      // Apply gentle gravity
      balloon.vy += 0.05; // Reduced gravity
    }

    frameCount.current++;

    // Update spatial grid less frequently
    if (frameCount.current % 4 === 0) {
      updateSpatialGrid();
      checkCollisions();
    }
  }, [performanceSettings, updateSpatialGrid, checkCollisions]);

  // Optimized fragment update with limits
  const updateFragments = useCallback(() => {
    const maxFragments = performanceSettings.maxFragmentsPerFrame;
    let updatedCount = 0;

    // Limit total fragments
    if (fragmentsRef.current.length > performanceSettings.maxFragments) {
      fragmentsRef.current = fragmentsRef.current.slice(
        -performanceSettings.maxFragments
      );
    }

    fragmentsRef.current = fragmentsRef.current.filter((fragment) => {
      if (updatedCount >= maxFragments) return true;

      fragment.x += fragment.vx;
      fragment.y += fragment.vy;
      fragment.vy += 0.15; // Reduced gravity
      fragment.life -= 0.015; // Slower decay
      fragment.alpha = Math.max(0, fragment.life);

      updatedCount++;
      return fragment.life > 0;
    });
  }, [performanceSettings]);

  // Optimized rendering with reduced redraws
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw balloons with simplified rendering
    balloonsRef.current.forEach((balloon) => {
      if (balloon.popped) return;

      // Simple gradient for better performance
      const gradient = ctx.createRadialGradient(
        balloon.x - balloon.radius * 0.2,
        balloon.y - balloon.radius * 0.2,
        0,
        balloon.x,
        balloon.y,
        balloon.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(1, balloon.color);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw phoneme text with better performance
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial'; // Smaller font
      ctx.textAlign = 'center';
      ctx.fillText(balloon.phoneme, balloon.x, balloon.y + 4);
    });

    // Draw fragments with reduced opacity
    fragmentsRef.current.forEach((fragment) => {
      if (fragment.alpha > 0.1) {
        // Skip very transparent fragments
        ctx.save();
        ctx.globalAlpha = fragment.alpha;
        ctx.fillStyle = fragment.color;
        ctx.beginPath();
        ctx.arc(fragment.x, fragment.y, fragment.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }, []);

  // Optimized animation loop with frame rate limiting
  const animate = useCallback(() => {
    if (!isAnimating.current) return;

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
    isAnimating.current = true;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isAnimating.current = false;
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

  // Pause animation when not visible (performance optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isAnimating.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle click events (simplified for performance)
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find clicked balloon
      for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
        const balloon = balloonsRef.current[i];
        if (balloon.popped) continue;

        const dx = x - balloon.x;
        const dy = y - balloon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < balloon.radius) {
          // Pop balloon
          balloon.popped = true;
          balloon.popTime = Date.now();

          // Create fragments
          for (let j = 0; j < 8; j++) {
            fragmentsRef.current.push({
              x: balloon.x,
              y: balloon.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: 3 + Math.random() * 3,
              color: balloon.color,
              life: 1,
              alpha: 1,
            });
          }

          // Set active phoneme and color
          setActivePhoneme(balloon.phoneme);
          setActiveColor(balloon.color);
          setPoppedBalloonId(balloon.id);

          // Call callback
          if (onBalloonPopped) {
            onBalloonPopped(balloon);
          }

          // Load activities for phoneme
          startTransition(async () => {
            try {
              setIsLoading(true);
              const activitiesData = await getActivitiesByPhoneme(
                balloon.phoneme
              );
              setActivities(activitiesData);
              setDialogOpen(true);
            } catch (error) {
              console.error('Error loading activities:', error);
            } finally {
              setIsLoading(false);
            }
          });

          break;
        }
      }
    },
    [onBalloonPopped, startTransition]
  );

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />

      {/* Title and description overlay */}
      <div className="absolute top-4 left-4 right-4 text-center">
        <h3 className="text-lg font-bold text-indigo-900 mb-1">{title}</h3>
        <p className="text-sm text-indigo-700">{description}</p>
      </div>

      {/* Dialogs */}
      {dialogOpen && (
        <PhonemeDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          phoneme={activePhoneme}
          color={activeColor}
          activities={activities}
          isLoading={isLoading}
          onDownloadFile={async (fileId: string) => {
            try {
              setDownloadingFileId(fileId);
              setDownloadError(null);

              const url = await getFileDownloadUrl(fileId);
              const link = document.createElement('a');
              link.href = url;
              link.download = '';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              setDownloadSuccess('Download iniciado!');
              setTimeout(() => setDownloadSuccess(null), 3000);
            } catch (error) {
              console.error('Download error:', error);
              setDownloadError('Erro ao fazer download do arquivo');
              setTimeout(() => setDownloadError(null), 3000);
            } finally {
              setDownloadingFileId(null);
            }
          }}
          downloadingFileId={downloadingFileId}
          downloadSuccess={downloadSuccess}
          downloadError={downloadError}
        />
      )}

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
