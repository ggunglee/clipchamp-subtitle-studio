import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  Type, 
  Paintbrush, 
  Box, 
  Sparkles, 
  Check, 
  Sliders, 
  Bookmark,
  RotateCcw,
  Layers,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { SubtitleConfig, AnimationType, AnimTargetMode, SubtitleCategory } from '../types/subtitle';
import { PRESET_TEMPLATES, GOOGLE_FONTS_LIST, DEFAULT_SUBTITLE_CONFIG } from '../constants/templates';

interface SidebarControlsProps {
  config: SubtitleConfig;
  onChangeConfig: (newConfig: SubtitleConfig) => void;
  onApplyPreset: (presetConfig: Partial<SubtitleConfig>) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  config,
  onChangeConfig,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'style' | 'shape' | 'animation'>('templates');

  // Template Search, Category & Mood Vibe Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedThemeVibe, setSelectedThemeVibe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const updateField = <K extends keyof SubtitleConfig>(key: K, value: SubtitleConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  // Filter templates based on Category, Mood Vibe, and Search Query
  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((tpl) => {
      const matchesCategory = 
        selectedCategory === 'all' || 
        tpl.category === selectedCategory ||
        (selectedCategory === 'youtube' && (tpl.category === 'youtube' || tpl.category === 'badge')) ||
        (selectedCategory === 'shorts' && (tpl.category === 'shorts' || tpl.category === 'youtube')) ||
        (selectedCategory === 'vlog' && tpl.category === 'vlog') ||
        (selectedCategory === 'speech' && (tpl.category === 'speech' || tpl.category === 'caption-box')) ||
        (selectedCategory === 'corner' && (tpl.category === 'corner' || tpl.category === 'badge')) ||
        (selectedCategory === 'news' && (tpl.category === 'news' || tpl.category === 'info-news')) ||
        (selectedCategory === 'cinematic' && (tpl.category === 'cinematic' || tpl.category === 'cinema')) ||
        (selectedCategory === 'gaming' && (tpl.category === 'gaming' || tpl.category === 'neon'));

      const matchesVibe = 
        selectedThemeVibe === 'all' ||
        !tpl.themeVibe ||
        tpl.themeVibe === selectedThemeVibe;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q || 
        tpl.title.toLowerCase().includes(q) || 
        tpl.description.toLowerCase().includes(q) ||
        (tpl.config.mainText && tpl.config.mainText.toLowerCase().includes(q));

      return matchesCategory && matchesVibe && matchesSearch;
    });
  }, [selectedCategory, selectedThemeVibe, searchQuery]);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[750px] max-h-[85vh] shadow-xl">
      
      {/* Sidebar Header Tabs */}
      <div className="border-b border-slate-800 bg-slate-950 p-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>🎨 템플릿 ({PRESET_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>✍️ 텍스트/폰트</span>
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'style'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>🌈 색상/외곽선</span>
          </button>

          <button
            onClick={() => setActiveTab('shape')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'shape'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>📐 배경/모양</span>
          </button>

          <button
            onClick={() => setActiveTab('animation')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'animation'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ 애니메이션</span>
          </button>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

        {/* 1. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                프리셋 템플릿 탐색기
              </h3>
              <button
                onClick={() => onChangeConfig(DEFAULT_SUBTITLE_CONFIG)}
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                초기화
              </button>
            </div>

            {/* Template Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="템플릿 제목, 대사, 키워드 검색... (예: 브이로그, 질문, 속보, 네온)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-400" />
                  용도별 카테고리:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="all">🌟 전체 영상 용도 (All Uses)</option>
                  <option value="speech">🗣️ 말자막 (대사 / 말풍선 / 하단 자막)</option>
                  <option value="corner">📌 좌상단 / 우상단 코너 뱃지 (위치 & 라벨)</option>
                  <option value="youtube">🎬 유튜브 예능</option>
                  <option value="shorts">📱 숏폼 / 릴스 / 틱톡</option>
                  <option value="vlog">📹 브이로그 / 일상 / 여행</option>
                  <option value="news">📰 시사 / 뉴스 / 지식 교양</option>
                  <option value="cinematic">🎬 영화 / 시네마 / 다큐</option>
                  <option value="gaming">🎮 게임 / 스트리밍</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  디자인 스타일 & 무드:
                </label>
                <select
                  value={selectedThemeVibe}
                  onChange={(e) => setSelectedThemeVibe(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  <option value="all">🌟 전체 디자인 스타일 (All Styles)</option>
                  <option value="sherlock-docu">🕵️ 셜록 / 딥그린 종이 질감</option>
                  <option value="bold-fire">🔥 강렬 3D / 네온 파워</option>
                  <option value="cute-pop">✨ 큐트 파스텔 / 팝</option>
                  <option value="aesthetic-chill">🌿 감성 모던 / 미니멀</option>
                  <option value="cinematic-classic">📜 우아한 바탕 / 클래식 세리프</option>
                  <option value="clean-news">📺 정통 클린 / 뉴스 블랙바</option>
                </select>
              </div>
            </div>

            {/* Filtered Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => onApplyPreset(tpl.config)}
                    className="group relative p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all hover:scale-[1.02] shadow-md"
                  >
                    <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${tpl.previewColor} mb-2 flex items-center justify-center font-extrabold text-xs shadow-inner px-2 text-center truncate`}>
                      {tpl.title}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tpl.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  검색 조건에 일치하는 템플릿이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. TEXT & TYPOGRAPHY TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Main Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                메인 자막 대사 (Main Text)
              </label>
              <textarea
                value={config.mainText}
                onChange={(e) => updateField('mainText', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="자막 내용을 입력하세요"
              />
            </div>

            {/* Sub Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                서브 자막 / 설명 (Sub Text)
              </label>
              <input
                type="text"
                value={config.subText}
                onChange={(e) => updateField('subText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="추가 설명이나 영문 자막"
              />
            </div>

            {/* Font Family Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                글씨체 / 폰트 (Font Family)
              </label>
              <select
                value={config.fontFamily}
                onChange={(e) => updateField('fontFamily', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {GOOGLE_FONTS_LIST.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Sizes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  메인 폰트 크기 ({config.fontSize}px)
                </label>
                <input
                  type="range"
                  min={24}
                  max={140}
                  value={config.fontSize}
                  onChange={(e) => updateField('fontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  서브 폰트 크기 ({config.subFontSize}px)
                </label>
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={config.subFontSize}
                  onChange={(e) => updateField('subFontSize', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                폰트 굵기 (Font Weight: {config.fontWeight})
              </label>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {[
                  { w: '100', label: '초슬림 100' },
                  { w: '200', label: '아주얇게 200' },
                  { w: '300', label: '얇게 300' },
                  { w: '400', label: '보통 400' },
                  { w: '600', label: '중간 600' },
                  { w: '700', label: '볼드 700' },
                  { w: '900', label: '울트라 900' },
                ].map((item) => (
                  <button
                    key={item.w}
                    onClick={() => updateField('fontWeight', item.w)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                      config.fontWeight === item.w
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  가로 위치 ({config.positionX}%)
                </label>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={config.positionX}
                  onChange={(e) => updateField('positionX', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  세로 위치 ({config.positionY}%)
                </label>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={config.positionY}
                  onChange={(e) => updateField('positionY', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* 9-Grid Instant Position Helper */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-amber-400">
                📍 1초 화면 위치 빠른 지정 (좌상단 / 우상단 / 하단 자막 등):
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {[
                  { label: '↖ 좌상단', x: 18, y: 15 },
                  { label: '⬆ 상단중앙', x: 50, y: 15 },
                  { label: '↗ 우상단', x: 82, y: 15 },
                  { label: '◀ 좌측', x: 18, y: 50 },
                  { label: '🎯 중앙', x: 50, y: 50 },
                  { label: '▶ 우측', x: 82, y: 50 },
                  { label: '↙ 좌하단', x: 18, y: 82 },
                  { label: '⬇ 하단자막', x: 50, y: 82 },
                  { label: '↘ 우하단', x: 82, y: 82 },
                ].map((pos) => {
                  const isSelected = config.positionX === pos.x && config.positionY === pos.y;
                  return (
                    <button
                      key={pos.label}
                      type="button"
                      onClick={() => {
                        onChangeConfig({
                          ...config,
                          positionX: pos.x,
                          positionY: pos.y,
                        });
                      }}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. COLOR & STROKE & SHADOW TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Fill Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                텍스트 채우기 (Fill Style)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateField('fillType', 'solid')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    config.fillType === 'solid'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  단색 (Solid)
                </button>
                <button
                  onClick={() => updateField('fillType', 'linear-gradient')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    config.fillType === 'linear-gradient'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  그라데이션 (Gradient)
                </button>
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  메인 색상 1
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <input
                    type="color"
                    value={config.fillColor1}
                    onChange={(e) => updateField('fillColor1', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono uppercase text-slate-300">{config.fillColor1}</span>
                </div>
              </div>

              {config.fillType === 'linear-gradient' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    그라데이션 색상 2
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={config.fillColor2}
                      onChange={(e) => updateField('fillColor2', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono uppercase text-slate-300">{config.fillColor2}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stroke 1 (Primary Outline) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">1차 테두리 외곽선 (Stroke)</span>
                <input
                  type="checkbox"
                  checked={config.strokeEnabled}
                  onChange={(e) => updateField('strokeEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              {config.strokeEnabled && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">외곽선 두께 ({config.strokeWidth}px)</span>
                    <input
                      type="color"
                      value={config.strokeColor}
                      onChange={(e) => updateField('strokeColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={config.strokeWidth}
                    onChange={(e) => updateField('strokeWidth', parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Second Stroke (Outer 3D Outline) */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">2차 이중 외곽선 (Outer Stroke)</span>
                <input
                  type="checkbox"
                  checked={config.secondStrokeEnabled}
                  onChange={(e) => updateField('secondStrokeEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              {config.secondStrokeEnabled && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">이중 외곽선 두께 ({config.secondStrokeWidth}px)</span>
                    <input
                      type="color"
                      value={config.secondStrokeColor}
                      onChange={(e) => updateField('secondStrokeColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={config.secondStrokeWidth}
                    onChange={(e) => updateField('secondStrokeWidth', parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Drop Shadow & Glow */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">입체 그림자 (Drop Shadow)</span>
                <input
                  type="checkbox"
                  checked={config.shadowEnabled}
                  onChange={(e) => updateField('shadowEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              {config.shadowEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">그림자 퍼짐 블러 ({config.shadowBlur}px)</span>
                    <input
                      type="color"
                      value={config.shadowColor.startsWith('#') ? config.shadowColor : '#000000'}
                      onChange={(e) => updateField('shadowColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={config.shadowBlur}
                    onChange={(e) => updateField('shadowBlur', parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Neon Glow */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">네온 야광 불빛 (Neon Glow)</span>
                <input
                  type="checkbox"
                  checked={config.glowEnabled}
                  onChange={(e) => updateField('glowEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              {config.glowEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">네온 블러 반짝임</span>
                    <input
                      type="color"
                      value={config.glowColor}
                      onChange={(e) => updateField('glowColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={config.glowBlur}
                    onChange={(e) => updateField('glowBlur', parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SHAPE & BACKGROUND TAB */}
        {activeTab === 'shape' && (
          <div className="space-y-4">
            {/* Background Container Toggle */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">자막 박스 배경 (Background Box)</span>
                <input
                  type="checkbox"
                  checked={config.bgEnabled}
                  onChange={(e) => updateField('bgEnabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              {config.bgEnabled && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">배경색 & 투명도 ({Math.round(config.bgOpacity * 100)}%)</span>
                    <input
                      type="color"
                      value={config.bgColor}
                      onChange={(e) => updateField('bgColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={config.bgOpacity}
                    onChange={(e) => updateField('bgOpacity', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      모서리 둥글기 (Border Radius: {config.bgBorderRadius}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={config.bgBorderRadius}
                      onChange={(e) => updateField('bgBorderRadius', parseInt(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">가로 여백 (Padding X)</label>
                      <input
                        type="range"
                        min={8}
                        max={60}
                        value={config.bgPaddingX}
                        onChange={(e) => updateField('bgPaddingX', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">세로 여백 (Padding Y)</label>
                      <input
                        type="range"
                        min={4}
                        max={40}
                        value={config.bgPaddingY}
                        onChange={(e) => updateField('bgPaddingY', parseInt(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Shapes: Lower-third, Speech Bubble, Pill Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                특수 디자인 모양 (Special Shapes)
              </label>
              <select
                value={config.shapeStyle}
                onChange={(e) => updateField('shapeStyle', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="none">없음 (기본)</option>
                <option value="lower-third-bar">방송 하단 세로 포인트바 (Lower Third Bar)</option>
                <option value="speech-bubble-tail">웹툰 대사 말풍선 꼬리 (Speech Bubble Tail)</option>
                <option value="pill-badge">쇼츠/인스타 알림 알약 뱃지 (Pill Badge)</option>
                <option value="double-line">시네마틱 상하 더블 라인 (Double Line)</option>
              </select>
            </div>

            {config.shapeStyle === 'speech-bubble-tail' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  말풍선 꼬리 방향
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'bottom-left', label: '하단 좌측' },
                    { id: 'bottom-center', label: '하단 중앙' },
                    { id: 'bottom-right', label: '하단 우측' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => updateField('tailPosition', pos.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        config.tailPosition === pos.id
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. ANIMATION TAB */}
        {activeTab === 'animation' && (
          <div className="space-y-5">
            
            {/* Extended Motion Animations Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                모션 애니메이션 효과 (16종)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'none', label: '정적 (None)' },
                  { id: 'pop-in', label: '탄력 팝인 (Pop-In)' },
                  { id: 'dissolve', label: '디졸브 크로스페이드 (Dissolve)' },
                  { id: 'rise-up', label: '아래에서 솟구침 (Rise Up)' },
                  { id: 'drop-down', label: '위에서 떨어짐 (Drop Down)' },
                  { id: 'zoom-in', label: '확대 줌인 (Zoom In)' },
                  { id: 'zoom-out', label: '축소 줌아웃 (Zoom Out)' },
                  { id: 'flip', label: '3D 뒤집기 (Flip)' },
                  { id: 'bounce', label: '통통 바운스 (Bounce)' },
                  { id: 'fade-in', label: '페이드 인 (Fade In)' },
                  { id: 'slide-up', label: '슬라이드 업 (Slide Up)' },
                  { id: 'slide-left', label: '슬라이드 인 (Slide Left)' },
                  { id: 'typewriter', label: '타자기 (Typewriter)' },
                  { id: 'neon-pulse', label: '네온 반짝임 (Pulse)' },
                  { id: 'shake', label: '분노 분쇄 셰이크' },
                  { id: 'glitch', label: '사이버 글리치' },
                ].map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => updateField('animation', anim.id as AnimationType)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      config.animation === anim.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Staggered Background vs Text Animation Timing */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                배경과 글자 시간차 애니메이션 (Staggered Timing)
              </label>
              <p className="text-[11px] text-slate-400">
                배경 이미지/박스와 텍스트 등장 시점을 딜레이시켜 세부적인 모션을 줍니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {[
                  { id: 'both', label: '⚡ 동시 발생', desc: '배경과 글자가 함께 등장' },
                  { id: 'bg-first', label: '🖼️ 배경 먼저 → 글자 나중에', desc: '배경 박스 등장 후 글자 등장' },
                  { id: 'text-only', label: '📌 배경 고정 → 글자만 발생', desc: '배경은 멈춰있고 글자만 모션' },
                  { id: 'text-first', label: '✍️ 글자 먼저 → 배경 나중에', desc: '글자가 먼저 나오고 배경 감쌈' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateField('animTargetMode', mode.id as AnimTargetMode)}
                    className={`p-2 rounded-xl text-xs text-left border transition-all ${
                      (config.animTargetMode || 'both') === mode.id
                        ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-slate-100">{mode.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Duration Slider */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                애니메이션 지속 시간 ({config.animationDuration}초)
              </label>
              <input
                type="range"
                min={0.3}
                max={3.0}
                step={0.1}
                value={config.animationDuration}
                onChange={(e) => updateField('animationDuration', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
