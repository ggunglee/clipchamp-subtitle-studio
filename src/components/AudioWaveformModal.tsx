import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Upload,
  Music,
  Sparkles,
  Volume2,
  Download,
  Video,
  Activity,
  Sliders,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { WaveformConfig, WaveformStyle, DEFAULT_WAVEFORM_CONFIG } from '../types/waveform';
import { CHART_THEME_PALETTES, ChartTheme } from '../types/chart';
import { CanvasRatio } from '../types/subtitle';
import { renderWaveformFrame, exportWaveformAsWebMVideo } from '../utils/waveformRenderer';

interface AudioWaveformModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratio: CanvasRatio;
}

export const AudioWaveformModal: React.FC<AudioWaveformModalProps> = ({
  isOpen,
  onClose,
  ratio,
}) => {
  const [config, setConfig] = useState<WaveformConfig>(DEFAULT_WAVEFORM_CONFIG);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Context & Analyser
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Clean up object URL & audio context
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [audioUrl]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Setup Web Audio API Analyser Node
  const setupAudioAnalyser = () => {
    if (!audioRef.current) return;
    if (audioCtxRef.current) return; // Already setup

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (err) {
      console.warn('Audio Context init warning:', err);
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (!audioRef.current) return;

    setupAudioAnalyser();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;
    let startTime = performance.now();

    const draw = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      let freqData: any = null;
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        freqData = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(freqData);
      }

      if (canvasRef.current) {
        renderWaveformFrame(canvasRef.current, config, freqData, ratio, elapsed);
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, config, ratio, isPlaying]);

  // Export WebM Video Synced with Audio
  const handleExportWebM = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await exportWaveformAsWebMVideo(
        audioRef.current,
        config,
        ratio,
        (pct) => setExportProgress(pct)
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio_waveform_${Date.now()}.webm`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('비디오 추출 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export PNG Image
  const handleExportPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio_waveform_${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Audio Element Hidden */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>🎵 다이내믹 음파 비주얼라이저 Studio</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-mono">
                  Real-time Audio Analyzer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                음성 오디오 파일에 맞춰 실시간으로 움직이는 감성 음파 그래픽을 투명 영상으로 추출합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Control Panel (7 Cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-5">
            
            {/* 1. Audio Upload & Player */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-cyan-400" />
                  음성 오디오 파일 업로드 (MP3, WAV, M4A, OGG):
                </span>
                {audioFile && (
                  <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {audioFile.name}
                  </span>
                )}
              </label>

              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-700 hover:border-cyan-500/50 cursor-pointer transition text-xs font-semibold shadow-sm">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{audioFile ? '오디오 파일 변경하기' : '컴퓨터에서 음성 파일 선택...'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Play / Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>일시 정지</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>음성 재생 시연</span>
                    </>
                  )}
                </button>
              </div>

              {!audioFile && (
                <p className="text-[11px] text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  💡 음성 파일을 올리지 않아도 <strong>절차적 데모 주파수 파형</strong>으로 실시간 시연 및 추출이 가능합니다.
                </p>
              )}
            </div>

            {/* 2. Waveform Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                음파 디자인 스타일 선택 (총 5종):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'bar-spectrum', label: '바 이퀄라이저' },
                  { id: 'oscilloscope-line', label: '오실로스코프' },
                  { id: 'radial-ring', label: '라디알 링' },
                  { id: 'podcast-dense', label: '팟캐스트 덴스' },
                  { id: 'neon-aura', label: '네온 아우라' },
                ].map((st) => {
                  const isSelected = config.style === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          style: st.id as WaveformStyle,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Theme & Color Customization */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300">
                🎨 무드 테마 &amp; 음파 포인트 색상:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CHART_THEME_PALETTES).map(([key, pal]) => {
                  const isSelected = config.theme === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: key as ChartTheme,
                          waveColor: undefined,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-bold truncate mb-1">{pal.name}</span>
                      <div className="flex items-center gap-1">
                        {pal.accentColors.slice(0, 4).map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/30 flex-shrink-0"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Wave Color Override */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-300">🎨 음파 포인트 개별 색상 지정:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.waveColor || '#06B6D4'}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, waveColor: e.target.value }))
                    }
                    className="w-7 h-7 p-0 rounded cursor-pointer border border-slate-700 bg-slate-900"
                    title="음파 색상 지정"
                  />
                  {config.waveColor && (
                    <button
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, waveColor: undefined }))}
                      className="text-[10px] text-cyan-400 hover:underline font-semibold"
                    >
                      테마 색상 원복
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Fine-Tuning Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              
              {/* Bar Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  📊 음파 개수 / 밀도 (32 ~ 128):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="32"
                    max="128"
                    step="8"
                    value={config.barCount}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        barCount: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                    {config.barCount}개
                  </span>
                </div>
              </div>

              {/* Sensitivity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  ⚡ 음파 바운싱 감도 (0.5x ~ 2.5x):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={config.sensitivity}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sensitivity: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                    {config.sensitivity.toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Background Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-2 cursor-pointer bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30">
                  <input
                    type="checkbox"
                    checked={config.includeBackground}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        includeBackground: e.target.checked,
                      }))
                    }
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>🖼️ 배경 색상 포함하여 추출 (체크 해제 시 100% 투명 배경)</span>
                </label>
              </div>

            </div>

            {/* 5. Title & Subtitle Inputs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">
                    메인 방송 / 화자 타이틀:
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">
                    서브 타이틀 / 출처:
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Live Canvas Preview Panel (5 Cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-slate-950/60 space-y-4">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  실시간 음파 애니메이션 캔버스:
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {ratio} Ratio
                </span>
              </div>

              {/* Canvas Preview Container */}
              <div className="relative w-full aspect-video bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Export Actions Panel */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200">
                🚀 Clipchamp 타임라인 내보내기:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportPng}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>투명 PNG 스냅샷</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportWebM}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
                >
                  <Video className="w-4 h-4 text-yellow-300" />
                  <span>{isExporting ? `추출 중 (${exportProgress}%)` : '음파 모션 비디오 (WebM)'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
