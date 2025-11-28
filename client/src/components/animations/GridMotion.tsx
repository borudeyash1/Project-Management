import React, { useEffect, useRef } from 'react';

const GridMotion: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Configuration
    const gridSize = 40;
    const dotSize = 1.5;
    const dotColor = 'rgba(68, 160, 209, 0.2)'; // Brand Blue with low opacity
    const activeDotColor = 'rgba(251, 191, 36, 0.6)'; // Brand Yellow
    
    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    const drawGrid = (offset: number) => {
      ctx.fillStyle = dotColor;
      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          // Calculate distance to nearest particle for "active" effect
          let minDist = Infinity;
          particles.forEach(p => {
            const dx = x - p.x;
            const dy = y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) minDist = dist;
          });

          // Draw dot
          ctx.beginPath();
          if (minDist < 150) {
            const opacity = 1 - minDist / 150;
            ctx.fillStyle = `rgba(68, 160, 209, ${0.2 + opacity * 0.4})`;
            const currentSize = dotSize + opacity * 1.5;
            ctx.arc(x, y, currentSize, 0, Math.PI * 2);
          } else {
            ctx.fillStyle = dotColor;
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      drawGrid(0);
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
};

export default GridMotion;
