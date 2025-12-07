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
  useRef,
  useState,
  useTransition,
} from 'react';

const BalloonField: React.FC<BalloonFieldProps> = ({
  balloonCount = 23, // Fixed at 23 balloons
  title = 'Phoneme Pop!',
  description = 'Pop balloons to learn phonemes',
  onBalloonPopped,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const fragmentsRef = useRef<Fragment[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [prevDialogOpen, setPrevDialogOpen] = useState<boolean>(false);
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
  // Add these near your other state declarations
  const [activities, setActivities] = useState<ActivityWithFiles[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null
  );
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const router = useRouter(); // Add this import from 'next/navigation'

  // Authentication state
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  // Function to validate if user has a valid account
  const isValidUser = useCallback(() => {
    if (!isLoaded) return false;
    if (!isSignedIn) return false;
    if (!user) return false;

    // Check if user has completed their profile
    if (!user.firstName || !user.lastName) return false;

    // Check if user has verified email
    if (user.emailAddresses?.[0]?.verification?.status !== 'verified')
      return false;

    return true;
  }, [isLoaded, isSignedIn, user]);

  // Performance optimization: Cache gradients
  const gradientCache = useRef<Map<string, CanvasGradient>>(new Map());

  // Check if two balloons overlap
  const checkOverlap = useCallback(
    (balloon1: Balloon, balloon2: Balloon): boolean => {
      const dx = balloon1.x - balloon2.x;
      const dy = balloon1.y - balloon2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (balloon1.size + balloon2.size) * 50; // 50 is the base size multiplier

      return distance < minDistance;
    },
    []
  );

  // Find valid position for balloon placement
  const findValidPosition = useCallback(
    (
      balloons: Balloon[],
      widthRange: [number, number],
      heightRange: [number, number],
      balloonSize: number,
      maxAttempts: number = 50
    ): { x: number; y: number } => {
      let x: number =
        widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
      let y: number =
        heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      let isValid = false;
      let attempts = 0;

      // Try to find a non-overlapping position
      while (!isValid && attempts < maxAttempts) {
        x = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
        y = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);

        isValid = true;

        // Check against existing balloons
        for (const balloon of balloons) {
          const dx = balloon.x - x;
          const dy = balloon.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Skip balloons that are far away
          if (dx * dx + dy * dy > 10000) continue;

          // Create a temporary balloon to check overlap
          const tempBalloon: Balloon = {
            id: -1,
            x,
            y,
            vx: 0,
            vy: 0,
            radius: 25 + Math.random() * 15,
            color: '',
            size: balloonSize,
            popped: false,
            popTime: 0,
            fragments: [],
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

        attempts++;
      }

      return { x, y };
    },
    [checkOverlap]
  );

  // Initialize balloons function
  const initializeBalloons = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found!');
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Precompute shared values
    const leftAnchorX = width * 0.25;
    const rightAnchorX = width * 0.75;
    const anchorY = height;
    const virtualHeight = height * 0.8;
    const leftBalloonCount = 10;
    const rightBalloonCount = 10;
    const totalBalloons = leftBalloonCount + rightBalloonCount;

    // Use fewer phonemes if we have more than available
    const safePhonemes =
      phonemes.length >= totalBalloons
        ? phonemes
        : [...phonemes, ...phonemes].slice(0, totalBalloons);

    const balloons: Balloon[] = [];

    // Create balloons in a single function to avoid code duplication
    const createBalloonGroup = (
      count: number,
      startId: number,
      anchorX: number,
      isLeft: boolean
    ) => {
      const widthRange: [number, number] = isLeft
        ? [anchorX - width * 0.2, anchorX + width * 0.15]
        : [anchorX - width * 0.15, anchorX + width * 0.2];

      // Create all balloons at once but with different heights
      const heightSections = 4;
      const sectionHeight = virtualHeight / heightSections;

      for (let i = 0; i < count; i++) {
        const id = startId + i;
        const colorIndex = id % balloonColors.length;

        // Distribute balloons evenly in height sections
        const sectionIndex = Math.floor((i / count) * heightSections);
        const heightRange: [number, number] = [
          30 + sectionIndex * sectionHeight,
          Math.min(height * 0.7, 30 + (sectionIndex + 1) * sectionHeight - 50),
        ];

        // Responsive sizing based on screen size
        const isLargeScreen = window.innerWidth >= 1200;
        const isMediumScreen = window.innerWidth >= 768;

        let baseSize, sizeVariation;
        if (isLargeScreen) {
          baseSize = 0.8;
          sizeVariation = 0.4;
        } else if (isMediumScreen) {
          baseSize = 0.7;
          sizeVariation = 0.3;
        } else {
          baseSize = 0.6;
          sizeVariation = 0.3;
        }

        const size = baseSize + Math.random() * sizeVariation;
        const phoneme = safePhonemes[id % safePhonemes.length];

        // Find a valid position
        const position = findValidPosition(
          balloons,
          widthRange,
          heightRange,
          size,
          100
        );

        // Create the balloon
        balloons.push({
          id,
          x: position.x,
          y: position.y,
          vx: 0,
          vy: 0,
          radius: 25 + Math.random() * 15,
          color: balloonColors[colorIndex],
          size,
          popped: false,
          popTime: 0,
          fragments: [],
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.2 + Math.random() * 0.2,
          floatAmount: 2 + Math.random() * 2,
          rotation: (Math.random() - 0.5) * 0.1,
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
        });
      }
    };

    // Create both balloon groups
    createBalloonGroup(leftBalloonCount, 0, leftAnchorX, true);
    createBalloonGroup(
      rightBalloonCount,
      leftBalloonCount,
      rightAnchorX,
      false
    );

    // Ensure balloons are not completely off-screen
    balloons.forEach((balloon) => {
      if (balloon.x < 0) {
        balloon.x = 0;
      } else if (balloon.x > width) {
        balloon.x = width;
      }
      if (balloon.y < 0) {
        balloon.y = 0;
      } else if (balloon.y > height) {
        balloon.y = height;
      }
    });

    balloonsRef.current = balloons;
  }, [findValidPosition]);

  // Start animation function
  const startAnimation = useCallback((): void => {
    let lastTime = 0;
    let lastFrameTime = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number): void => {
      // Pause animation when tab is hidden for better performance
      if (document.hidden) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const delta = lastTime ? (timestamp - lastTime) / 16.66 : 12; // normalize to ~60fps
      lastTime = timestamp;

      // Skip frames when browser tab is inactive or frame rate is very low
      if (delta > 100) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Frame rate limiting for performance - target 30fps instead of 60fps
      const targetFPS = 30;
      const frameInterval = 1000 / targetFPS;
      if (timestamp - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Optimize canvas context for better performance
      ctx.imageSmoothingEnabled = false; // Disable for pixel art style
      ctx.imageSmoothingQuality = 'low'; // Lower quality for performance

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Cache anchor points to avoid recalculation
      const leftAnchorX = width * 0.25;
      const rightAnchorX = width * 0.75;
      const anchorY = height;

      // Check if we have active fragments or dragging balloons
      const hasActiveFragments = fragmentsRef.current.length > 0;
      const hasDraggingBalloons = draggingBalloonId !== null;

      // Only sort balloons if necessary (when dragging or hovering)
      const sortedBalloons = hasDraggingBalloons
        ? balloonsRef.current.slice().sort((a, b) => a.zIndex - b.zIndex)
        : balloonsRef.current;

      // Update and draw visible balloons
      sortedBalloons.forEach((balloon, index) => {
        if (balloon.popped) return;

        // Update all balloons consistently to prevent visual rearrangement
        balloon.floatPhase += 0.02 * balloon.floatSpeed * delta;
        balloon.swayPhase += 0.02 * balloon.swaySpeed * delta;

        const floatY = Math.sin(balloon.floatPhase) * balloon.floatAmount;
        const swayX = Math.sin(balloon.swayPhase) * balloon.swayAmount;
        const scaleMultiplier = 1; // Disabled for performance
        const rotationOffset = 0; // Disabled for performance

        // Skip drawing balloons that are far off-screen (more aggressive culling)
        if (
          balloon.x < -150 ||
          balloon.x > width + 150 ||
          balloon.y + floatY < -200 ||
          balloon.y + floatY > height + 100
        ) {
          return;
        }

        // Get appropriate anchor based on balloon's group
        const anchorX =
          balloon.anchorGroup === 'left' ? leftAnchorX : rightAnchorX;

        // Draw balloon with enhanced animations
        try {
          drawBalloon(
            ctx,
            balloon,
            floatY,
            anchorX,
            anchorY,
            swayX,
            scaleMultiplier,
            rotationOffset
          );
        } catch (error) {
          console.error('Error drawing balloon:', error);
        }
      });

      // Process fragments in batches for better performance
      const maxFragmentsPerFrame = 30; // Further reduced for better performance
      let processedFragments = 0;
      let anyActiveFragments = false;

      for (
        let i = 0;
        i < fragmentsRef.current.length &&
        processedFragments < maxFragmentsPerFrame;
        i++
      ) {
        const fragment = fragmentsRef.current[i];

        // Update physics
        fragment.velocity.x *= 0.98; // air resistance
        fragment.velocity.y *= 0.98;
        fragment.velocity.y += 0.2 * delta; // gravity

        fragment.x += fragment.velocity.x * delta;
        fragment.y += fragment.velocity.y * delta;
        fragment.rotation += fragment.rotationSpeed * delta;

        // Skip fragments that are off-screen or nearly transparent
        if (fragment.y > height + 50 || fragment.opacity <= 0.01) {
          continue;
        }

        anyActiveFragments = true;
        processedFragments++;

        // Decrease opacity over time (much slower decay for longer fragment visibility)
        fragment.opacity = Math.max(0, fragment.opacity - 0.0003 * delta);

        // Draw fragment
        ctx.save();
        ctx.translate(
          fragment.originX + fragment.x,
          fragment.originY + fragment.y
        );
        ctx.rotate(fragment.rotation);
        ctx.globalAlpha = fragment.opacity;

        if (fragment.type === 'rubber') {
          // Draw rubber piece - simplified path for performance
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
          // Draw dust particle - use rectangle for very small particles for performance
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

      // Fragment cleanup is now handled by the dedicated cleanup interval

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove draggingBalloonId dependency to prevent infinite re-renders

  // Initialize canvas and balloons
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas has proper dimensions
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Canvas not ready, retry after a short delay
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const dpr = window.devicePixelRatio || 1;
              canvas.width = rect.width * dpr;
              canvas.height = rect.height * dpr;
              ctx.scale(dpr, dpr);
              initializeBalloons();
              startAnimation();
            }
          }
        }
      }, 100);
      return;
    }

    // Set canvas dimensions with proper pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Mobile detection and optimization
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
      // Ensure canvas is properly sized for mobile
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Initialize balloons
    initializeBalloons();

    // Start animation
    startAnimation();

    // Handle window resize to reinitialize balloons with new sizes
    const handleResize = () => {
      initializeBalloons();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove balloonCount dependency to prevent infinite re-renders

  // Draw balloon function
  const drawBalloon = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      balloon: Balloon,
      floatY: number,
      anchorX: number,
      anchorY: number,
      swayX: number = 0,
      scaleMultiplier: number = 1,
      rotationOffset: number = 0
    ): void => {
      const { x, y, color, size, rotation, hovering, pressing } = balloon;

      // Smaller balloon dimensions
      const balloonWidth = 70 * size; // Reduced from 100 to 70
      const balloonHeight = 85 * size; // Reduced from 120 to 85

      let scaleX = 1;
      let scaleY = 1;
      if (
        balloon.x < -100 ||
        balloon.x > ctx.canvas.width + 100 ||
        balloon.y < -100 ||
        balloon.y > ctx.canvas.height + 100
      ) {
        return;
      }
      if (hovering) {
        scaleX = 1.08;
        scaleY = 1.08;
      }

      if (pressing) {
        scaleX = 1.1;
        scaleY = 0.98;
      }

      // Apply animation effects
      const balloonX = x + swayX;
      const balloonY = y + floatY;
      const finalScaleX = scaleX * scaleMultiplier;
      const finalScaleY = scaleY * scaleMultiplier;
      const finalRotation = rotation + rotationOffset;

      ctx.save();
      ctx.translate(balloonX, balloonY);
      ctx.rotate(finalRotation);
      ctx.scale(finalScaleX, finalScaleY);

      // More rounded balloon shape
      ctx.beginPath();
      ctx.ellipse(0, 0, balloonWidth / 2, balloonHeight / 2, 0, 0, Math.PI * 2);

      // Simplified gradient for performance
      const gradientKey = `${color}-${balloonWidth}-${balloonHeight}`;
      let gradient = gradientCache.current.get(gradientKey);

      if (!gradient) {
        gradient = ctx.createRadialGradient(
          -balloonWidth / 4,
          -balloonHeight / 4,
          0,
          0,
          0,
          balloonWidth * 0.8
        );
        gradient.addColorStop(0, shadeColor(color, 20));
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, shadeColor(color, -10));
        gradientCache.current.set(gradientKey, gradient);
      }

      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.fill();

      // Thinner outline
      ctx.strokeStyle = shadeColor(color, -30);
      ctx.lineWidth = 2 * (size / 0.8);
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Subtler highlights
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

      // Smaller tie
      const tieSize = 7 * size; // Reduced from 10 to 7
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

      // Text styling (unchanged)
      ctx.save();
      ctx.scale(1 / scaleX, 1 / scaleY);
      ctx.rotate(-rotation);
      const fontSize = Math.max(28 * size, 18); // Smaller font size to match smaller balloons
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

      // Tape-like string with realistic appearance
      ctx.save();
      const balloonBottom =
        balloonY + (balloonHeight / 2 + tieSize) * finalScaleY;
      const stringMidX = (balloonX + anchorX) / 2;
      const stringMidY =
        (balloonBottom + anchorY) / 2 + Math.sin(balloon.floatPhase / 2) * 8;

      // Create tape path
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo(
        stringMidX,
        stringMidY + 15,
        balloonX,
        balloonBottom
      );

      // Tape width and styling
      const tapeWidth = 3 + size; // Wider like tape
      ctx.lineWidth = tapeWidth;

      // Tape shadow (darker outline)
      ctx.strokeStyle = shadeColor(color, -60);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Main tape body
      ctx.lineWidth = tapeWidth - 1;
      ctx.strokeStyle = shadeColor(color, -20);
      ctx.stroke();

      // Tape highlight (top edge)
      ctx.lineWidth = 1;
      ctx.strokeStyle = shadeColor(color, 30);
      ctx.globalAlpha = 0.6;
      ctx.stroke();

      // Add tape texture lines for realism
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = shadeColor(color, -10);

      // Draw subtle texture lines along the tape
      const textureSteps = 8;
      for (let i = 1; i < textureSteps; i++) {
        const t = i / textureSteps;
        const textureX = anchorX + (balloonX - anchorX) * t;
        const textureY = anchorY + (balloonBottom - anchorY) * t;

        // Add slight curve to texture lines
        const textureOffset = Math.sin(t * Math.PI) * 2;

        ctx.beginPath();
        ctx.moveTo(textureX - textureOffset, textureY - tapeWidth / 2);
        ctx.lineTo(textureX + textureOffset, textureY + tapeWidth / 2);
        ctx.stroke();
      }

      // Reset alpha
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (fragmentsRef.current.length > 100) {
        fragmentsRef.current = fragmentsRef.current.filter(
          (f) => f.opacity > 0.05
        );
      }
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Re-initialize balloons when dialog closes
  useEffect(() => {
    // Only restore balloon when dialog changes from open to closed
    if (prevDialogOpen && !dialogOpen && poppedBalloonId !== null) {
      // Re-inflate the popped balloon
      balloonsRef.current = balloonsRef.current.map((balloon) => {
        if (balloon.id === poppedBalloonId) {
          return {
            ...balloon,
            popped: false,
            // Reset any animation state
            floatPhase: Math.random() * Math.PI * 2,
            rotationPhase: Math.random() * Math.PI * 2,
            scalePhase: Math.random() * Math.PI * 2,
            swayPhase: Math.random() * Math.PI * 2,
            colorPhase: Math.random() * Math.PI * 2,
            // Put balloon at a slightly different position for visual interest
            x: balloon.x + (Math.random() - 0.5) * 20,
          };
        }
        return balloon;
      });

      // Clear the popped balloon reference
      setPoppedBalloonId(null);
    }

    // Update previous dialog state
    setPrevDialogOpen(dialogOpen);
  }, [dialogOpen, poppedBalloonId, prevDialogOpen]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Assume there's an API call to fetch activities based on the activePhoneme
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activePhoneme) {
      fetchActivities();
    }
  }, [activePhoneme]);

  // Add this function before the popBalloon function
  const handleFileDownload = useCallback(
    async (fileId: string, fileName: string) => {
      try {
        setDownloadingFileId(fileId);
        setDownloadError(null);

        const result = await getFileDownloadUrl({ fileId });

        if (result.success && result.url) {
          // Create a temporary link element
          const link = document.createElement('a');
          //@ts-ignore
          link.href = result.url;
          const safeFileName = fileName || `activity-${fileId}.pdf`;
          link.setAttribute('download', safeFileName);

          // Required for Firefox
          document.body.appendChild(link);

          // Trigger download
          link.click();

          // Cleanup
          document.body.removeChild(link);

          // Show success state briefly
          setDownloadSuccess(fileId);
          setTimeout(() => {
            setDownloadSuccess(null);
          }, 2000);
        } else {
          setDownloadError(fileId);
          setTimeout(() => {
            setDownloadError(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Download failed:', error);
        setDownloadError(fileId);
        setTimeout(() => {
          setDownloadError(null);
        }, 3000);
      } finally {
        setDownloadingFileId(null);
      }
    },
    []
  );

  // Utility to shade color
  const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, Math.round(R * (1 + percent / 100))));
    G = Math.min(255, Math.max(0, Math.round(G * (1 + percent / 100))));
    B = Math.min(255, Math.max(0, Math.round(B * (1 + percent / 100))));

    return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
  };

  // Handle apple click with server action call
  const handleAppleClick = useCallback((phoneme: string) => {
    setIsLoading(true);

    startTransition(async () => {
      try {
        // Call the server action to get activities for this phoneme
        const result = await getActivitiesByPhoneme({
          phoneme,
          includePrivate: false,
          limit: 5, // Limit to 5 activities for now
        });

        setActivities(result.items as unknown as ActivityWithFiles[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  // Generate fragments for a popped balloon
  const popBalloon = (balloonId: number): void => {
    // Find the balloon to check its phoneme
    const balloon = balloonsRef.current.find((b) => b.id === balloonId);

    // Allow F balloon to be burst by anyone, require auth for others
    if (balloon && balloon.phoneme !== 'CH' && !isValidUser()) {
      setShowSignupDialog(true);
      return;
    }
    const fragmentCount = window.navigator.hardwareConcurrency > 4 ? 20 : 10;

    if (!balloon || balloon.popped) return;

    // Mark as popped
    balloon.popped = true;

    // Set popped balloon ID for restoration later
    setPoppedBalloonId(balloonId);

    // Store color and phoneme for dialog
    setActiveColor(balloon.color);

    setActivePhoneme(balloon.phoneme);
    handleAppleClick(balloon.phoneme);
    // // Update stats
    // setStats(prev => {
    //     const newStreak = prev.lastPopped === balloon.phoneme ? prev.streak + 1 : 1;
    //     return {
    //         totalPopped: prev.totalPopped + 1,
    //         lastPopped: balloon.phoneme,
    //         streak: newStreak
    //     };
    // });

    // Call the callback if provided
    if (onBalloonPopped) {
      onBalloonPopped(balloon.phoneme, balloon.color);
    }

    // Play pop sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const fragments: Fragment[] = [];
    const { x, y, color, size } = balloon;

    // Large rubber pieces
    for (let i = 0; i < Math.min(6, fragmentCount / 4); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      fragments.push({
        type: 'rubber',
        size: 15 * size + Math.random() * 15 * size,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        life: 1.0,
        alpha: 1.0,
        originX: x,
        originY: y,
        velocity: {
          x: Math.cos(angle) * speed * (0.5 + Math.random()),
          y: Math.sin(angle) * speed * (0.5 + Math.random()),
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        color: shadeColor(color, Math.random() * 40 - 20),
      });
    }

    // Medium rubber pieces
    for (let i = 0; i < Math.min(8, fragmentCount / 3); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      fragments.push({
        type: 'rubber',
        size: 6 * size + Math.random() * 10 * size,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        life: 1.0,
        alpha: 1.0,
        originX: x,
        originY: y,
        velocity: {
          x: Math.cos(angle) * speed * (0.5 + Math.random()),
          y: Math.sin(angle) * speed * (0.5 + Math.random()),
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
        color: shadeColor(color, Math.random() * 50 - 25),
      });
    }

    // Small dust particles
    for (let i = 0; i < Math.min(15, fragmentCount / 2); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 12;
      fragments.push({
        type: 'dust',
        size: 1 * size + Math.random() * 3 * size,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        life: 1.0,
        alpha: 1.0,
        originX: x,
        originY: y,
        velocity: {
          x: Math.cos(angle) * speed * (0.5 + Math.random()),
          y: Math.sin(angle) * speed * (0.5 + Math.random()),
        },
        rotation: 0,
        rotationSpeed: 0,
        opacity: 1,
        color: shadeColor(color, Math.random() * 60 - 30),
      });
    }

    // Add fragments to the global collection
    fragmentsRef.current = [...fragmentsRef.current, ...fragments];

    // Open dialog after a short delay for pop effect to be visible
    setTimeout(() => {
      setDialogOpen(true);
    }, 500);
  };

  // Find the topmost balloon in a stack of overlapping balloons
  const findTopmostBalloon = (x: number, y: number): Balloon | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const hoveringBalloons = balloonsRef.current.filter((balloon) => {
      if (balloon.popped) return false;

      const dx = balloon.x - x;
      const dy =
        balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // Responsive hit radius based on screen size
      const isLargeScreen = window.innerWidth >= 1200;
      const isMediumScreen = window.innerWidth >= 768;
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      let baseHitRadius;
      if (isLargeScreen) {
        baseHitRadius = 80; // Increased hit radius for large screens
      } else if (isMediumScreen) {
        baseHitRadius = isMobile ? 90 : 70; // Increased hit radius for tablets
      } else {
        baseHitRadius = isMobile ? 90 : 60; // Increased hit radius for mobile
      }

      // Extra generous hit radius for balloons near edges
      const isNearEdge =
        balloon.x > canvasWidth * 0.8 ||
        balloon.x < canvasWidth * 0.2 ||
        balloon.y < canvasHeight * 0.2 ||
        balloon.y > canvasHeight * 0.8;
      const hitRadius = (baseHitRadius + (isNearEdge ? 20 : 0)) * balloon.size;

      return distance < hitRadius;
    });

    if (hoveringBalloons.length === 0) {
      return null;
    }

    // Sort by zIndex (highest first) and then by ID to ensure consistent top balloon
    const selected = hoveringBalloons.reduce((top, current) =>
      current.zIndex > top.zIndex ||
      (current.zIndex === top.zIndex && current.id > top.id)
        ? current
        : top
    );

    return selected;
  };

  // Handle both mouse and touch events
  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    e.preventDefault(); // Prevent default browser behavior
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Get coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('touches' in e) {
      // Touch event - use the first touch point
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Mobile-specific coordinate adjustment
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let clickX = clientX - rect.left;
    let clickY = clientY - rect.top;

    // On mobile, account for potential viewport scaling issues
    if (isMobile) {
      // Get the actual canvas dimensions vs displayed dimensions
      const canvas = canvasRef.current;
      if (canvas) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Adjust coordinates if there's a scaling mismatch
        if (Math.abs(scaleX - scaleY) > 0.1) {
          clickX = clickX * scaleX;
          clickY = clickY * scaleY;
        }
      }
    }

    const topmostBalloon = findTopmostBalloon(clickX, clickY);

    if (topmostBalloon) {
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;

      // Use double-tap/double-click for both mobile and desktop
      if (
        timeSinceLastClick < 300 &&
        lastClickBalloonId === topmostBalloon.id
      ) {
        // Double tap/click detected - pop the balloon
        popBalloon(topmostBalloon.id);
        setLastClickTime(0);
        setLastClickBalloonId(null);
        setDraggingBalloonId(null);
      } else {
        // Single tap/click - start dragging
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
  };

  // Handle both mouse and touch move events
  const throttledPointerMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      // Get coordinates from either mouse or touch event
      let clientX: number, clientY: number;
      if ('touches' in e) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Mobile-specific coordinate adjustment
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      let mouseX = clientX - rect.left;
      let mouseY = clientY - rect.top;

      // On mobile, account for potential viewport scaling issues
      if (isMobile) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Adjust coordinates if there's a scaling mismatch
        if (Math.abs(scaleX - scaleY) > 0.1) {
          mouseX = mouseX * scaleX;
          mouseY = mouseY * scaleY;
        }
      }

      if (draggingBalloonId !== null) {
        balloonsRef.current = balloonsRef.current.map((balloon) => {
          if (balloon.id === draggingBalloonId && !balloon.popped) {
            return {
              ...balloon,
              x: mouseX,
              y: mouseY,
              zIndex: 1000, // Ensure dragged balloon stays on top
            };
          }
          return balloon;
        });
      } else {
        const hoveringBalloonIds = new Set<number>();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;

        balloonsRef.current.forEach((balloon) => {
          if (balloon.popped) return;
          const dx = balloon.x - mouseX;
          const dy =
            balloon.y +
            Math.sin(balloon.floatPhase) * balloon.floatAmount -
            mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // Responsive hit radius for hover detection
          const isLargeScreen = window.innerWidth >= 1200;
          const isMediumScreen = window.innerWidth >= 768;
          const isMobile =
            'ontouchstart' in window || navigator.maxTouchPoints > 0;

          let baseHitRadius;
          if (isLargeScreen) {
            baseHitRadius = 80; // Increased hit radius for large screens
          } else if (isMediumScreen) {
            baseHitRadius = isMobile ? 90 : 70; // Increased hit radius for tablets
          } else {
            baseHitRadius = isMobile ? 90 : 60; // Increased hit radius for mobile
          }

          // Extra generous hit radius for balloons near edges
          const isNearEdge =
            balloon.x > canvasWidth * 0.8 ||
            balloon.x < canvasWidth * 0.2 ||
            balloon.y < canvasHeight * 0.2 ||
            balloon.y > canvasHeight * 0.8;
          const hitRadius =
            (baseHitRadius + (isNearEdge ? 20 : 0)) * balloon.size;
          if (distance < hitRadius) {
            hoveringBalloonIds.add(balloon.id);
          }
        });

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
    [] // Remove draggingBalloonId dependency to prevent infinite re-renders
  );

  // Handle both mouse and touch up events
  const handlePointerUp = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    balloonsRef.current = balloonsRef.current.map((balloon) => ({
      ...balloon,
      isDragging: false,
      pressing: false,
    }));
    setDraggingBalloonId(null);
  };
  // Close dialog handler
  const handleCloseDialog = (): void => {
    setDialogOpen(false);
  };

  // @ts-ignore
  return (
    <div className="w-full">
      {/* CH Balloon Alert */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-t-lg shadow-lg">
        <div className="flex items-center justify-center gap-2 text-sm font-medium">
          <div className="animate-pulse">🎈</div>
          <span>
            Dica: Clique duas vezes no balão <strong>CH</strong> para
            estourá-lo!
          </span>
          <div className="animate-pulse">🎈</div>
        </div>
      </div>

      <div className="flex items-center justify-center h-96 w-full bg-gradient-to-b from-blue-300 to-teal-300 overflow-hidden">
        {/* Audio element for pop sound */}
        <audio ref={audioRef} preload="auto" className="hidden">
          {/* Pop sound would go here */}
        </audio>

        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer touch-none"
            // Mouse events
            onMouseMove={throttledPointerMove}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            // Touch events
            onTouchMove={throttledPointerMove}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
          />
        </div>
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

      {/* High-Conversion Signup Dialog */}
      <SignupDialog
        isOpen={showSignupDialog}
        onClose={() => setShowSignupDialog(false)}
        trigger="balloon"
      />
    </div>
  );
};

export default BalloonField;
