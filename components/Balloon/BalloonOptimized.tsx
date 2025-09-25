import { balloonColors, phonemes } from '@/components/Balloon/constants';
import {
  Balloon,
  BalloonFieldProps,
  Fragment,
} from '@/components/Balloon/types';
import PhonemeDialog from '@/components/dialogs/phonemeDialog';
import { getActivitiesByPhoneme } from '@/lib/actions/activity.action';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { ActivityWithFiles } from '@/types/activity';
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

// Optimized BalloonField component
const BalloonField: React.FC<BalloonFieldProps> = ({
  balloonCount = 23,
  title = 'Phoneme Pop!',
  description = 'Pop balloons to learn phonemes',
  onBalloonPopped,
}) => {
  // Refs for performance-critical data
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Performance optimization refs
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const hitDetectionGridRef = useRef<Map<string, Balloon[]>>(new Map());
  const cachedGradientsRef = useRef<Map<string, CanvasGradient>>(new Map());
  const cachedPathsRef = useRef<Map<string, Path2D>>(new Map());

  // State management
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

  // Optimized balloon initialization
  const initializeBalloons = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const leftAnchorX = width * 0.25;
    const rightAnchorX = width * 0.75;
    const anchorY = height;
    const virtualHeight = height * 0.8;

    const balloons: Balloon[] = [];
    const {
      leftBalloonCount,
      rightBalloonCount,
      safePhonemes,
      heightSections,
    } = memoizedConstants;

    // Clear spatial grid
    hitDetectionGridRef.current.clear();

    const createBalloonGroup = (
      count: number,
      startId: number,
      anchorX: number,
      isLeft: boolean
    ) => {
      const widthRange: [number, number] = isLeft
        ? [anchorX - width * 0.2, anchorX + width * 0.15]
        : [anchorX - width * 0.15, anchorX + width * 0.2];

      const sectionHeight = virtualHeight / heightSections;

      for (let i = 0; i < count; i++) {
        const id = startId + i;
        const colorIndex = id % balloonColors.length;
        const sectionIndex = Math.floor((i / count) * heightSections);
        const heightRange: [number, number] = [
          30 + sectionIndex * sectionHeight,
          Math.min(height * 0.7, 30 + (sectionIndex + 1) * sectionHeight - 50),
        ];

        const size = 0.8 + Math.random() * 0.4;
        const phoneme = safePhonemes[id % safePhonemes.length];
        const position = findValidPosition(
          balloons,
          widthRange,
          heightRange,
          25
        );

        const balloon: Balloon = {
          id,
          x: position.x,
          y: position.y,
          color: balloonColors[colorIndex],
          size,
          popped: false,
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.3 + Math.random() * 0.3,
          floatAmount: 2 + Math.random() * 3,
          rotation: (Math.random() - 0.5) * 0.2,
          stringLength: Math.sqrt(
            Math.pow(position.x - anchorX, 2) +
              Math.pow(position.y - anchorY, 2)
          ),
          hovering: false,
          pressing: false,
          anchorGroup: isLeft ? 'left' : 'right',
          phoneme,
          zIndex: 0,
          isDragging: false,
          // Animation properties
          rotationPhase: 0,
          rotationSpeed: 0,
          scalePhase: 0,
          scaleSpeed: 0,
          scaleAmount: 0,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.1 + Math.random() * 0.1,
          swayAmount: 1 + Math.random() * 1.5,
          colorPhase: 0,
          colorSpeed: 0,
        };

        balloons.push(balloon);

        // Add to spatial grid
        const gridX = Math.floor(
          position.x / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );
        const gridY = Math.floor(
          position.y / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );
        const gridKey = `${gridX},${gridY}`;
        if (!hitDetectionGridRef.current.has(gridKey)) {
          hitDetectionGridRef.current.set(gridKey, []);
        }
        hitDetectionGridRef.current.get(gridKey)!.push(balloon);
      }
    };

    createBalloonGroup(leftBalloonCount, 0, leftAnchorX, true);
    createBalloonGroup(
      rightBalloonCount,
      leftBalloonCount,
      rightAnchorX,
      false
    );

    balloonsRef.current = balloons;
  }, [memoizedConstants, findValidPosition]);

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

  // Optimized balloon popping with better fragment management
  const popBalloon = useCallback(
    (balloonId: number): void => {
      const balloon = balloonsRef.current.find((b) => b.id === balloonId);
      if (!balloon || balloon.popped) return;

      // Mark as popped
      balloon.popped = true;

      // Remove from spatial grid when popped
      const gridX = Math.floor(
        balloon.x / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
      );
      const gridY = Math.floor(
        balloon.y / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
      );
      const gridKey = `${gridX},${gridY}`;
      const gridBalloons = hitDetectionGridRef.current.get(gridKey);
      if (gridBalloons) {
        const index = gridBalloons.findIndex((b) => b.id === balloonId);
        if (index !== -1) {
          gridBalloons.splice(index, 1);
        }
      }

      // Set popped balloon ID for restoration later
      setPoppedBalloonId(balloonId);

      // Store color and phoneme for dialog
      setActiveColor(balloon.color);
      setActivePhoneme(balloon.phoneme);
      handleAppleClick(balloon.phoneme);

      if (onBalloonPopped) {
        onBalloonPopped(balloon.phoneme, balloon.color);
      }

      // Play pop sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Optimized fragment generation
      const fragmentCount = Math.min(
        20,
        window.navigator.hardwareConcurrency > 4 ? 20 : 10
      );
      const fragments: Fragment[] = [];
      const { x, y, color, size } = balloon;

      // Generate fragments in batches for better performance
      const fragmentTypes = [
        {
          type: 'rubber' as const,
          count: Math.min(6, fragmentCount / 4),
          sizeRange: [15, 30],
          speedRange: [3, 11],
        },
        {
          type: 'rubber' as const,
          count: Math.min(8, fragmentCount / 3),
          sizeRange: [6, 16],
          speedRange: [4, 14],
        },
        {
          type: 'dust' as const,
          count: Math.min(15, fragmentCount / 2),
          sizeRange: [1, 4],
          speedRange: [5, 17],
        },
      ];

      fragmentTypes.forEach(({ type, count, sizeRange, speedRange }) => {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed =
            speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
          const fragmentSize =
            sizeRange[0] * size +
            Math.random() * (sizeRange[1] - sizeRange[0]) * size;

          fragments.push({
            type,
            size: fragmentSize,
            x: 0,
            y: 0,
            originX: x,
            originY: y,
            velocity: {
              x: Math.cos(angle) * speed * (0.5 + Math.random()),
              y: Math.sin(angle) * speed * (0.5 + Math.random()),
            },
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: type === 'dust' ? 0 : (Math.random() - 0.5) * 0.3,
            opacity: 1,
            color: shadeColor(color, Math.random() * 60 - 30),
          });
        }
      });

      fragmentsRef.current = [...fragmentsRef.current, ...fragments];

      setTimeout(() => setDialogOpen(true), 500);
    },
    [onBalloonPopped, handleAppleClick, shadeColor]
  );

  // Optimized hit detection with spatial partitioning
  const findTopmostBalloon = useCallback(
    (x: number, y: number): Balloon | null => {
      const gridX = Math.floor(x / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE);
      const gridY = Math.floor(y / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE);

      const nearbyBalloons: Balloon[] = [];

      // Check surrounding grid cells
      for (let gx = gridX - 1; gx <= gridX + 1; gx++) {
        for (let gy = gridY - 1; gy <= gridY + 1; gy++) {
          const gridKey = `${gx},${gy}`;
          const balloons = hitDetectionGridRef.current.get(gridKey) || [];
          nearbyBalloons.push(...balloons);
        }
      }

      const hoveringBalloons = nearbyBalloons.filter((balloon) => {
        if (balloon.popped) return false;

        const dx = balloon.x - x;
        const dy =
          balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount - y;
        const distanceSquared = dx * dx + dy * dy;
        const hitRadiusSquared = Math.pow(50 * balloon.size, 2);

        return distanceSquared < hitRadiusSquared;
      });

      if (hoveringBalloons.length === 0) return null;

      return hoveringBalloons.reduce((top, current) =>
        current.zIndex > top.zIndex ||
        (current.zIndex === top.zIndex && current.id > top.id)
          ? current
          : top
      );
    },
    []
  );

  // Optimized mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): void => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const topmostBalloon = findTopmostBalloon(clickX, clickY);

      if (topmostBalloon) {
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;

        if (
          timeSinceLastClick < 300 &&
          lastClickBalloonId === topmostBalloon.id
        ) {
          popBalloon(topmostBalloon.id);
          setLastClickTime(0);
          setLastClickBalloonId(null);
          setDraggingBalloonId(null);
        } else {
          setDraggingBalloonId(topmostBalloon.id);
          balloonsRef.current = balloonsRef.current.map((balloon) => ({
            ...balloon,
            isDragging: balloon.id === topmostBalloon.id,
            pressing: balloon.id === topmostBalloon.id,
            zIndex: balloon.id === topmostBalloon.id ? 1000 : balloon.zIndex,
          }));
          setLastClickTime(currentTime);
          setLastClickBalloonId(topmostBalloon.id);
        }
      }
    },
    [findTopmostBalloon, popBalloon, lastClickTime, lastClickBalloonId]
  );

  // Highly optimized mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (draggingBalloonId !== null) {
        // Optimized dragging - only update the dragged balloon
        const balloonIndex = balloonsRef.current.findIndex(
          (b) => b.id === draggingBalloonId
        );
        if (balloonIndex !== -1) {
          balloonsRef.current[balloonIndex] = {
            ...balloonsRef.current[balloonIndex],
            x: mouseX,
            y: mouseY,
            zIndex: 1000,
          };
        }
      } else {
        // Optimized hover detection with spatial partitioning
        const gridX = Math.floor(
          mouseX / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );
        const gridY = Math.floor(
          mouseY / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
        );

        const nearbyBalloons: Balloon[] = [];
        for (let gx = gridX - 1; gx <= gridX + 1; gx++) {
          for (let gy = gridY - 1; gy <= gridY + 1; gy++) {
            const gridKey = `${gx},${gy}`;
            const balloons = hitDetectionGridRef.current.get(gridKey) || [];
            nearbyBalloons.push(...balloons);
          }
        }

        const hoveringBalloonIds = new Set<number>();
        nearbyBalloons.forEach((balloon) => {
          if (balloon.popped) return;
          const dx = balloon.x - mouseX;
          const dy =
            balloon.y +
            Math.sin(balloon.floatPhase) * balloon.floatAmount -
            mouseY;
          const distanceSquared = dx * dx + dy * dy;
          const hitRadiusSquared = Math.pow(50 * balloon.size, 2);
          if (distanceSquared < hitRadiusSquared) {
            hoveringBalloonIds.add(balloon.id);
          }
        });

        // Batch update balloons
        balloonsRef.current = balloonsRef.current.map((balloon) => {
          const isHovering = hoveringBalloonIds.has(balloon.id);
          return {
            ...balloon,
            hovering: isHovering,
            zIndex:
              isHovering && balloon.id !== draggingBalloonId
                ? 100
                : balloon.zIndex,
          };
        });
      }
    },
    [draggingBalloonId]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): void => {
      balloonsRef.current = balloonsRef.current.map((balloon) => ({
        ...balloon,
        isDragging: false,
        pressing: false,
      }));
      setDraggingBalloonId(null);
    },
    []
  );

  const handleCloseDialog = useCallback((): void => {
    setDialogOpen(false);
  }, []);

  // Optimized drawing functions with caching
  const createGradient = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      color: string,
      width: number,
      height: number
    ): CanvasGradient => {
      const cacheKey = `${color}-${width}-${height}`;
      if (cachedGradientsRef.current.has(cacheKey)) {
        return cachedGradientsRef.current.get(cacheKey)!;
      }

      const gradient = ctx.createRadialGradient(
        -width / 4,
        -height / 4,
        0,
        0,
        0,
        width * 0.8
      );
      gradient.addColorStop(0, shadeColor(color, 20));
      gradient.addColorStop(0.6, color);
      gradient.addColorStop(1, shadeColor(color, -10));

      cachedGradientsRef.current.set(cacheKey, gradient);
      return gradient;
    },
    [shadeColor]
  );

  const drawBalloon = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      balloon: Balloon,
      floatY: number,
      anchorX: number,
      anchorY: number
    ): void => {
      const { x, y, color, size, rotation, hovering, pressing } = balloon;
      const balloonWidth = 100 * size;
      const balloonHeight = 120 * size;

      if (
        x < -100 ||
        x > ctx.canvas.width + 100 ||
        y < -100 ||
        y > ctx.canvas.height + 100
      ) {
        return;
      }

      let scaleX = 1,
        scaleY = 1;
      if (hovering) {
        scaleX = 1.08;
        scaleY = 1.08;
      }
      if (pressing) {
        scaleX = 1.1;
        scaleY = 0.98;
      }

      const balloonY = y + floatY;

      ctx.save();
      ctx.translate(x, balloonY);
      ctx.rotate(rotation);
      ctx.scale(scaleX, scaleY);

      // Use cached gradient
      const gradient = createGradient(ctx, color, balloonWidth, balloonHeight);

      ctx.beginPath();
      ctx.ellipse(0, 0, balloonWidth / 2, balloonHeight / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      ctx.strokeStyle = shadeColor(color, -30);
      ctx.lineWidth = 2 * (size / 0.8);
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Highlights
      ctx.beginPath();
      ctx.ellipse(
        -balloonWidth / 5,
        -balloonHeight / 4,
        balloonWidth / 10,
        balloonHeight / 8,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        -balloonWidth / 10,
        -balloonHeight / 10,
        balloonWidth / 25,
        balloonHeight / 25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Tie
      const tieSize = 10 * size;
      ctx.beginPath();
      ctx.moveTo(-tieSize / 2, balloonHeight / 2);
      ctx.lineTo(0, balloonHeight / 2 + tieSize);
      ctx.lineTo(tieSize / 2, balloonHeight / 2);
      ctx.closePath();
      ctx.fillStyle = shadeColor(color, -20);
      ctx.fill();
      ctx.strokeStyle = shadeColor(color, -40);
      ctx.lineWidth = 1.5 * (size / 0.8);
      ctx.stroke();

      // Text
      ctx.save();
      ctx.scale(1 / scaleX, 1 / scaleY);
      ctx.rotate(-rotation);
      const fontSize = Math.max(36 * size, 24);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = shadeColor(color, -50);
      ctx.lineWidth = fontSize / 10;
      ctx.strokeText(balloon.phoneme, 0, 0);
      ctx.fillText(balloon.phoneme, 0, 0);
      ctx.restore();

      ctx.restore();

      // String
      ctx.save();
      const balloonBottom = balloonY + (balloonHeight / 2 + tieSize) * scaleY;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      const stringMidX = (x + anchorX) / 2;
      const stringMidY =
        (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase / 2) * 8;
      ctx.quadraticCurveTo(stringMidX, stringMidY + 15, x, balloonBottom);
      ctx.strokeStyle = shadeColor(color, -40);
      ctx.lineWidth = 1;
      // Full line instead of dashed
      ctx.stroke();
      ctx.restore();
    },
    [shadeColor, createGradient]
  );

  // Highly optimized animation loop
  const startAnimation = useCallback((): void => {
    let lastTime = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number): void => {
      const delta = lastTime ? (timestamp - lastTime) / 16.66 : 12;
      lastTime = timestamp;
      frameCountRef.current++;

      // Skip frames when browser tab is inactive or frame rate is very low
      if (delta > PERFORMANCE_CONFIG.ANIMATION_FRAME_SKIP_THRESHOLD) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const leftAnchorX = width * 0.25;
      const rightAnchorX = width * 0.75;
      const anchorY = height;

      const hasDraggingBalloons = draggingBalloonId !== null;
      const sortedBalloons = hasDraggingBalloons
        ? [...balloonsRef.current].sort((a, b) => a.zIndex - b.zIndex)
        : balloonsRef.current;

      // Optimized balloon updates - only update a subset each frame
      const updateCount = Math.min(
        sortedBalloons.length,
        PERFORMANCE_CONFIG.BALLOON_UPDATE_BATCH_SIZE
      );
      const updateOffset = Math.floor(timestamp / 100) % sortedBalloons.length;

      sortedBalloons.forEach((balloon, index) => {
        if (balloon.popped) return;

        // Only update float animation for some balloons each frame
        if (
          balloon.id === draggingBalloonId ||
          (index + updateOffset) % sortedBalloons.length < updateCount
        ) {
          balloon.floatPhase += 0.02 * balloon.floatSpeed * delta;
        }

        const floatY = Math.sin(balloon.floatPhase) * balloon.floatAmount;

        // Skip drawing balloons that are far off-screen
        if (
          balloon.x < -100 ||
          balloon.x > width + 100 ||
          balloon.y + floatY < -150 ||
          balloon.y + floatY > height + 50
        ) {
          return;
        }

        const anchorX =
          balloon.anchorGroup === 'left' ? leftAnchorX : rightAnchorX;
        drawBalloon(ctx, balloon, floatY, anchorX, anchorY);
      });

      // Optimized fragment processing
      const maxFragmentsPerFrame = PERFORMANCE_CONFIG.MAX_FRAGMENTS_PER_FRAME;
      let processedFragments = 0;
      let anyActiveFragments = false;

      for (
        let i = 0;
        i < fragmentsRef.current.length &&
        processedFragments < maxFragmentsPerFrame;
        i++
      ) {
        const fragment = fragmentsRef.current[i];

        fragment.velocity.x *= 0.98;
        fragment.velocity.y *= 0.98;
        fragment.velocity.y += 0.2 * delta;

        fragment.x += fragment.velocity.x * delta;
        fragment.y += fragment.velocity.y * delta;
        fragment.rotation += fragment.rotationSpeed * delta;

        if (fragment.y > height + 50 || fragment.opacity <= 0.01) {
          continue;
        }

        anyActiveFragments = true;
        processedFragments++;
        fragment.opacity = Math.max(0, fragment.opacity - 0.005 * delta);

        // Draw fragment
        ctx.save();
        ctx.translate(
          fragment.originX + fragment.x,
          fragment.originY + fragment.y
        );
        ctx.rotate(fragment.rotation);
        ctx.globalAlpha = fragment.opacity;

        if (fragment.type === 'rubber') {
          ctx.beginPath();
          ctx.moveTo(-fragment.size / 2, -fragment.size / 4);
          ctx.quadraticCurveTo(
            0,
            -fragment.size / 2,
            fragment.size / 2,
            -fragment.size / 4
          );
          ctx.quadraticCurveTo(
            fragment.size / 3,
            fragment.size / 4,
            0,
            fragment.size / 2
          );
          ctx.quadraticCurveTo(
            -fragment.size / 3,
            fragment.size / 4,
            -fragment.size / 2,
            -fragment.size / 4
          );
          ctx.fillStyle = fragment.color;
          ctx.fill();
        } else {
          if (fragment.size < 3) {
            ctx.fillStyle = fragment.color;
            ctx.fillRect(
              -fragment.size / 2,
              -fragment.size / 2,
              fragment.size,
              fragment.size
            );
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, fragment.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = fragment.color;
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // Periodic cleanup
      if (
        timestamp % 60 < 16.66 &&
        fragmentsRef.current.length > PERFORMANCE_CONFIG.MAX_FRAGMENTS_TOTAL
      ) {
        fragmentsRef.current = fragmentsRef.current.filter(
          (f) => f.opacity > 0.02
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [draggingBalloonId, drawBalloon]);

  // Effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    initializeBalloons();
    startAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeBalloons, startAnimation]);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (
        fragmentsRef.current.length > PERFORMANCE_CONFIG.MAX_FRAGMENTS_TOTAL
      ) {
        fragmentsRef.current = fragmentsRef.current.filter(
          (f) => f.opacity > 0.05
        );
      }
    }, PERFORMANCE_CONFIG.FRAGMENT_CLEANUP_INTERVAL);

    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    if (!dialogOpen && poppedBalloonId !== null) {
      // Re-inflate the popped balloon
      balloonsRef.current = balloonsRef.current.map((balloon) => {
        if (balloon.id === poppedBalloonId) {
          const updatedBalloon = {
            ...balloon,
            popped: false,
            // Reset any animation state
            floatPhase: Math.random() * Math.PI * 2,
            // Keep original position - no repositioning
          };

          // Add back to spatial grid at original position
          const gridX = Math.floor(
            updatedBalloon.x / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
          );
          const gridY = Math.floor(
            updatedBalloon.y / PERFORMANCE_CONFIG.HIT_DETECTION_GRID_SIZE
          );
          const gridKey = `${gridX},${gridY}`;
          if (!hitDetectionGridRef.current.has(gridKey)) {
            hitDetectionGridRef.current.set(gridKey, []);
          }
          hitDetectionGridRef.current.get(gridKey)!.push(updatedBalloon);

          return updatedBalloon;
        }
        return balloon;
      });

      // Clear the popped balloon reference
      setPoppedBalloonId(null);
    }
  }, [dialogOpen, poppedBalloonId]);

  return (
    <div className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
      <audio ref={audioRef} preload="auto" className="hidden" />

      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
        handleCloseDialog={handleCloseDialog}
        type={'phoneme'}
      />
    </div>
  );
};

export default BalloonField;
