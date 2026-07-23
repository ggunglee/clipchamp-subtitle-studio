import React from 'react';
import { 
  Film, 
  Download, 
  HelpCircle, 
  Sparkles, 
  Tv, 
  Smartphone, 
  Square,
  Layers,
  FileArchive,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CanvasRatio } from '../types/subtitle';

interface HeaderProps {
  ratio: CanvasRatio;
  onRatioChange: (ratio: CanvasRatio) => void;
  onOpenGuide: () => void;
  onOpenBatch: () => void;
  onOpenChart: () => void;
  onOpenWaveform: () => void;
  onExportPng: () => void;
  onExportWebM: () => void;
  isExportingWebM: boolean;
  exportWebMProgress: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ratio,
  onRatioChange,
  onOpenGuide,
  onOpenBatch,
  onOpenChart,
  onOpenWaveform,
  onExportPng,
  onExportWebM,
  isExportingWebM,
  exportWebMProgress,
  isMuted = false,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                Clipchamp Subtitle Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              마이크로소프트 Clipchamp 용 모션 자막 & 그래픽 타이틀 생성기
            </p>
          </div>
        </div>

        {/* Center: Canvas Ratio Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onRatioChange('16:9')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              ratio === '16:9'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="16:9 가로형 (유튜브/데스크톱)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>16:9</span>
          </button>

          <button
            onClick={() => onRatioChange('9:16')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              ratio === '9:16'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="9:16 세로형 (쇼츠/릴스/틱톡)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>

          <button
            onClick={() => onRatioChange('1:1')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              ratio === '1:1'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="1:1 정사각형 (인스타그램)"
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>
        </div>

        {/* Right Actions: SFX Sound Toggle, Clipchamp Guide, Waveform, Chart, Batch, Export Buttons */}
        <div className="flex items-center space-x-2">
          {/* YouTube Editing SFX Toggle Button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                !isMuted
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800/60'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
              }`}
              title={!isMuted ? '유튜브 효과음 재생 중 (클릭 시 무음)' : '효과음 무음 상태 (클릭 시 재생)'}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">🔊 효과음 ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">🔇 무음</span>
                </>
              )}
            </button>
          )}

          {/* Clipchamp Guide Modal Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/50 transition-all shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Clipchamp 가이드</span>
          </button>

          {/* Audio Waveform Studio Button */}
          <button
            onClick={onOpenWaveform}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-800/50 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">🎵 음파 비주얼라이저</span>
          </button>

          {/* Chart Builder Modal Button */}
          <button
            onClick={onOpenChart}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/50 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">📊 모션 차트</span>
          </button>

          {/* Batch Generator Button */}
          <button
            onClick={onOpenBatch}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">대사 일괄 생성 (ZIP)</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={onExportPng}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>투명 PNG 추출</span>
          </button>

          {/* Export Motion WebM */}
          <button
            onClick={onExportWebM}
            disabled={isExportingWebM}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isExportingWebM ? `비디오 추출 중 (${exportWebMProgress}%)` : '모션 비디오 추출 (WebM)'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
