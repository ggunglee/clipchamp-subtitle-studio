import React, { useState } from 'react';
import { X, FileArchive, Download, Loader2, Clock, FileText, Upload, CheckCircle2, Film } from 'lucide-react';
import { SubtitleConfig, CanvasRatio } from '../types/subtitle';
import { exportBatchAsZip, exportSRTBatchAsZip, exportSRTAsSingleWebMVideo } from '../utils/exportUtils';
import { parseSRT, SRTItem } from '../utils/srtParser';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SubtitleConfig;
  ratio: CanvasRatio;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  config,
  ratio,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'srt'>('srt');

  const [enableSubtextPairs, setEnableSubtextPairs] = useState<boolean>(true);

  // Plain Text State
  const [textInput, setTextInput] = useState<string>(
    `안녕하세요! 오늘 영상에 와주셔서 감사합니다.\nhello! thank you for watching today.\n\n오늘은 Clipchamp 자막 제작 꿀팁을 소개합니다.\nclipchamp subtitle creation tips.\n\n구독과 좋아요는 큰 힘이 됩니다!\nsubscribe & like for more content!`
  );

  // SRT State
  const [srtInput, setSrtInput] = useState<string>(
    `1\n00:00:01,500 --> 00:00:04,200\n안녕하세요! 오늘 영상에 와주셔서 감사합니다.\n\n2\n00:00:04,500 --> 00:00:07,800\n오늘은 Clipchamp 자막 제작 꿀팁을 소개합니다.\n\n3\n00:00:08,000 --> 00:00:11,500\n다양한 예능 자막과 말풍선을 적용해보세요.\n\n4\n00:00:12,000 --> 00:00:15,000\n구독과 좋아요는 큰 힘이 됩니다!`
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  if (!isOpen) return null;

  const parsedSrtItems: SRTItem[] = parseSRT(srtInput);

  // Parse Plain Text Lines into Main/Subtext Items
  const parseTextItems = (input: string, subtextMode: boolean): { mainText: string; subText?: string }[] => {
    if (!subtextMode) {
      return input
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => ({ mainText: l, subText: undefined }));
    }

    const blocks = input.split(/\n\s*\n/);
    const items: { mainText: string; subText?: string }[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length === 0) continue;

      for (let i = 0; i < lines.length; i += 2) {
        const mainText = lines[i];
        const subText = lines[i + 1] || undefined;
        items.push({ mainText, subText });
      }
    }

    return items;
  };

  const parsedTextItems = parseTextItems(textInput, enableSubtextPairs);

  // SRT File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSrtInput(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleStartTextBatch = async () => {
    if (parsedTextItems.length === 0) {
      alert('일괄 처리할 대사를 1줄 이상 입력해 주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: parsedTextItems.length });

    try {
      await exportBatchAsZip(parsedTextItems, config, ratio, (current, total) => {
        setProgress({ current, total });
      });
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('ZIP 파일 생성 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  const handleStartSRTZipBatch = async () => {
    if (parsedSrtItems.length === 0) {
      alert('유효한 SRT 자막 항목이 없습니다. SRT 파일 내용이나 타임코드를 확인해 주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: parsedSrtItems.length });

    try {
      await exportSRTBatchAsZip(parsedSrtItems, config, ratio, (current, total) => {
        setProgress({ current, total });
      });
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('SRT ZIP 자막 파일 생성 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  const handleStartSRTSingleVideoBatch = async () => {
    if (parsedSrtItems.length === 0) {
      alert('유효한 SRT 자막 항목이 없습니다. SRT 파일 내용이나 타임코드를 확인해 주세요.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(0);

    try {
      const videoBlob = await exportSRTAsSingleWebMVideo(parsedSrtItems, config, ratio, (percent) => {
        setProgressPercent(percent);
      });

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clipchamp_srt_single_overlay_${Date.now()}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('통 투명 비디오 추출 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                자막 대사 / SRT 타임코드 일괄 생성기
              </h2>
              <p className="text-xs text-slate-400">
                SRT 파일이나 대사를 불러와 현재 디자인 스타일을 전체 일괄 적용하여 PNG 세트 또는 단 1개의 투명 비디오로 추출
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('srt')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'srt'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⏱️ SRT 자막 파일 & 타임코드 (추천)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'text'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 일반 텍스트 줄바꿈 대사</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* TAB 1: SRT Timecode Importer */}
          {activeTab === 'srt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  SRT 파일 업로드 또는 타임코드 텍스트 붙여넣기
                </label>
                <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>SRT 파일 선택 (.srt)</span>
                  <input
                    type="file"
                    accept=".srt,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={srtInput}
                onChange={(e) => setSrtInput(e.target.value)}
                rows={7}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed custom-scrollbar disabled:opacity-50"
                placeholder="SRT 타임코드 내용을 여기에 붙여넣거나 .srt 파일을 업로드하세요..."
              />

              {/* Parsed SRT Live Summary & List Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    파싱 완료된 타임코드 항목 목록
                  </span>
                  <span className="font-mono text-slate-400">
                    총 {parsedSrtItems.length}개 자막 구문
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {parsedSrtItems.length > 0 ? (
                    parsedSrtItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg text-[11px] border border-slate-800/80"
                      >
                        <span className="font-mono text-amber-300 font-semibold shrink-0 mr-2">
                          [{item.startTime} ➔ {item.endTime}]
                        </span>
                        <span className="text-slate-200 truncate flex-1 font-sans">
                          {item.text}
                        </span>
                        <span className="font-mono text-slate-500 shrink-0 ml-2">
                          {item.duration.toFixed(1)}s
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 text-center">
                      유효한 SRT 데이터가 없습니다. SRT 내용을 입력해 주세요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Plain Text Lines */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="subtextToggle"
                    checked={enableSubtextPairs}
                    onChange={(e) => setEnableSubtextPairs(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <label htmlFor="subtextToggle" className="text-xs font-bold text-amber-300 cursor-pointer">
                    🔤 서브 자막 자동 감지 (2줄 1쌍 모드)
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">
                  {enableSubtextPairs ? '윗줄: 메인 자막 / 아랫줄: 서브 자막' : '1줄당 1개 메인 자막'}
                </span>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-100 focus:outline-none focus:border-amber-500 leading-relaxed custom-scrollbar disabled:opacity-50"
                placeholder={
                  enableSubtextPairs
                    ? "윗줄에 메인 자막, 아랫줄에 서브 자막을 입력하세요:\n\n안녕하세요?\nhello?\n\n오늘 날씨가 정말 좋네요!\nIt's a really nice day today!"
                    : "자막 대사를 한 줄씩 입력하세요..."
                }
              />

              {/* Parsed Plain Text Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    생성될 자막 구성 미리보기
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    총 {parsedTextItems.length}개 자막 세트
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {parsedTextItems.length > 0 ? (
                    parsedTextItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col bg-slate-900/80 px-3 py-1.5 rounded-lg text-xs border border-slate-800/80 gap-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold text-[11px]">#{idx + 1}</span>
                          <span className="text-slate-100 font-bold">{item.mainText}</span>
                        </div>
                        {item.subText && (
                          <div className="text-[11px] text-indigo-300 pl-5 italic">
                            ↳ 서브자막: {item.subText}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 text-center">
                      대사를 입력해 주세요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  타임코드 일괄 디자인 자막 처리 중...
                </span>
                <span className="font-mono">
                  {activeTab === 'srt' && progressPercent > 0
                    ? `${progressPercent}%`
                    : `${progress.current} / ${progress.total}`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                  style={{
                    width: `${
                      activeTab === 'srt' && progressPercent > 0
                        ? progressPercent
                        : progress.total
                        ? (progress.current / progress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all disabled:opacity-50"
          >
            취소
          </button>

          {activeTab === 'srt' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleStartSRTZipBatch}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50 border border-slate-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>PNG 세트 (.zip)</span>
              </button>

              <button
                onClick={handleStartSRTSingleVideoBatch}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <Film className="w-4 h-4" />
                <span>🎬 단 1개의 통 투명 비디오 (.webm) 추출</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartTextBatch}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>대사 일괄 ZIP 다운로드</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
