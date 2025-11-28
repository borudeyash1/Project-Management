import React, { useEffect, useRef } from 'react';

interface LightRaysProps {
  className?: string;
  colors?: string[];
}

const LightRays: React.FC<LightRaysProps> = ({ 
  className = '', 
  colors = ['#44a0d1', '#FFD700'] 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const rays: { x: number; y: number; length: number; angle: number; color: string; opacity: number }[] = [];
    const rayCount = 12;

    for (let i = 0; i < rayCount; i++) {
      rays.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        length: Math.random() * 400 + 200,
        angle: (Math.PI * 2 * i) / rayCount,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    let animationId: number;
    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rotation += 0.001;

      rays.forEach((ray, index) => {
        const currentAngle = ray.angle + rotation;
        const endX = ray.x + Math.cos(currentAngle) * ray.length;
        const endY = ray.y + Math.sin(currentAngle) * ray.length;

        const gradient = ctx.createLinearGradient(ray.x, ray.y, endX, endY);
        gradient.addColorStop(0, `${ray.color}00`);
        gradient.addColorStop(0.5, `${ray.color}${Math.floor(ray.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${ray.color}00`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 60;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(ray.x, ray.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default LightRays;
