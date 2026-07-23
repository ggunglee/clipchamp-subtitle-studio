import { ChartConfig, CHART_THEME_PALETTES, ChartDataItem } from '../types/chart';
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

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Helper to retrieve theme colors reliably
function getItemColor(
  item: ChartDataItem,
  idx: number,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  theme: string
): string {
  if (theme.startsWith('monochrome')) {
    return palette.accentColors[idx % palette.accentColors.length];
  }
  return item.color || palette.accentColors[idx % palette.accentColors.length];
}

export function renderChartFrame(
  canvas: HTMLCanvasElement,
  config: ChartConfig,
  progress: number, // 0.0 ~ 1.0
  ratio: CanvasRatio = '16:9',
  transparentBg: boolean = true
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = getCanvasDimensions(ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);

  // Derive palette directly from curated preset
  const palette = CHART_THEME_PALETTES[config.theme] || CHART_THEME_PALETTES.sherlock;

  if (config.includeBackground) {
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);
  } else if (!transparentBg) {
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);
  }

  const t = Math.max(0, Math.min(1, progress));
  const easeT = easeOutCubic(t);
  const backT = Math.max(0, easeOutBack(t));

  const fontFam = config.fontFamily || 'Noto Sans KR';
  const titleFontScale = config.titleFontSize || 1.0;
  const labelFontScale = config.labelFontSize || 1.0;
  const strokeMult = config.strokeThickness || 1.0;

  const titleYOff = (config.titleYOffset || 0) * (height / 1080);
  const chartYOff = (config.chartYOffset || 0) * (height / 1080);
  const chartXOff = (config.chartXOffset || 0) * (width / 1920);

  // Render Header Titles with Alignment & Position Offsets
  const baseTitleY = 110 * (height / 1080) + titleYOff;
  const align = config.headerAlign || 'center';
  const headerX =
    align === 'left'
      ? 140 * (width / 1920) + chartXOff
      : align === 'right'
      ? width - 140 * (width / 1920) + chartXOff
      : width / 2 + chartXOff;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  if (config.title) {
    ctx.font = `900 ${Math.round(48 * titleFontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = config.titleColor || palette.text;
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 6;
    ctx.fillText(config.title, headerX, baseTitleY);
  }

  if (config.subtitle) {
    ctx.font = `500 ${Math.round(24 * titleFontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.subText;
    ctx.shadowBlur = 0;
    ctx.fillText(config.subtitle, headerX, baseTitleY + 64 * titleFontScale * (height / 1080));
  }
  ctx.restore();

  // Render Selected Chart Engine
  const chartAreaY = 240 * (height / 1080) + chartYOff;
  const chartAreaH = height - chartAreaY - 90 * (height / 1080);

  switch (config.type) {
    case 'bar-vertical':
      renderVerticalBarChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, backT, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'bar-horizontal':
      renderHorizontalBarChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'donut-ring':
      renderDonutRingChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, true, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'pie-chart':
      renderDonutRingChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, false, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'line-trend':
      renderLineTrendChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, false, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'area-chart':
      renderLineTrendChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, true, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'radar-spider':
      renderRadarSpiderChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'pyramid-funnel':
      renderPyramidFunnelChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
    case 'progress-ring':
      renderProgressRingChart(ctx, width, height, chartAreaY, chartAreaH, config, palette, easeT, fontFam, labelFontScale, strokeMult, chartXOff);
      break;
  }
}

// 1. Render Vertical Bar Chart
function renderVerticalBarChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  backT: number,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const barCount = items.length;
  const paddingX = 180 * (width / 1920) + chartXOff;
  const availableW = width - (180 * (width / 1920)) * 2;
  const slotW = availableW / barCount;

  // strokeMult controls Bar Width!
  const baseBarW = Math.min(120 * (width / 1920), slotW * 0.55);
  const barW = Math.min(slotW * 0.85, baseBarW * strokeMult);
  const baselineY = chartY + chartH - 40;

  if (config.showGridLines) {
    ctx.save();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5 * strokeMult;
    ctx.setLineDash([6, 6]);
    for (let step = 0; step <= 4; step++) {
      const gy = baselineY - (chartH - 80) * (step / 4);
      ctx.beginPath();
      ctx.moveTo(paddingX - 20, gy);
      ctx.lineTo(paddingX + availableW + 20, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  items.forEach((item, idx) => {
    const slotX = paddingX + idx * slotW;
    const barX = slotX + (slotW - barW) / 2;
    const targetH = (item.value / maxValue) * (chartH - 120);
    const animatedH = targetH * backT;
    const barY = baselineY - animatedH;
    const barColor = getItemColor(item, idx, palette, config.theme);

    ctx.save();
    ctx.fillStyle = barColor;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, barX, barY, barW, animatedH, 12);
    ctx.fill();
    ctx.restore();

    const displayValue = config.showCountUp ? Math.round(item.value * easeT) : item.value;
    ctx.save();
    ctx.font = `800 ${Math.round(28 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${displayValue}${config.unit}`, barX + barW / 2, barY - 12);

    ctx.font = `600 ${Math.round(24 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, barX + barW / 2, baselineY + 16);
    ctx.restore();
  });
}

// 2. Render Horizontal Bar Chart
function renderHorizontalBarChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const barCount = items.length;
  const slotH = chartH / barCount;

  // strokeMult controls Horizontal Bar Height / Thickness!
  const baseBarH = Math.min(50 * (height / 1080), slotH * 0.55);
  const barH = Math.min(slotH * 0.85, baseBarH * strokeMult);
  const startX = 320 * (width / 1920) + chartXOff;
  const maxBarW = width - (320 * (width / 1920)) - 250 * (width / 1920);

  items.forEach((item, idx) => {
    const slotY = chartY + idx * slotH;
    const barY = slotY + (slotH - barH) / 2;
    const targetW = (item.value / maxValue) * maxBarW;
    const animatedW = targetW * easeT;
    const barColor = getItemColor(item, idx, palette, config.theme);

    ctx.save();
    const badgeSize = 36 * fontScale * (height / 1080);
    const badgeX = startX - 240 * (width / 1920);
    const badgeY = barY + (barH - badgeSize) / 2;
    ctx.fillStyle = idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : palette.border;
    drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 8);
    ctx.fill();

    ctx.font = `900 ${Math.round(20 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${idx + 1}`, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
    ctx.restore();

    ctx.save();
    ctx.font = `700 ${Math.round(24 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, badgeX + badgeSize + 16, barY + barH / 2);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = palette.border;
    drawRoundedRect(ctx, startX, barY, maxBarW, barH, 10);
    ctx.fill();

    if (animatedW > 0) {
      ctx.fillStyle = barColor;
      drawRoundedRect(ctx, startX, barY, animatedW, barH, 10);
      ctx.fill();
    }
    ctx.restore();

    const displayValue = config.showCountUp ? Math.round(item.value * easeT) : item.value;
    ctx.save();
    ctx.font = `800 ${Math.round(26 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}${config.unit}`, startX + animatedW + 16, barY + barH / 2);
    ctx.restore();
  });
}

// 3. Render Donut / Pie Ring Chart
function renderDonutRingChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  isDonut: boolean,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const totalValue = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const centerX = width * 0.4 + chartXOff;
  const centerY = chartY + chartH / 2;

  // chartScale controls Donut / Pie Body Size!
  const bodyScale = config.chartScale || 1.0;
  const outerRadius = Math.min(width, height) * 0.22 * bodyScale;

  // strokeMult controls Donut Ring Thickness!
  const ringThicknessRatio = Math.min(0.85, Math.max(0.15, 0.45 * strokeMult));
  const innerRadius = isDonut ? outerRadius * (1 - ringThicknessRatio) : 0;

  let currentAngle = -Math.PI / 2;
  const maxAngleSweep = Math.PI * 2 * easeT;
  let accumulatedSweep = 0;

  items.forEach((item, idx) => {
    const itemSliceAngle = (item.value / totalValue) * Math.PI * 2;
    const drawSweep = Math.min(itemSliceAngle, Math.max(0, maxAngleSweep - accumulatedSweep));

    if (drawSweep > 0) {
      const sliceStartAngle = currentAngle;
      const sliceEndAngle = currentAngle + drawSweep;

      const barColor = getItemColor(item, idx, palette, config.theme);

      ctx.save();
      ctx.fillStyle = barColor;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, sliceStartAngle, sliceEndAngle, false);
      if (isDonut) {
        ctx.arc(centerX, centerY, innerRadius, sliceEndAngle, sliceStartAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    currentAngle += itemSliceAngle;
    accumulatedSweep += itemSliceAngle;
  });

  const legendX = centerX + outerRadius + 60 * (width / 1920);
  
  // Proportional Legend Item Line Spacing based on fontScale to prevent overlapping!
  const itemSpacingY = Math.max(48, 48 * fontScale) * (height / 1080);
  const legendStartY = centerY - ((items.length - 1) * itemSpacingY) / 2;

  items.forEach((item, idx) => {
    const itemY = legendStartY + idx * itemSpacingY;
    const barColor = getItemColor(item, idx, palette, config.theme);

    const pct = ((item.value / totalValue) * 100).toFixed(1);
    const displayValue = config.showCountUp ? Math.round(item.value * easeT) : item.value;

    ctx.save();
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.arc(legendX, itemY, Math.min(16, 10 * fontScale) * (height / 1080), 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `700 ${Math.round(22 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${item.label}: `, legendX + 24 * fontScale, itemY);

    ctx.font = `900 ${Math.round(24 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = barColor;
    ctx.fillText(`${displayValue}${config.unit} (${pct}%)`, legendX + (180 * fontScale) * (width / 1920), itemY);
    ctx.restore();
  });
}

// 4. Render Line / Area Trend Chart
function renderLineTrendChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  isFilledArea: boolean,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const minValue = Math.min(...items.map((i) => i.value), 0);
  const range = maxValue - minValue || 1;

  const paddingX = 180 * (width / 1920) + chartXOff;
  const availableW = width - (180 * (width / 1920)) * 2;
  const baselineY = chartY + chartH - 40;

  if (config.showGridLines) {
    ctx.save();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5 * strokeMult;
    ctx.setLineDash([4, 4]);
    for (let step = 0; step <= 4; step++) {
      const gy = baselineY - (chartH - 80) * (step / 4);
      ctx.beginPath();
      ctx.moveTo(paddingX, gy);
      ctx.lineTo(paddingX + availableW, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  const points = items.map((item, idx) => {
    const px = paddingX + (idx / Math.max(1, items.length - 1)) * availableW;
    const py = baselineY - ((item.value - minValue) / range) * (chartH - 100);
    return { x: px, y: py, item };
  });

  const totalSegments = points.length - 1;
  const currentSegmentProgress = easeT * totalSegments;
  const activePointCount = Math.min(points.length, Math.floor(currentSegmentProgress) + 1);

  const mainColor = getItemColor(items[0], 0, palette, config.theme);

  if (points.length >= 2 && easeT > 0) {
    ctx.save();
    ctx.strokeStyle = mainColor;
    // strokeMult controls Trend Line Stroke Thickness!
    ctx.lineWidth = 6 * strokeMult * (height / 1080);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      if (i <= Math.floor(currentSegmentProgress)) {
        ctx.lineTo(points[i].x, points[i].y);
      } else if (i === Math.floor(currentSegmentProgress) + 1) {
        const segT = currentSegmentProgress - Math.floor(currentSegmentProgress);
        const prev = points[i - 1];
        const curr = points[i];
        ctx.lineTo(prev.x + (curr.x - prev.x) * segT, prev.y + (curr.y - prev.y) * segT);
      }
    }

    if (isFilledArea) {
      const lastPtIndex = Math.min(points.length - 1, Math.floor(currentSegmentProgress) + 1);
      const lastPt = points[lastPtIndex];
      ctx.lineTo(lastPt.x, baselineY);
      ctx.lineTo(points[0].x, baselineY);
      ctx.closePath();
      ctx.fillStyle = mainColor + '40';
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.restore();
  }

  points.slice(0, activePointCount).forEach((pt, idx) => {
    const ptColor = getItemColor(pt.item, idx, palette, config.theme);
    ctx.save();
    ctx.fillStyle = ptColor;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3 * strokeMult;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8 * strokeMult * (height / 1080), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.font = `800 ${Math.round(22 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${pt.item.value}${config.unit}`, pt.x, pt.y - 12);

    ctx.font = `600 ${Math.round(20 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.subText;
    ctx.textBaseline = 'top';
    ctx.fillText(pt.item.label, pt.x, baselineY + 16);
    ctx.restore();
  });
}

// 5. Render Radar Spider Abilities Chart
function renderRadarSpiderChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const count = items.length;
  const centerX = width / 2 + chartXOff;
  const centerY = chartY + chartH / 2;
  const radius = Math.min(width, height) * 0.24 * (config.chartScale || 1.0);
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  // Draw Web Spoke Grid
  for (let level = 1; level <= 4; level++) {
    const rLevel = radius * (level / 4);
    ctx.save();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5 * strokeMult;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * rLevel;
      const y = centerY + Math.sin(angle) * rLevel;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Draw Spokes & Polygon Area
  const polygonPoints: { x: number; y: number }[] = [];

  items.forEach((item, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const spokeX = centerX + Math.cos(angle) * radius;
    const spokeY = centerY + Math.sin(angle) * radius;

    // Spoke Line
    ctx.save();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 1.5 * strokeMult;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(spokeX, spokeY);
    ctx.stroke();
    ctx.restore();

    // Node Point
    const rVal = (item.value / maxValue) * radius * easeT;
    const valX = centerX + Math.cos(angle) * rVal;
    const valY = centerY + Math.sin(angle) * rVal;
    polygonPoints.push({ x: valX, y: valY });

    // Outer Label
    const labelX = centerX + Math.cos(angle) * (radius + 35);
    const labelY = centerY + Math.sin(angle) * (radius + 35);
    const displayVal = config.showCountUp ? Math.round(item.value * easeT) : item.value;

    ctx.save();
    ctx.font = `700 ${Math.round(20 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = Math.abs(Math.cos(angle)) < 0.1 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${item.label} (${displayVal}${config.unit})`, labelX, labelY);
    ctx.restore();
  });

  // Render Filled Polygon
  if (polygonPoints.length > 0) {
    const mainColor = getItemColor(items[0], 0, palette, config.theme);
    ctx.save();
    ctx.fillStyle = mainColor + '40';
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 4 * strokeMult;
    ctx.beginPath();
    polygonPoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// 6. Render Pyramid Funnel Chart (Ref image 4)
function renderPyramidFunnelChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const items = config.items;
  if (!items || items.length === 0) return;

  const count = items.length;
  const centerX = width / 2 + chartXOff;
  const topW = 140 * (width / 1920) * (config.chartScale || 1.0);
  const bottomW = 600 * (width / 1920) * (config.chartScale || 1.0);
  const layerH = (chartH - 40) / count;

  items.forEach((item, idx) => {
    const layerY = chartY + idx * layerH;
    const progressW = (topW + ((bottomW - topW) * (idx + 0.5)) / count) * easeT;
    const xLeft = centerX - progressW / 2;
    const barColor = getItemColor(item, idx, palette, config.theme);

    ctx.save();
    ctx.fillStyle = barColor;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    drawRoundedRect(ctx, xLeft, layerY, progressW, Math.max(10, (layerH - 8) * strokeMult), 8);
    ctx.fill();
    ctx.restore();

    const displayValue = config.showCountUp ? Math.round(item.value * easeT) : item.value;
    ctx.save();
    ctx.font = `800 ${Math.round(22 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${item.label}: ${displayValue}${config.unit}`, centerX, layerY + (layerH - 8) / 2);
    ctx.restore();
  });
}

// 7. Render Progress Ring Gauge Chart
function renderProgressRingChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  chartY: number,
  chartH: number,
  config: ChartConfig,
  palette: typeof CHART_THEME_PALETTES['sherlock'],
  easeT: number,
  fontFam: string,
  fontScale: number,
  strokeMult: number,
  chartXOff: number
) {
  const item = config.items[0] || { label: '진행률', value: 75, color: '#38BDF8' };
  const centerX = width / 2 + chartXOff;
  const centerY = chartY + chartH / 2;
  const radius = Math.min(width, height) * 0.22 * (config.chartScale || 1.0);

  // strokeMult controls Progress Gauge Ring Width!
  const lineWidth = 32 * strokeMult * (height / 1080);

  const startAngle = -Math.PI / 2;
  const totalSweep = (item.value / 100) * Math.PI * 2;
  const animatedSweep = totalSweep * easeT;

  const barColor = getItemColor(item, 0, palette, config.theme);

  // Background Ring Track
  ctx.save();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Progress Stroke Ring
  ctx.save();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, startAngle + animatedSweep);
  ctx.stroke();
  ctx.restore();

  // Center Count-up Text
  const displayVal = config.showCountUp ? Math.round(item.value * easeT) : item.value;
  ctx.save();
  ctx.font = `900 ${Math.round(64 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
  ctx.fillStyle = palette.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${displayVal}${config.unit}`, centerX, centerY - 10);

  ctx.font = `600 ${Math.round(24 * fontScale) * (height / 1080)}px "${fontFam}", sans-serif`;
  ctx.fillStyle = palette.subText;
  ctx.fillText(item.label, centerX, centerY + 50 * (height / 1080));
  ctx.restore();
}

// Export Chart as Single WebM Video
export async function exportChartAsSingleWebMVideo(
  config: ChartConfig,
  ratio: CanvasRatio = '16:9',
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const { width, height } = getCanvasDimensions(ratio);
  canvas.width = width;
  canvas.height = height;

  const totalDurationSec = config.animationDuration || 2.0;
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
    const interval = setInterval(() => {
      if (frame > totalFrames) {
        clearInterval(interval);
        recorder.stop();
        return;
      }

      const progress = frame / totalFrames;
      renderChartFrame(canvas, config, progress, ratio, !config.includeBackground);
      if (onProgress) onProgress(Math.min(100, Math.round(progress * 100)));

      frame++;
    }, 1000 / fps);
  });
}

// Export Chart as PNG Image
export function exportChartAsPNG(
  config: ChartConfig,
  ratio: CanvasRatio = '16:9'
): string {
  const canvas = document.createElement('canvas');
  renderChartFrame(canvas, config, 1.0, ratio, !config.includeBackground);
  return canvas.toDataURL('image/png');
}
