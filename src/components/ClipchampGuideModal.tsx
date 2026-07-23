import React from 'react';
import { X, HelpCircle, Download, Layers, CheckCircle2, ArrowRight, Video } from 'lucide-react';

interface ClipchampGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClipchampGuideModal: React.FC<ClipchampGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Microsoft Clipchamp 적용 가이드
              </h2>
              <p className="text-xs text-slate-400">
                생성된 자막 파일을 클립챔프 영상 편집기에서 활용하는 4단계 방법
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Step 1 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                자막 추출 (투명 PNG 또는 모션 WebM 비디오)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                상단 버튼에서 <strong className="text-emerald-300">투명 PNG 추출</strong>(정적 자막) 또는 <strong className="text-indigo-300">모션 비디오 추출</strong>(움직이는 알파 투명 WebM)을 클릭하여 컴퓨터로 다운로드합니다.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                Clipchamp 실행 및 미디어 가져오기
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                마이크로소프트 Clipchamp 앱을 열고 좌측 상단의 <strong className="text-slate-200">미디어 가져오기 (Import Media)</strong> 버튼을 눌러 방금 다운로드한 PNG 또는 WebM 파일들을 선택합니다.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                비디오 트랙 위에 드래그 앤 드롭 (Overlay)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                가져온 자막 미디어를 타임라인의 <strong className="text-amber-300">메인 비디오 트랙 위쪽 (상단 트랙)</strong>으로 끌어다 놓습니다. 알파 투명 배경이 자동으로 합성됩니다.
              </p>
              
              {/* Visual Track Diagram */}
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                <div className="flex items-center space-x-2 text-indigo-300 bg-indigo-950/40 p-1.5 rounded border border-indigo-800/50">
                  <span className="w-16 font-semibold">Track 2:</span>
                  <span>[ 🎬 자막/모션 그래픽 오버레이 (PNG/WebM) ]</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="w-16 font-semibold">Track 1:</span>
                  <span>[ 📹 메인 원본 동영상 트랙 ]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                자막 싱크 및 지속 시간 조절
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                타임라인 상에서 자막 클립의 양끝을 마우스로 잡고 늘리거나 줄여 말소리에 맞게 노출 시간을 조절하세요.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            확인 및 시작하기
          </button>
        </div>

      </div>
    </div>
  );
};
