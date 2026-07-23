import { WaveformConfig, WaveformStyle } from '../types/waveform';
import { CHART_THEME_PALETTES } from '../types/chart';
import { CanvasRatio } from '../types/subtitle';
import { getCanvasDimensions } from './canvasRenderer';

// Helper to draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Generate procedural fallback frequency data for smooth animation when audio is not actively playing
export function generateProceduralFrequencyData(count: number, timeSec: number): Uint8Array {
  const data = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const norm = i / count;
    // Bell curve weight center
    const weight = Math.sin(norm * Math.PI);
    const sine1 = Math.sin(timeSec * 4 + i * 0.15) * 0.4 + 0.5;
    const sine2 = Math.cos(timeSec * 7 - i * 0.25) * 0.3 + 0.5;
    const val = (sine1 * 0.6 + sine2 * 0.4) * weight * 220 + 20;
    data[i] = Math.min(255, Math.max(10, val));
  }
  return data;
}

export function renderWaveformFrame(
  canvas: HTMLCanvasElement,
  config: WaveformConfig,
  freqData: Uint8Array | null,
  ratio: CanvasRatio = '16:9',
  timeSec: number = 0
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = getCanvasDimensions(ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);

  // Derive palette
  const palette = CHART_THEME_PALETTES[config.theme as keyof typeof CHART_THEME_PALETTES] || CHART_THEME_PALETTES.sherlock;
  const waveColor = config.waveColor || palette.accentColors[0] || '#06B6D4';

  // Draw Background if enabled
  if (config.includeBackground) {
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);
  }

  const fontFam = config.fontFamily || 'Noto Sans KR';
  const titleYOff = (config.titleYOffset || 0) * (height / 1080);
  const waveYOff = (config.waveYOffset || 0) * (height / 1080);

  // Render Header Titles
  const headerX = width / 2;
  const baseTitleY = 120 * (height / 1080) + titleYOff;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  if (config.title) {
    ctx.font = `900 ${Math.round(44 * (height / 1080))}px "${fontFam}", sans-serif`;
    ctx.fillStyle = config.titleColor || palette.text;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 6;
    ctx.fillText(config.title, headerX, baseTitleY);
  }

  if (config.subtitle) {
    ctx.font = `500 ${Math.round(22 * (height / 1080))}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.subText;
    ctx.shadowBlur = 0;
    ctx.fillText(config.subtitle, headerX, baseTitleY + 60 * (height / 1080));
  }
  ctx.restore();

  // Prepare Frequency Data
  const count = config.barCount || 64;
  const activeFreqData =
    freqData && freqData.length >= count
      ? freqData
      : generateProceduralFrequencyData(count, timeSec);

  // Center Y for Waveform
  const centerY = height * 0.58 + waveYOff;

  switch (config.style) {
    case 'bar-spectrum':
      renderBarSpectrum(ctx, width, height, centerY, count, activeFreqData, config, palette, waveColor);
      break;
    case 'oscilloscope-line':
      renderOscilloscopeLine(ctx, width, height, centerY, count, activeFreqData, config, palette, waveColor);
      break;
    case 'radial-ring':
      renderRadialRing(ctx, width, height, centerY, count, activeFreqData, config, palette, waveColor);
      break;
    case 'podcast-dense':
      renderPodcastDenseWave(ctx, width, height, centerY, count, activeFreqData, config, palette, waveColor);
      break;
    case 'neon-aura':
      renderNeonAuraWave(ctx, width, height, centerY, count, activeFreqData, config, palette, waveColor);
      break;
  }
}

// 1. Classic Equalizer Bar Spectrum (Matching User Reference Image)
function renderBarSpectrum(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerY: number,
  count: number,
  freqData: Uint8Array,
  config: WaveformConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  waveColor: string
) {
  const barW = Math.max(2, (config.barWidth || 6) * (width / 1920));
  const gap = Math.max(2, 4 * (width / 1920));
  const totalW = count * (barW + gap);
  const startX = (width - totalW) / 2;

  const maxH = 220 * (height / 1080) * (config.waveHeightScale || 1.0);
  const sens = config.sensitivity || 1.2;

  for (let i = 0; i < count; i++) {
    const val = (freqData[i] / 255) * sens;
    const barH = Math.max(4, val * maxH);
    const x = startX + i * (barW + gap);
    const yTop = centerY - barH / 2;

    const accentIdx = i % palette.accentColors.length;
    const itemColor = config.waveColor || palette.accentColors[accentIdx];

    ctx.save();
    ctx.fillStyle = itemColor;
    ctx.shadowColor = itemColor + '80';
    ctx.shadowBlur = 8;

    drawRoundedRect(ctx, x, yTop, barW, barH, barW / 2);
    ctx.fill();
    ctx.restore();
  }
}

// 2. Oscilloscope Smooth Sine Wave
function renderOscilloscopeLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerY: number,
  count: number,
  freqData: Uint8Array,
  config: WaveformConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  waveColor: string
) {
  const paddingX = 140 * (width / 1920);
  const availableW = width - paddingX * 2;
  const maxH = 180 * (height / 1080) * (config.waveHeightScale || 1.0);
  const sens = config.sensitivity || 1.2;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = paddingX + (i / (count - 1)) * availableW;
    const normVal = (freqData[i] / 255 - 0.5) * 2 * sens;
    const y = centerY + normVal * (maxH / 2);
    points.push({ x, y });
  }

  // Draw Glow Layer
  ctx.save();
  ctx.strokeStyle = waveColor;
  ctx.lineWidth = 8 * (height / 1080);
  ctx.shadowColor = waveColor;
  ctx.shadowBlur = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  ctx.restore();

  // Draw Core Bright Line
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3 * (height / 1080);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.stroke();
  ctx.restore();
}

// 3. Radial Pulse Ring
function renderRadialRing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerY: number,
  count: number,
  freqData: Uint8Array,
  config: WaveformConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  waveColor: string
) {
  const radius = Math.min(width, height) * 0.18 * (config.waveHeightScale || 1.0);
  const centerX = width / 2;
  const sens = config.sensitivity || 1.2;

  // Background Ring Track
  ctx.save();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Spoke Bars extending radially
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const val = (freqData[i] / 255) * sens;
    const barLen = Math.max(4, val * 90 * (height / 1080));

    const xInner = centerX + Math.cos(angle) * radius;
    const yInner = centerY + Math.sin(angle) * radius;
    const xOuter = centerX + Math.cos(angle) * (radius + barLen);
    const yOuter = centerY + Math.sin(angle) * (radius + barLen);

    const accentIdx = i % palette.accentColors.length;
    const itemColor = config.waveColor || palette.accentColors[accentIdx];

    ctx.save();
    ctx.strokeStyle = itemColor;
    ctx.lineWidth = Math.max(2, (config.barWidth || 4) * (width / 1920));
    ctx.lineCap = 'round';
    ctx.shadowColor = itemColor + '80';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(xInner, yInner);
    ctx.lineTo(xOuter, yOuter);
    ctx.stroke();
    ctx.restore();
  }
}

// 4. High-Density Symmetrical Podcast Wave (Ref audio waveforms)
function renderPodcastDenseWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerY: number,
  count: number,
  freqData: Uint8Array,
  config: WaveformConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  waveColor: string
) {
  const paddingX = 140 * (width / 1920);
  const availableW = width - paddingX * 2;
  const barW = Math.max(1.5, availableW / (count * 1.6));
  const gap = barW * 0.4;
  const maxH = 200 * (height / 1080) * (config.waveHeightScale || 1.0);
  const sens = config.sensitivity || 1.2;

  for (let i = 0; i < count; i++) {
    const val = (freqData[i] / 255) * sens;
    const h = Math.max(2, val * maxH);
    const x = paddingX + i * (barW + gap);
    const yTop = centerY - h / 2;

    const opacity = Math.min(1.0, 0.4 + val * 0.6);
    ctx.save();
    ctx.fillStyle = waveColor;
    ctx.globalAlpha = opacity;

    drawRoundedRect(ctx, x, yTop, barW, h, barW / 2);
    ctx.fill();
    ctx.restore();
  }
}

// 5. Glow Neon Aura Wave
function renderNeonAuraWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerY: number,
  count: number,
  freqData: Uint8Array,
  config: WaveformConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  waveColor: string
) {
  const paddingX = 120 * (width / 1920);
  const availableW = width - paddingX * 2;
  const maxH = 220 * (height / 1080) * (config.waveHeightScale || 1.0);
  const sens = config.sensitivity || 1.2;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = paddingX + (i / (count - 1)) * availableW;
    const val = (freqData[i] / 255) * sens;
    const y = centerY - val * (maxH / 2);
    points.push({ x, y });
  }

  // Draw Luminous Gradient Fill Under Area
  ctx.save();
  ctx.beginPath();
  points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.lineTo(paddingX + availableW, centerY);
  ctx.lineTo(paddingX, centerY);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, centerY - maxH / 2, 0, centerY);
  grad.addColorStop(0, waveColor + 'AA');
  grad.addColorStop(1, waveColor + '00');

  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Draw Symmetrical Bottom Area
  ctx.save();
  ctx.beginPath();
  points.forEach((pt, i) => {
    const yMirror = centerY + (centerY - pt.y);
    if (i === 0) ctx.moveTo(pt.x, yMirror);
    else ctx.lineTo(pt.x, yMirror);
  });
  ctx.lineTo(paddingX + availableW, centerY);
  ctx.lineTo(paddingX, centerY);
  ctx.closePath();

  const gradBottom = ctx.createLinearGradient(0, centerY, 0, centerY + maxH / 2);
  gradBottom.addColorStop(0, waveColor + 'AA');
  gradBottom.addColorStop(1, waveColor + '00');

  ctx.fillStyle = gradBottom;
  ctx.fill();
  ctx.restore();
}

// Export Waveform as Single WebM Video
export async function exportWaveformAsWebMVideo(
  audioElement: HTMLAudioElement | null,
  config: WaveformConfig,
  ratio: CanvasRatio = '16:9',
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const { width, height } = getCanvasDimensions(ratio);
  canvas.width = width;
  canvas.height = height;

  const totalDurationSec = audioElement && audioElement.duration ? audioElement.duration : 4.0;
  const fps = 30;
  const totalFrames = Math.ceil(totalDurationSec * fps);

  const stream = canvas.captureStream(fps);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.onerror = (err) => reject(err);
    recorder.start();

    let frame = 0;
    const count = config.barCount || 64;

    const interval = setInterval(() => {
      if (frame > totalFrames) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      const timeSec = (frame / totalFrames) * totalDurationSec;
      const proceduralData = generateProceduralFrequencyData(count, timeSec);
      renderWaveformFrame(canvas, config, proceduralData, ratio, timeSec);

      if (onProgress) onProgress(Math.min(100, Math.round((frame / totalFrames) * 100)));
      frame++;
    }, 1000 / fps);
  });
}
