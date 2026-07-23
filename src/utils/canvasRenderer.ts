import { SubtitleConfig, CanvasRatio, AnimationType } from '../types/subtitle';

export interface RenderOptions {
  canvas: HTMLCanvasElement;
  config: SubtitleConfig;
  ratio: CanvasRatio;
  progress?: number; // Animation progress (0.0 to 1.0)
  customMainText?: string; // Override text for batch generation
  customSubText?: string;
  transparentBackground?: boolean;
}

export function getCanvasDimensions(ratio: CanvasRatio): { width: number; height: number } {
  switch (ratio) {
    case '16:9':
      return { width: 1920, height: 1080 };
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
  }
}

/**
 * Dynamically computes ticking digital clock, stopwatch counter, or countdown timer text
 */
export function formatDynamicClock(
  config: SubtitleConfig,
  mainText: string,
  progress: number
): string {
  const mode = config.clockMode || 'none';
  if (mode === 'none') return mainText;

  const durationSec = config.clockDurationSec || config.animationDuration || 10;
  const currentSecDelta = progress * durationSec;

  if (mode === 'realtime-clock') {
    const timeMatch = mainText.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    
    let baseSec: number;
    let is12Hour = true;

    if (config.clockStartSec !== undefined) {
      baseSec = config.clockStartSec;
    } else if (timeMatch) {
      let hh = parseInt(timeMatch[1], 10);
      const mm = parseInt(timeMatch[2], 10);
      const ss = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const ampm = timeMatch[4] ? timeMatch[4].toUpperCase() : null;

      if (ampm) {
        if (ampm === 'PM' && hh < 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        is12Hour = true;
      } else {
        is12Hour = false;
      }
      baseSec = hh * 3600 + mm * 60 + ss;
    } else {
      // Default to actual current local computer time right now!
      const now = new Date();
      baseSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      is12Hour = true;
    }

    const totalSec = baseSec + currentSecDelta;
    let hours = Math.floor(totalSec / 3600) % 24;
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);

    let displayPeriod = '';
    if (is12Hour) {
      displayPeriod = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }

    const hhStr = String(hours).padStart(2, '0');
    const mmStr = String(mins).padStart(2, '0');
    const ssStr = String(secs).padStart(2, '0');

    const formattedTime = timeMatch && !timeMatch[3] 
      ? `${hhStr}:${mmStr}${displayPeriod}`
      : `${hhStr}:${mmStr}:${ssStr}${displayPeriod}`;

    if (timeMatch) {
      return mainText.replace(timeMatch[0], formattedTime);
    }
    return `⏱️ ${formattedTime}`;
  }

  if (mode === 'stopwatch') {
    const totalSec = currentSecDelta;
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 100);

    const mmStr = String(mins).padStart(2, '0');
    const ssStr = String(secs).padStart(2, '0');
    const msStr = String(ms).padStart(2, '0');

    const formattedStopwatch = `${mmStr}:${ssStr}.${msStr}`;

    const match = mainText.match(/\d{1,2}:\d{2}(?:\.\d{1,2})?/);
    if (match) {
      return mainText.replace(match[0], formattedStopwatch);
    }
    return `⏱️ ${formattedStopwatch}`;
  }

  if (mode === 'countdown') {
    const remainingSec = Math.max(0, durationSec - currentSecDelta);
    const mins = Math.floor(remainingSec / 60);
    const secs = Math.floor(remainingSec % 60);
    const ms = Math.floor((remainingSec % 1) * 100);

    const mmStr = String(mins).padStart(2, '0');
    const ssStr = String(secs).padStart(2, '0');
    const msStr = String(ms).padStart(2, '0');

    const formattedCountdown = `${mmStr}:${ssStr}.${msStr}`;

    const match = mainText.match(/\d{1,2}:\d{2}(?:\.\d{1,2})?/);
    if (match) {
      return mainText.replace(match[0], formattedCountdown);
    }
    return `⏳ ${formattedCountdown}`;
  }

  return mainText;
}

