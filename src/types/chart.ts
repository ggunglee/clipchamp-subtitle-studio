export type ChartType = 
  | 'bar-vertical' 
  | 'bar-horizontal' 
  | 'donut-ring' 
  | 'pie-chart'
  | 'line-trend' 
  | 'area-chart'
  | 'radar-spider'
  | 'pyramid-funnel'
  | 'progress-ring';

export type ChartTheme = 
  | 'sherlock' 
  | 'news' 
  | 'bold' 
  | 'monochrome-black'
  | 'monochrome-white'
  | 'minimal' 
  | 'pastel'
  | 'cyber-neon'
  | 'retro-synthwave';

export interface ChartDataItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  subtitle: string;
  items: ChartDataItem[];
  theme: ChartTheme;
  
  // Custom Title Color
  titleColor?: string;       // Custom hex color for main title text (e.g. #F59E0B, #06B6D4)
  
  // Background Inclusion
  includeBackground: boolean; // Whether to render theme background on export & canvas

  // Typography & Font Sizes
  fontFamily: string;       // e.g. "Noto Serif KR", "Noto Sans KR"
  titleFontSize: number;    // 0.6 ~ 2.0 multiplier for Header Title
  labelFontSize: number;    // 0.6 ~ 2.0 multiplier for Graph Items & Data Labels
  strokeThickness: number;  // 0.4 ~ 2.5 multiplier for Bar Width / Line Weight / Ring Gauge
  
  // Layout & Offsets
  chartScale: number;       // 0.5 ~ 1.8 multiplier for Chart Body Size
  titleYOffset: number;     // -100 ~ +100 px vertical offset
  chartYOffset: number;     // -100 ~ +100 px vertical offset
  chartXOffset: number;     // -150 ~ +150 px horizontal offset
  headerAlign: 'left' | 'center' | 'right';

  showCountUp: boolean;
  showGridLines: boolean;
  unit: string; // e.g. "%", "만원", "건", "pt"
  animationDuration: number; // in seconds (e.g. 1.5 ~ 3.0s)
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  type: 'donut-ring',
  title: '2026 주요 시장 점유율 분석',
  subtitle: 'Source: Media Trend Data',
  theme: 'sherlock',
  titleColor: undefined,
  includeBackground: false,
  fontFamily: 'Noto Serif KR',
  titleFontSize: 1.0,
  labelFontSize: 1.0,
  strokeThickness: 1.0,
  chartScale: 1.0,
  titleYOffset: 0,
  chartYOffset: 0,
  chartXOffset: 0,
  headerAlign: 'center',
  showCountUp: true,
  showGridLines: true,
  unit: '%',
  animationDuration: 2.0,
  items: [
    { id: '1', label: '모바일 서비스', value: 45, color: '#0F3B2E' },
    { id: '2', label: '소프트웨어', value: 25, color: '#44D0A0' },
    { id: '3', label: '하드웨어', value: 18, color: '#D97706' },
    { id: '4', label: '기타 콘텐츠', value: 12, color: '#E11D48' },
  ]
};

export const CHART_THEME_PALETTES: Record<ChartTheme, { name: string; bg: string; text: string; subText: string; accentColors: string[]; border: string }> = {
  sherlock: {
    name: '🕵️ 셜록 딥그린 종이 질감',
    bg: '#F5F2EB',
    text: '#0F3B2E',
    subText: '#4A5568',
    border: '#D6D0C2',
    accentColors: ['#0F3B2E', '#44D0A0', '#D97706', '#E11D48', '#2563EB'],
  },
  news: {
    name: '📺 시사 뉴스 다크 블루',
    bg: '#0F172A',
    text: '#FFFFFF',
    subText: '#94A3B8',
    border: '#1E293B',
    accentColors: ['#38BDF8', '#818CF8', '#34D399', '#FBBF24', '#F472B6'],
  },
  bold: {
    name: '🔥 핫이슈 3D 파워',
    bg: '#18181B',
    text: '#FACC15',
    subText: '#E4E4E7',
    border: '#27272A',
    accentColors: ['#EF4444', '#F59E0B', '#10B981', '#6366F1', '#EC4899'],
  },
  'monochrome-black': {
    name: '🖤 모노크롬 시크 블랙',
    bg: '#09090B',
    text: '#FFFFFF',
    subText: '#A1A1AA',
    border: '#27272A',
    accentColors: ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#71717A', '#3F3F46'],
  },
  'monochrome-white': {
    name: '🤍 모노크롬 퓨어 화이트',
    bg: '#FFFFFF',
    text: '#09090B',
    subText: '#52525B',
    border: '#E4E4E7',
    accentColors: ['#09090B', '#27272A', '#52525B', '#8E8E93', '#D1D1D6'],
  },
  minimal: {
    name: '🌿 감성 미니멀 샌드',
    bg: '#FAFAF9',
    text: '#1C1917',
    subText: '#78716C',
    border: '#E7E5E4',
    accentColors: ['#44403C', '#78716C', '#A8A29E', '#D6D3D1', '#57534E'],
  },
  pastel: {
    name: '✨ 키치 파스텔',
    bg: '#FFF1F2',
    text: '#881337',
    subText: '#9F1239',
    border: '#FECDD3',
    accentColors: ['#FB7185', '#F472B6', '#C084FC', '#38BDF8', '#34D399'],
  },
  'cyber-neon': {
    name: '💡 사이버펑크 네온',
    bg: '#09090B',
    text: '#06B6D4',
    subText: '#E879F9',
    border: '#3F3F46',
    accentColors: ['#06B6D4', '#EC4899', '#A855F7', '#10B981', '#F59E0B'],
  },
  'retro-synthwave': {
    name: '📼 레트로 신스웨이브',
    bg: '#180B28',
    text: '#FF71CE',
    subText: '#01CDFE',
    border: '#3A1550',
    accentColors: ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF', '#FFFB96'],
  },
};
