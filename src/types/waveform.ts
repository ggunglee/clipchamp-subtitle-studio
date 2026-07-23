export type WaveformStyle = 
  | 'bar-spectrum'      // Classic Equalizer Bars (Ref user image)
  | 'oscilloscope-line'  // Smooth Oscilloscope Sine Wave
  | 'radial-ring'        // Circular Pulse Ring
  | 'podcast-dense'      // High-Density Symmetrical Peak Wave
  | 'neon-aura';         // Glowing Neon Spectrum

export interface WaveformConfig {
  style: WaveformStyle;
  title: string;
  subtitle: string;
  theme: string;
  waveColor?: string;
  titleColor?: string;
  includeBackground: boolean;
  
  // Waveform Parameters
  barCount: number;         // 32 ~ 128
  barWidth: number;         // 2 ~ 16 px
  sensitivity: number;      // 0.5 ~ 3.0 (Amplitude Multiplier)
  waveHeightScale: number;  // 0.5 ~ 2.0 (Overall Height Scale)
  
  // Offsets & Layout
  titleYOffset: number;
  waveYOffset: number;
  fontFamily: string;
}

export const DEFAULT_WAVEFORM_CONFIG: WaveformConfig = {
  style: 'bar-spectrum',
  title: '🎙️ EP.01 감성 브이로그 오디오 브리핑',
  subtitle: 'Source: Recorded Voice Audio Track',
  theme: 'cyber-neon',
  waveColor: undefined,
  titleColor: undefined,
  includeBackground: false,
  barCount: 64,
  barWidth: 6,
  sensitivity: 1.2,
  waveHeightScale: 1.0,
  titleYOffset: 0,
  waveYOffset: 0,
  fontFamily: 'Noto Serif KR',
};