interface AnimState {
  scale: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  glowMult: number;
  displayedMainText: string;
  displayedSubText: string;
}

function calculateAnimState(
  animation: AnimationType,
  t: number,
  mainText: string,
  subText: string
): AnimState {
  let scale = 1;
  let opacity = 1;
  let offsetX = 0;
  let offsetY = 0;
  let scaleX = 1;
  let glowMult = 1;
  let displayedMainText = mainText;
  let displayedSubText = subText;

  const clampT = Math.max(0, Math.min(1, t));

  switch (animation) {
    case 'pop-in': {
      if (clampT < 0.7) {
        scale = (clampT / 0.7) * 1.15;
      } else {
        scale = 1.15 - (clampT - 0.7) * 0.5;
      }
      opacity = Math.min(1, clampT * 2);
      break;
    }
    case 'bounce': {
      scale = 1 + Math.sin(clampT * Math.PI * 4) * 0.08;
      break;
    }
    case 'fade-in': {
      opacity = clampT;
      break;
    }
    case 'dissolve': {
      // Smooth sigmoid / crossfade dissolve
      opacity = Math.sin((clampT * Math.PI) / 2);
      scale = 0.96 + clampT * 0.04;
      break;
    }
    case 'rise-up': {
      offsetY = (1 - Math.sin((clampT * Math.PI) / 2)) * 90;
      opacity = Math.min(1, clampT * 1.5);
      break;
    }
    case 'drop-down': {
      offsetY = -(1 - Math.sin((clampT * Math.PI) / 2)) * 100;
      opacity = Math.min(1, clampT * 1.5);
      break;
    }
    case 'slide-up': {
      offsetY = (1 - clampT) * 80;
      opacity = clampT;
      break;
    }
    case 'slide-left': {
      offsetX = (1 - clampT) * -120;
      opacity = clampT;
      break;
    }
    case 'zoom-in': {
      scale = 0.4 + clampT * 0.6;
      opacity = clampT;
      break;
    }
    case 'zoom-out': {
      scale = 1.5 - clampT * 0.5;
      opacity = clampT;
      break;
    }
    case 'flip': {
      scaleX = Math.abs(Math.cos((1 - clampT) * Math.PI * 0.5));
      opacity = clampT;
      break;
    }
    case 'wipe': {
      opacity = clampT;
      break;
    }
    case 'typewriter': {
      const charCount = Math.floor(clampT * mainText.length);
      displayedMainText = mainText.slice(0, charCount);
      if (subText) {
        const subCharCount = Math.floor(clampT * subText.length);
        displayedSubText = subText.slice(0, subCharCount);
      }
      break;
    }
    case 'neon-pulse': {
      glowMult = 0.5 + Math.abs(Math.sin(clampT * Math.PI * 3)) * 1.2;
      break;
    }
    case 'shake': {
      if (clampT < 0.8) {
        offsetX = (Math.random() - 0.5) * 18;
        offsetY = (Math.random() - 0.5) * 18;
      }
      break;
    }
    case 'glitch': {
      if (clampT < 0.6) {
        offsetX = (Math.random() - 0.5) * 25;
        scale = 1 + (Math.random() - 0.5) * 0.15;
      }
      break;
    }
    case 'none':
    default:
      break;
  }

  return {
    scale,
    opacity,
    offsetX,
    offsetY,
    scaleX,
    glowMult,
    displayedMainText,
    displayedSubText,
  };
}

