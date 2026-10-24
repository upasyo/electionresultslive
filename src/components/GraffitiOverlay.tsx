import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Trash2, X, MousePointer, Flame, Clock, RefreshCw, Zap } from 'lucide-react';

interface GraffitiOverlayProps {
  enabled: boolean;
  autoIntervalSeconds?: number;
  burstDurationSeconds?: number;
  onClose?: () => void;
}

export const GraffitiOverlay: React.FC<GraffitiOverlayProps> = ({
  enabled,
  autoIntervalSeconds = 60, // Default 1 minute
  burstDurationSeconds = 5,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ec4899'); // Default vibrant pink
  const [brushSize, setBrushSize] = useState(24);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [secondsUntilNextBurst, setSecondsUntilNextBurst] = useState<number>(autoIntervalSeconds);
  const [isAutoSpraying, setIsAutoSpraying] = useState<boolean>(false);

  const colors = ['#ec4899', '#0284c7', '#ffffff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];
  const tags = ['⚡ 2026 MIDTERMS', '🗳️ VOTE 2026', '🏛️ SENATE 51', '🌟 TEXAS FLIP', '🔥 GEORGIA TOSSUP', '🗽 USA VOTE'];

  // Initialize Canvas
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial decorative tags
    ctx.font = '900 42px sans-serif';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
    ctx.fillText('⚡ 2026 MIDTERMS LIVE', 50, 100);

    ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
    ctx.fillText('🗳️ VOTE 2026', window.innerWidth - 360, 120);

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enabled]);

  // Execute full 360-degree omni-directional spray burst
  const execute360SprayBurst = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsAutoSpraying(true);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let step = 0;
    const maxSteps = 40;

    const burstInterval = setInterval(() => {
      step++;
      const currentRadius = (step / maxSteps) * (Math.min(canvas.width, canvas.height) * 0.48);
      const rays = 18; // 18 directional streams forming 360 degrees

      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + (step * 0.05);
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        const color = colors[(i + step) % colors.length];

        ctx.fillStyle = color;
        // Spray cluster in each radial direction
        for (let p = 0; p < 25; p++) {
          const offsetX = (Math.random() - 0.5) * 35;
          const offsetY = (Math.random() - 0.5) * 35;
          const particleSize = Math.random() * 3.5 + 1;
          ctx.fillRect(x + offsetX, y + offsetY, particleSize, particleSize);
        }

        // Paint drip trails
        if (Math.random() < 0.1) {
          ctx.fillRect(x, y, 2, Math.random() * 25 + 5);
        }
      }

      // Stamp a random election tag at step midpoint
      if (step === 20) {
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        ctx.font = '900 48px sans-serif';
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillText(randomTag, centerX - 180 + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 100);
      }

      if (step >= maxSteps) {
        clearInterval(burstInterval);
        setIsAutoSpraying(false);
      }
    }, 50);
  }, []);

  // Automated 60-second timer loop for auto-spraying
  useEffect(() => {
    if (!enabled) return;

    setSecondsUntilNextBurst(autoIntervalSeconds);

    const timer = setInterval(() => {
      setSecondsUntilNextBurst((prev) => {
        if (prev <= 1) {
          execute360SprayBurst();
          return autoIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, autoIntervalSeconds, execute360SprayBurst]);

  if (!enabled) return null;

  const emitManualSpray = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = currentColor;
    const radius = brushSize;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      const particleSize = Math.random() * 2.5 + 1;
      ctx.fillRect(particleX, particleY, particleSize, particleSize);
    }

    if (Math.random() < 0.1) {
      const dripLength = Math.random() * 20 + 5;
      const dripX = x + (Math.random() - 0.5) * radius;
      ctx.fillRect(dripX, y, 2, dripLength);
    }
  };

  const handlePointerDown = (x: number, y: number) => {
    if (isInteractionPaused) return;
    setIsDrawing(true);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) emitManualSpray(x, y, ctx);
    }
  };

  const handlePointerMove = (x: number, y: number) => {
    if (!isDrawing || isInteractionPaused || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) emitManualSpray(x, y, ctx);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    handlePointerDown(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    handlePointerMove(e.clientX - rect.left, e.clientY - rect.top);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between p-4 transition-colors ${
      isInteractionPaused ? 'pointer-events-none' : 'pointer-events-auto bg-sky-950/10 backdrop-blur-[1px]'
    }`}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handlePointerUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handlePointerUp}
        className={`absolute inset-0 ${isInteractionPaused ? 'pointer-events-none' : 'cursor-crosshair pointer-events-auto'}`}
      />

      {/* Spray Control Toolbar */}
      <div className="relative z-50 pointer-events-auto self-center flex flex-wrap items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/95 text-slate-900 shadow-2xl border-2 border-pink-500 backdrop-blur-md">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-black text-pink-600">
          <Flame className={`w-4 h-4 ${isAutoSpraying ? 'animate-bounce text-pink-500' : 'text-sky-600'}`} />
          <span>REAL AUTO-SPRAY GRAFFITI</span>
        </div>

        <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

        {/* Next Auto Burst Countdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-100 text-sky-900 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-pink-500 animate-spin" />
          <span>Auto Spray in {secondsUntilNextBurst}s</span>
        </div>

        {/* Manual Burst Trigger Button */}
        <button
          onClick={execute360SprayBurst}
          disabled={isAutoSpraying}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-sky-600 hover:from-pink-600 hover:to-sky-700 text-white font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          title="Manually trigger a 360° omni-directional spray burst now"
        >
          <Zap className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>💥 Trigger 360° Burst Now</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

        {/* Palette & Controls */}
        <div className="flex items-center gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-5 h-5 rounded-full border-2 transition-transform shadow-sm ${
                currentColor === color ? 'scale-125 border-slate-900 ring-2 ring-pink-500' : 'border-slate-300 hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Toggle Mode: Draw vs Pass-Through to Site */}
        <button
          onClick={() => setIsInteractionPaused(!isInteractionPaused)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isInteractionPaused
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>{isInteractionPaused ? 'Click Site' : 'Draw On'}</span>
        </button>

        <button
          onClick={clearCanvas}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white transition-colors ml-1 shadow-md"
            title="Exit Graffiti"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative z-50 pointer-events-auto text-center text-[11px] text-sky-950 font-black bg-sky-100/90 border border-sky-300 backdrop-blur px-4 py-1.5 rounded-full self-center shadow-md">
        🎨 Automated Omni-Directional Graffiti Active: Auto-spraying 360° bursts every {autoIntervalSeconds}s (1 minute). Click "Trigger 360° Burst Now" for instant spray decoration!
      </div>
    </div>
  );
};
