import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { PreviewCanvas } from './components/PreviewCanvas';
import { SidebarControls } from './components/SidebarControls';
import { ClipchampGuideModal } from './components/ClipchampGuideModal';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { ChartBuilderModal } from './components/ChartBuilderModal';
import { AudioWaveformModal } from './components/AudioWaveformModal';
import { SubtitleConfig, CanvasRatio } from './types/subtitle';
import { DEFAULT_SUBTITLE_CONFIG } from './constants/templates';
import { exportAsPng, exportAsWebMVideo } from './utils/exportUtils';

export function App() {
  const [config, setConfig] = useState<SubtitleConfig>(DEFAULT_SUBTITLE_CONFIG);
  const [ratio, setRatio] = useState<CanvasRatio>('16:9');
  
  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);
  const [isWaveformOpen, setIsWaveformOpen] = useState<boolean>(false);
  
  // Export WebM status
  const [isExportingWebM, setIsExportingWebM] = useState<boolean>(false);
  const [exportWebMProgress, setExportWebMProgress] = useState<number>(0);

  // Apply Preset Configuration (Cleanly reset styles to prevent state leak)
  const handleApplyPreset = (presetPartial: Partial<SubtitleConfig>) => {
    setConfig((prev) => ({
      ...DEFAULT_SUBTITLE_CONFIG,
      mainText: presetPartial.mainText !== undefined ? presetPartial.mainText : prev.mainText,
      subText: presetPartial.subText !== undefined ? presetPartial.subText : prev.subText,
      positionX: presetPartial.positionX !== undefined ? presetPartial.positionX : prev.positionX,
      positionY: presetPartial.positionY !== undefined ? presetPartial.positionY : prev.positionY,
      ...presetPartial,
    }));
  };

  // Export Single Transparent PNG
  const handleExportPng = () => {
    exportAsPng(config, ratio);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  // Export Animated WebM Video Clip
  const handleExportWebM = async () => {
    setIsExportingWebM(true);
    setExportWebMProgress(0);

    try {
      const blob = await exportAsWebMVideo(config, ratio, (progressPercent) => {
        setExportWebMProgress(progressPercent);
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `clipchamp_animated_subtitle_${Date.now()}.webm`;
      link.href = url;
      link.click();

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
      alert('동영상 추출 중 오류가 발생했습니다. 브라우저 지원 여부를 확인하세요.');
    } finally {
      setIsExportingWebM(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <Header
        ratio={ratio}
        onRatioChange={setRatio}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenChart={() => setIsChartOpen(true)}
        onOpenWaveform={() => setIsWaveformOpen(true)}
        onExportPng={handleExportPng}
        onExportWebM={handleExportWebM}
        isExportingWebM={isExportingWebM}
        exportWebMProgress={exportWebMProgress}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Canvas Preview & Timeline Controls */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center space-y-4">
          <PreviewCanvas
            config={config}
            ratio={ratio}
            onChangeConfig={setConfig}
          />
        </div>

        {/* Right Column: Customization Sidebar Controls */}
        <div className="lg:col-span-5 xl:col-span-4">
          <SidebarControls
            config={config}
            onChangeConfig={setConfig}
            onApplyPreset={handleApplyPreset}
          />
        </div>

      </main>

      {/* Footer info bar */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-400">
        <p>
          🎬 <strong className="text-slate-300">Clipchamp Subtitle Studio</strong> &mdash; 
          마이크로소프트 Clipchamp 오버레이 트랙 최적화 (Transparent PNG &amp; Alpha WebM Video &amp; ZIP Batch &amp; Animated Chart &amp; Audio Waveform)
        </p>
      </footer>

      {/* Guide, Batch, Chart & Waveform Modals */}
      <ClipchampGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <BatchGeneratorModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        config={config}
        ratio={ratio}
      />

      <ChartBuilderModal
        isOpen={isChartOpen}
        onClose={() => setIsChartOpen(false)}
        ratio={ratio}
      />

      <AudioWaveformModal
        isOpen={isWaveformOpen}
        onClose={() => setIsWaveformOpen(false)}
        ratio={ratio}
      />
    </div>
  );
}