export function renderSubtitleToCanvas(options: RenderOptions) {
  const {
    canvas,
    config,
    ratio,
    progress = 1.0,
    customMainText,
    customSubText,
    transparentBackground = true,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = getCanvasDimensions(ratio);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);

  if (!transparentBackground) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
  }

  const rawMainText = customMainText !== undefined ? customMainText : config.mainText;
  const mainText = formatDynamicClock(config, rawMainText, progress);
  const subText = customSubText !== undefined ? customSubText : config.subText;

  if (!mainText && !subText) return;

  const centerX = (config.positionX / 100) * width;
  const centerY = (config.positionY / 100) * height;

  const t = Math.max(0, Math.min(1, progress));

  // Determine Staggered Progress for Background & Text
  let bgT = t;
  let textT = t;

  const mode = config.animTargetMode || 'both';

  if (mode === 'bg-first') {
    bgT = Math.min(1, t * 2.2);
    textT = Math.max(0, (t - 0.35) / 0.65);
  } else if (mode === 'text-only') {
    bgT = 1.0; // Stationary background
    textT = t;
  } else if (mode === 'text-first') {
    textT = Math.min(1, t * 2.2);
    bgT = Math.max(0, (t - 0.35) / 0.65);
  }

  const bgAnim = calculateAnimState(config.animation, bgT, mainText, subText);
  const textAnim = calculateAnimState(config.animation, textT, mainText, subText);

  // Prepare Font Measurements first
  const fontSize = config.fontSize * (width / 1920);
  const subFontSize = config.subFontSize * (width / 1920);

  const mainFontStr = `${config.fontWeight} ${fontSize}px "${config.fontFamily}", sans-serif`;
  const subFontStr = `600 ${subFontSize}px "${config.fontFamily}", sans-serif`;

  ctx.save();
  ctx.font = mainFontStr;
  const mainMetrics = ctx.measureText(textAnim.displayedMainText || ' ');
  const mainWidth = mainMetrics.width;

  ctx.font = subFontStr;
  const subMetrics = textAnim.displayedSubText ? ctx.measureText(textAnim.displayedSubText) : { width: 0 };
  const subWidth = subMetrics.width;

  const totalTextWidth = Math.max(mainWidth, subWidth);
  const totalTextHeight = fontSize + (textAnim.displayedSubText ? subFontSize + 16 : 0);
  ctx.restore();

  // 1. RENDER BACKGROUND & SHAPE LAYER
  if (config.bgEnabled || config.shapeStyle !== 'none') {
    ctx.save();
    ctx.translate(centerX + bgAnim.offsetX, centerY + bgAnim.offsetY);
    ctx.scale(bgAnim.scale * bgAnim.scaleX, bgAnim.scale);
    ctx.globalAlpha = bgAnim.opacity;

    const padX = config.bgPaddingX * (width / 1920);
    const padY = config.bgPaddingY * (width / 1920);
    const boxW = totalTextWidth + padX * 2;
    const boxH = totalTextHeight + padY * 2;
    const boxX = -boxW / 2;
    const boxY = -boxH / 2 - 10;

    if (config.bgEnabled) {
      ctx.fillStyle = hexToRgba(config.bgColor, config.bgOpacity);
      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, config.bgBorderRadius);
      ctx.fill();

      if (config.bgBorderWidth > 0) {
        ctx.strokeStyle = config.bgBorderColor;
        ctx.lineWidth = config.bgBorderWidth;
        ctx.stroke();
      }
    }

    if (config.shapeStyle === 'lower-third-bar') {
      ctx.fillStyle = config.shapeAccentColor;
      ctx.fillRect(boxX - 16, boxY, 12, boxH);
    } else if (config.shapeStyle === 'speech-bubble-tail') {
      ctx.fillStyle = config.bgEnabled ? hexToRgba(config.bgColor, config.bgOpacity) : '#FFEA00';
      ctx.beginPath();
      const tailX = config.tailPosition === 'bottom-left' ? boxX + 40 : config.tailPosition === 'bottom-right' ? boxX + boxW - 40 : 0;
      const tailY = boxY + boxH;
      ctx.moveTo(tailX - 15, tailY);
      ctx.lineTo(tailX, tailY + 24);
      ctx.lineTo(tailX + 15, tailY);
      ctx.closePath();
      ctx.fill();
      if (config.bgBorderWidth > 0) {
        ctx.strokeStyle = config.bgBorderColor;
        ctx.lineWidth = config.bgBorderWidth;
        ctx.stroke();
      }
    } else if (config.shapeStyle === 'double-line') {
      ctx.strokeStyle = config.shapeAccentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(boxX - 20, boxY - 8);
      ctx.lineTo(boxX + boxW + 20, boxY - 8);
      ctx.moveTo(boxX - 20, boxY + boxH + 8);
      ctx.lineTo(boxX + boxW + 20, boxY + boxH + 8);
      ctx.stroke();
    } else if (config.shapeStyle === 'tag-header-card') {
      // Sherlock/Docu Header Badge Box attached at top-left
      const badgeW = Math.max(48, fontSize * 1.2);
      const badgeH = boxH;
      const badgeX = boxX - badgeW + 8;

      ctx.fillStyle = config.shapeAccentColor || '#0F3B2E';
      drawRoundedRect(ctx, badgeX, boxY, badgeW, badgeH, 6);
      ctx.fill();

      // Render Badge Icon/Text inside header box (e.g. "!")
      const badgeText = config.badgeText || '!';
      ctx.fillStyle = '#FF5533';
      ctx.font = `900 ${fontSize * 0.9}px "Black Han Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + badgeW / 2, boxY + badgeH / 2);
    } else if (config.shapeStyle === 'tilted-paper') {
      // Tilted paper sticker accent line
      ctx.strokeStyle = config.shapeAccentColor || '#0F3B2E';
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX - 4, boxY - 4, boxW + 8, boxH + 8);
    }

    ctx.restore();
  }

  // 2. RENDER TEXT LAYER
  ctx.save();
  ctx.translate(centerX + textAnim.offsetX, centerY + textAnim.offsetY);
  ctx.scale(textAnim.scale * textAnim.scaleX, textAnim.scale);
  ctx.globalAlpha = textAnim.opacity;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = mainFontStr;

  const textY = textAnim.displayedSubText ? -subFontSize / 2 - 8 : 0;

  // Glow
  if (config.glowEnabled) {
    ctx.shadowColor = config.glowColor;
    ctx.shadowBlur = config.glowBlur * textAnim.glowMult;
  }

  // Shadow
  if (config.shadowEnabled) {
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;
  }

  // Outer stroke
  if (config.secondStrokeEnabled && config.secondStrokeWidth > 0) {
    ctx.strokeStyle = config.secondStrokeColor;
    ctx.lineWidth = (config.strokeWidth + config.secondStrokeWidth * 2) * (width / 1920);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeText(textAnim.displayedMainText, 0, textY);
  }

  // Primary stroke
  if (config.strokeEnabled && config.strokeWidth > 0) {
    ctx.strokeStyle = config.strokeColor;
    ctx.lineWidth = config.strokeWidth * (width / 1920);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeText(textAnim.displayedMainText, 0, textY);
  }

  // Fill
  if (config.fillType === 'linear-gradient') {
    const grad = ctx.createLinearGradient(-mainWidth / 2, textY - fontSize / 2, mainWidth / 2, textY + fontSize / 2);
    grad.addColorStop(0, config.fillColor1);
    grad.addColorStop(1, config.fillColor2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = config.fillColor1;
  }

  ctx.shadowColor = 'transparent';
  ctx.fillText(textAnim.displayedMainText, 0, textY);

  // Sub Text
  if (textAnim.displayedSubText) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = subFontStr;
    const subY = textY + fontSize / 2 + subFontSize / 2 + 12;

    if (config.strokeEnabled && config.strokeWidth > 0) {
      ctx.strokeStyle = config.strokeColor;
      ctx.lineWidth = (config.strokeWidth * 0.6) * (width / 1920);
      ctx.lineJoin = 'round';
      ctx.strokeText(textAnim.displayedSubText, 0, subY);
    }

    ctx.fillStyle = config.subFillColor || '#FFFFFF';
    ctx.fillText(textAnim.displayedSubText, 0, subY);
    ctx.restore();
  }

  ctx.restore();
}

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

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0,0,0,${alpha})`;
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}
