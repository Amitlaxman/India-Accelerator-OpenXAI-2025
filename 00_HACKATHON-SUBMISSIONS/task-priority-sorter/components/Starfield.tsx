// File: components/Starfield.tsx
'use client';

import React, { useRef, useEffect } from 'react';

// Define the properties our component will accept
interface StarfieldProps {
  starCount?: number;
  starColor?: string;
  isExiting: boolean; // This prop will trigger the exit animation
}

// Define the structure of a single star
type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
};

const Starfield: React.FC<StarfieldProps> = ({
  starCount = 1500,
  starColor = '#FFFFFF',
  isExiting,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // --- REFACTOR: Use refs to store state that persists across re-renders ---
  const starsRef = useRef<Star[]>([]);
  const animationFrameIdRef = useRef<number | undefined>(undefined);
  // This ref will hold the latest value of the isExiting prop for the animation loop
  const isExitingRef = useRef(isExiting);

  // --- REFACTOR: Sync the latest prop value to the ref ---
  // This effect runs whenever the isExiting prop changes.
  useEffect(() => {
    isExitingRef.current = isExiting;
  }, [isExiting]);

  // --- REFACTOR: This main effect now only runs ONCE on mount ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      // Clear any existing stars and create a new set
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.5,
          speed: 0.1,
        });
      }
    };

    const drawStars = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      starsRef.current.forEach(star => {
        let perspective = canvas.width / star.z;
        let x = centerX + (star.x - centerX) * perspective;
        let y = centerY + (star.y - centerY) * perspective;
        let size = star.size * perspective;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
    };
    
    const updateStars = () => {
      starsRef.current.forEach(star => {
        // The animation loop now reads from the ref to get the LATEST isExiting value
        const targetSpeed = isExitingRef.current ? 25 : 0.1;
        const easingFactor = 0.05;

        star.speed += (targetSpeed - star.speed) * easingFactor;
        star.z -= star.speed;

        if (star.z < 1) {
          star.z = canvas.width;
        }
      });
    };

    const animate = () => {
      updateStars();
      drawStars();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Initialize and start animation
    setCanvasDimensions();
    createStars();
    animate();

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions();
      createStars(); // Recreate stars on resize to fit the new dimensions
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [starCount]); // Only re-run the entire setup if starCount changes

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }} />;
};

export default Starfield;