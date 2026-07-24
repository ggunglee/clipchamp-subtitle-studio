export type CanvasRatio = '16:9' | '9:16' | '1:1';

export type SubtitleCategory = 
  | 'youtube' 
  | 'shorts'
  | 'vlog'
  | 'info-news'
  | 'news'
  | 'cinema'
  | 'cinematic' 
  | 'gaming' 
  | 'lower-third'
  | 'speech'
  | 'speech-bubble'
  | 'corner'
  | 'badge'
  | 'caption-box'
  | 'neon';

export type ThemeVibe = 
  | 'all'
  | 'sherlock-docu'
  | 'bold-fire'
  | 'cute-pop'
  | 'aesthetic-chill'
  | 'cinematic-classic'
  | 'clean-news'
  | 'neon-cyber';

export type AnimationType = 
  | 'none' 
  | 'pop-in' 
  | 'bounce' 
  | 'fade-in' 
  | 'dissolve'
  | 'slide-up' 
  | 'slide-down'
  | 'slide-left' 
  | 'slide-right'
  | 'rise-up'
  | 'drop-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip'
  | 'wipe'
  | 'typewriter' 
  | 'neon-pulse' 
  | 'shake'
  | 'glitch';

export type AnimTargetMode = 'both' | 'bg-first' | 'text-only' | 'text-first';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient';

export type ShapeStyle = 
  | 'none' 
  | 'lower-third-bar' 
  | 'speech-bubble-tail' 
  | 'pill-badge' 
  | 'double-line'
  | 'tag-header-card'
  | 'tilted-paper';

export interface SubtitleConfig {
  id: string;
  name: string;
  category: SubtitleCategory;
  
  // Text content
  mainText: string;
  subText: string;
  badgeText?: string;
  
  // Typography
  fontFamily: string;
  fontSize: number; // in px on 1080p canvas
  subFontSize: number;
  fontWeight: string;
  letterSpacing: number; // in px
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  
  // Fill & Colors
  fillType: FillType;
  fillColor1: string;
  fillColor2: string;
  fillAngle: number; // in deg
  subFillColor: string;
  
  // Primary Stroke
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  
  // Secondary Outer Stroke (3D / Pop effect)
  secondStrokeEnabled: boolean;
  secondStrokeColor: string;
  secondStrokeWidth: number;
  
  // Drop Shadow
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  // Glow (Neon effect)
  glowEnabled: boolean;
  glowColor: string;
  glowBlur: number;
  
  // Background Box / Badge
  bgEnabled: boolean;
  bgColor: string;
  bgOpacity: number;
  bgPaddingX: number;
  bgPaddingY: number;
  bgBorderRadius: number;
  bgBorderColor: string;
  bgBorderWidth: number;
  
  // Shape Decors & Lower Thirds
  shapeStyle: ShapeStyle;
  shapeAccentColor: string;
  tailPosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';

  // Position & Alignment (Percentage 0-100 relative to canvas)
  positionX: number;
  positionY: number;
  
  // Animation
  animation: AnimationType;
  animationDuration: number; // entrance animation duration in seconds
  holdDuration?: number; // hold/still display duration after animation completes (in seconds)
  animationDelay: number;
  animTargetMode?: AnimTargetMode;

  // Dynamic Clock & Stopwatch Counter
  clockMode?: 'none' | 'realtime-clock' | 'stopwatch' | 'countdown';
  clockStartSec?: number;
  clockDurationSec?: number;

  // Custom User Sound Effect Selection
  sfxType?: 'auto' | 'pop' | 'whoosh' | 'ding' | 'click' | 'tick' | 'impact' | 'glitch' | 'fanfare' | 'chart-rise' | 'netflix' | 'dung-tak' | 'boom' | 'thunder' | 'sad-trom' | 'none';
}

export interface PresetTemplate {
  id: string;
  title: string;
  category: SubtitleCategory;
  themeVibe?: ThemeVibe;
  description: string;
  previewColor: string;
  config: Partial<SubtitleConfig>;
}
