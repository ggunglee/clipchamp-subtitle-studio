import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Image as ImageIcon, 
  Video, 
  Move, 
  Grid, 
  Upload,
  Check
} from 'lucide-react';
import { SubtitleConfig, CanvasRatio } from '../types/subtitle';
import { renderSubtitleToCanvas, getCanvasDimensions } from '../utils/canvasRenderer';
import { sfx, SFXType } from '../utils/sfxManager';

interface PreviewCanvasProps {
  config: SubtitleConfig;
  ratio: CanvasRatio;
  onChangeConfig: (newConfig: SubtitleConfig) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  config,
  ratio,
  onChangeConfig,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [bgType, setBgType] = useState<'checkerboard' | 'dark' | 'beach' | 'neon' | 'gaming' | 'custom'>('checkerboard');
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Animation Loop
  useEffect(() => {
    let active = true;

    const loop = (time: number) => {
      if (!active) return;

      if (isPlaying) {
        const elapsedSec = (time - startTimeRef.current) / 1000;
        const totalDuration = config.animationDuration || 1.0;
        const currentProg = (elapsedSec % totalDuration) / totalDuration;
        setProgress(currentProg);
      }

      if (canvasRef.current) {
        renderSubtitleToCanvas({
          canvas: canvasRef.current,
          config,
          ratio,
          progress: isPlaying ? progress : progress,
          transparentBackground: true,
        });
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [config, ratio, isPlaying, progress]);

  const playMatchingSFX = () => {
    if (config.sfxType === 'none') return;

    if (config.animation === 'typewriter' || config.sfxType === 'click') {
      const textToType = config.mainText || '오늘의 하이라이트!';
      const durationSec = config.animationDuration || 1.5;
      sfx.playTypewriterSequence(textToType, durationSec);
      return;
    }

    if (config.sfxType && config.sfxType !== 'auto') {
      sfx.play(config.sfxType);
      return;
    }

    // Auto matching logic
    let sfxType: SFXType = 'pop';
    if (config.category === 'corner') sfxType = 'ding';
    else if (
      config.animation === 'slide-up' ||
      config.animation === 'slide-left' ||
      config.animation === 'slide-down' ||
      config.animation === 'slide-right' ||
      config.animation === 'rise-up'
    )
      sfxType = 'whoosh';
    else if (config.animation === 'glitch' || config.animation === 'neon-pulse') sfxType = 'glitch';
    else if (config.clockMode === 'realtime-clock' || config.clockMode === 'stopwatch') sfxType = 'tick';

    sfx.play(sfxType);
  };

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (!isPlaying) {
      startTimeRef.current = performance.now() - progress * (config.animationDuration * 1000);
      playMatchingSFX();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    startTimeRef.current = performance.now();
    setProgress(0);
    setIsPlaying(true);
    playMatchingSFX();
  };

  // Handle Custom Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setBgType('custom');
    }
  };

  // Canvas Dragging for position
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePositionFromMouse(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      updatePositionFromMouse(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    onChangeConfig({
      ...config,
      positionX: x,
      positionY: y,
    });
  };

  // Aspect ratio dimensions for wrapper style
  const getAspectRatioStyle = () => {
    switch (ratio) {
      case '16:9':
        return 'aspect-[16/9] max-w-4xl';
      case '9:16':
        return 'aspect-[9/16] max-h-[70vh] max-w-sm';
      case '1:1':
        return 'aspect-square max-w-lg';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4">
      {/* Background Simulation Toggle Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/80 backdrop-blur p-2 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
          <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
          배경 테스트:
        </span>

        <button
          onClick={() => setBgType('checkerboard')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            bgType === 'checkerboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Grid className="w-3 h-3" />
          <span>투명 격자</span>
        </button>

        <button
          onClick={() => setBgType('beach')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            bgType === 'beach' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>🏖️ 해변 브이로그</span>
        </button>

        <button
          onClick={() => setBgType('neon')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            bgType === 'neon' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>🌃 야경 도시</span>
        </button>

        <button
          onClick={() => setBgType('gaming')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            bgType === 'gaming' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>🎮 게임 방송</span>
        </button>

        {/* Custom Video File Upload */}
        <label className="flex items-center space-x-1 px-2.5 py-1 rounded-md cursor-pointer text-slate-300 hover:bg-slate-800 border border-slate-700">
          <Upload className="w-3 h-3 text-indigo-400" />
          <span>내 동영상</span>
          <input
            type="file"
            accept="video/*,image/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Interactive Canvas Wrapper */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full ${getAspectRatioStyle()} rounded-2xl overflow-hidden shadow-2xl border border-slate-800 cursor-move transition-all group select-none`}
      >
        {/* Background Visual Layer */}
        {bgType === 'checkerboard' && (
          <div className="absolute inset-0 bg-checkerboard opacity-90" />
        )}
        {bgType === 'dark' && (
          <div className="absolute inset-0 bg-slate-950" />
        )}
        {bgType === 'beach' && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-sky-500 to-amber-200 flex items-center justify-center">
            <span className="text-white/30 font-bold text-2xl tracking-widest uppercase">Sample Vlog Background</span>
          </div>
        )}
        {bgType === 'neon' && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.15)_0,transparent_70%)]" />
            <span className="text-white/20 font-bold text-2xl tracking-widest uppercase">Sample City Night</span>
          </div>
        )}
        {bgType === 'gaming' && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center">
            <span className="text-emerald-500/20 font-bold text-2xl tracking-widest uppercase">Sample Game Scene</span>
          </div>
        )}
        {bgType === 'custom' && customVideoUrl && (
          <video
            src={customVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Realtime Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Positioning Drag Overlay Indicator */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-2 border-dashed border-indigo-500/40 rounded-2xl">
          <div className="bg-slate-900/80 backdrop-blur text-indigo-300 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
            <Move className="w-3.5 h-3.5" />
            드래그하여 자막 위치 조절 ({config.positionX}%, {config.positionY}%)
          </div>
        </div>
      </div>

      {/* Animation & Timeline Controls (Hidden if animation === 'none') */}
      {config.animation !== 'none' ? (
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-all shrink-0"
            title={isPlaying ? '일시정지' : '재생'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleReplay}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all shrink-0"
            title="처음부터 재개"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timeline Slider */}
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
              {(progress * (config.animationDuration || 1.5)).toFixed(1)}s
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 text-center text-xs text-slate-400">
          <span>📌 정적 자막 모드 (애니메이션 없음)</span>
        </div>
      )}
    </div>
  );
};
