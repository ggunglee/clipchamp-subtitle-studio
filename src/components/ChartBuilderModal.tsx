import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Download,
  Video,
  Plus,
  Trash2,
  BarChart2,
  PieChart,
  TrendingUp,
  Sparkles,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  ChartConfig,
  ChartType,
  ChartTheme,
  ChartDataItem,
  DEFAULT_CHART_CONFIG,
  CHART_THEME_PALETTES,
} from '../types/chart';
import { renderChartFrame, exportChartAsSingleWebMVideo, exportChartAsPNG } from '../utils/chartCanvasRenderer';
import { CanvasRatio } from '../types/subtitle';
import { sfx } from '../utils/sfxManager';

interface ChartBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratio: CanvasRatio;
}

export const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({
  isOpen,
  onClose,
  ratio,
}) => {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CHART_CONFIG);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Animation Loop
  useEffect(() => {
    if (!isOpen) return;

    let isActive = true;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const duration = config.animationDuration || 2.0;

      const p = Math.min(1.0, elapsed / duration);
      setProgress(p);

      if (canvasRef.current) {
        renderChartFrame(canvasRef.current, config, p, ratio, false);
      }

      if (p < 1.0 && isPlaying && isActive) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    if (isPlaying) {
      startTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (canvasRef.current) {
      renderChartFrame(canvasRef.current, config, progress, ratio, false);
    }

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, config, ratio, isPlaying]);

  if (!isOpen) return null;

  const handleReplay = () => {
    sfx.play('chart-rise');
    setProgress(0);
    setIsPlaying(true);
    startTimeRef.current = null;
  };

  const handleThemeChange = (newTheme: ChartTheme) => {
    const palette = CHART_THEME_PALETTES[newTheme] || CHART_THEME_PALETTES.sherlock;

    setConfig((prev) => ({
      ...prev,
      theme: newTheme,
      items: prev.items.map((item, idx) => ({
        ...item,
        color: palette.accentColors[idx % palette.accentColors.length],
      })),
    }));
  };

  const handleAddItem = () => {
    const palette = CHART_THEME_PALETTES[config.theme] || CHART_THEME_PALETTES.sherlock;
    const newItem: ChartDataItem = {
      id: Date.now().toString(),
      label: `신규 항목 ${config.items.length + 1}`,
      value: 20,
      color: palette.accentColors[config.items.length % palette.accentColors.length],
    };
    setConfig((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (id: string, key: keyof ChartDataItem, value: any) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleExportWebM = async () => {
    setIsExporting(true);
    setExportProgress(0);
    try {
      const blob = await exportChartAsSingleWebMVideo(config, ratio, (pct) => {
        setExportProgress(pct);
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clipchamp_chart_motion_overlay.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export WebM video:', err);
      alert('비디오 추출 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = () => {
    const dataUrl = exportChartAsPNG(config, ratio);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `clipchamp_chart_${config.type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                모션 인포그래픽 & 차트 생성기
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  Clipchamp 호환 WebM
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                수치를 입력하면 60fps 애니메이션 그래프를 생성하여 단 1개의 투명 비디오로 추출합니다.
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

        {/* Main Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Controls & Data Table (7 Cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6">
            {/* 1. Chart Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                차트 종류 선택 (총 9종):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'donut-ring', label: '도넛 링', icon: PieChart },
                  { id: 'pie-chart', label: '파이 차트', icon: PieChart },
                  { id: 'bar-vertical', label: '수직 막대', icon: BarChart2 },
                  { id: 'bar-horizontal', label: '가로 랭킹', icon: Layers },
                  { id: 'line-trend', label: '꺾은선 추세', icon: TrendingUp },
                  { id: 'area-chart', label: '면적 영역', icon: TrendingUp },
                  { id: 'radar-spider', label: '스파이더 력', icon: Sparkles },
                  { id: 'pyramid-funnel', label: '피라미드', icon: Layers },
                  { id: 'progress-ring', label: '프로그레스', icon: PieChart },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = config.type === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          type: type.id as ChartType,
                        }))
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11px] font-semibold transition ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Theme & Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  🎨 디자인 무드 테마 선택:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(CHART_THEME_PALETTES).map(([key, pal]) => {
                    const isSelected = config.theme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleThemeChange(key as ChartTheme)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold truncate mb-2">{pal.name}</span>
                        <div className="flex items-center gap-1.5">
                          {pal.accentColors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 flex-shrink-0"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Font Family Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  🔤 글씨체 (명조체 & 고딕 폰트):
                </label>
                <select
                  value={config.fontFamily || 'Noto Sans KR'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      fontFamily: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Noto Serif KR">🖋️ 노토 세리프 (전통 정통 명조)</option>
                  <option value="Nanum Myeongjo">📜 나눔 명조 (클래식 한글 명조)</option>
                  <option value="Gowun Batang">🌿 고운 바탕 (감성 세리프 명조)</option>
                  <option value="Noto Sans KR">🔹 노토 산스 (클린 고딕)</option>
                  <option value="Inter">🌐 Inter (모던 영문)</option>
                  <option value="Black Han Sans">🔥 블랙 한 산스 (예능 볼드)</option>
                  <option value="Do Hyeon">📰 도현체 (묵직한 헤드라인)</option>
                  <option value="Jua">🎈 주아체 (귀여운 동글)</option>
                  <option value="Montserrat">✨ Montserrat (인공지능 팝)</option>
                  <option value="Orbitron">💡 Orbitron (사이버 SF)</option>
                </select>
              </div>

              {/* Title Font Size Slider */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  👑 제목/부제목 글자 크기:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.1"
                    value={config.titleFontSize || 1.0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        titleFontSize: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {(config.titleFontSize || 1.0).toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Label & Value Font Size Slider */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  🏷️ 그래프 항목/수치 글자 크기:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.1"
                    value={config.labelFontSize || 1.0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        labelFontSize: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {(config.labelFontSize || 1.0).toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Dynamic Feature Stroke / Thickness Slider */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  {config.type === 'bar-vertical' || config.type === 'bar-horizontal'
                    ? '✏️ 막대 너비 / 폭 굵기:'
                    : config.type === 'donut-ring' || config.type === 'progress-ring'
                    ? '✏️ 도넛 링 두께 / 게이지 폭:'
                    : config.type === 'line-trend' || config.type === 'area-chart'
                    ? '✏️ 추세선 굵기 / 외곽선:'
                    : '✏️ 그래픽 요소 두께 & 굵기:'}
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={config.strokeThickness || 1.0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        strokeThickness: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {(config.strokeThickness || 1.0).toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Chart Body Scale Slider */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  ⭕ 그래프 본체/도넛링 전체 크기 스케일:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={config.chartScale || 1.0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chartScale: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {(config.chartScale || 1.0).toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Header Align Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  📐 제목 정렬 위치:
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  {[
                    { id: 'left', label: '◀ 좌측' },
                    { id: 'center', label: '▲ 중앙' },
                    { id: 'right', label: '우측 ▶' },
                  ].map((alignOpt) => (
                    <button
                      key={alignOpt.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          headerAlign: alignOpt.id as 'left' | 'center' | 'right',
                        }))
                      }
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        config.headerAlign === alignOpt.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {alignOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Offsets (Title & Chart Body) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  ↕️ 제목 수직 위치 (위/아래):
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={config.titleYOffset || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        titleYOffset: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {config.titleYOffset || 0}px
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  ↕️ 그래프 본체 수직 위치:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={config.chartYOffset || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chartYOffset: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {config.chartYOffset || 0}px
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400">
                  ↔️ 그래프 본체 수평 위치 (좌/우 이동):
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    step="5"
                    value={config.chartXOffset || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        chartXOffset: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {config.chartXOffset || 0}px
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  ⏱️ 애니메이션 속도:
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.5"
                    value={config.animationDuration}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        animationDuration: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {config.animationDuration}초
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  🏷️ 수치 단위:
                </label>
                <input
                  type="text"
                  value={config.unit}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  placeholder="예: %, 만원, 건, pt"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-2 cursor-pointer bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition">
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
                  <span>🖼️ 배경 색상 포함하여 추출/렌더링 (체크 해제 시 투명 배경)</span>
                </label>

                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showCountUp}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          showCountUp: e.target.checked,
                        }))
                      }
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    카운트업 애니메이션
                  </label>

                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showGridLines}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          showGridLines: e.target.checked,
                        }))
                      }
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    격자선 배경
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Titles & Data Items Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400">
                      메인 타이틀 제목:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">제목 색상:</span>
                      <input
                        type="color"
                        value={config.titleColor || '#FFFFFF'}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, titleColor: e.target.value }))
                        }
                        className="w-6 h-6 p-0 rounded cursor-pointer border border-slate-700 bg-slate-900"
                        title="제목 글자색 지정"
                      />
                      {config.titleColor && (
                        <button
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, titleColor: undefined }))}
                          className="text-[10px] text-amber-400 hover:underline font-semibold"
                        >
                          테마 기본값
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">
                    서브타이틀 / 출처:
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  차트 데이터 수치 입력:
                </label>
                <button
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> 항목 추가
                </button>
              </div>

              {/* Data Table */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {config.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800"
                  >
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) =>
                        handleItemChange(item.id, 'color', e.target.value)
                      }
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleItemChange(item.id, 'label', e.target.value)
                      }
                      placeholder="항목 이름"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'value',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="수치 값"
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                    {config.items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Preview & Export Actions (5 Cols) */}
          <div className="lg:col-span-5 p-6 bg-slate-950 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-amber-400" />
                  실시간 60fps 차트 모션 프리뷰
                </h3>
                <button
                  onClick={handleReplay}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 재생 / 다시보기
                </button>
              </div>

              {/* Interactive Canvas Preview Container */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>모션 진행률</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleExportWebM}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                {isExporting
                  ? `🎬 투명 비디오 추출 중... (${exportProgress}%)`
                  : '🎬 단 1개의 통 투명 비디오 (.webm) 추출'}
              </button>

              <button
                onClick={handleExportPNG}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
              >
                <Download className="w-4 h-4" />
                🖼️ 고화질 투명 PNG 스틸컷 추출
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
