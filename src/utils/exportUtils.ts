import JSZip from 'jszip';
import { SubtitleConfig, CanvasRatio } from '../types/subtitle';
import { renderSubtitleToCanvas, getCanvasDimensions } from './canvasRenderer';
import { SRTItem } from './srtParser';

/**
 * Renders current canvas state to high-res transparent PNG Data URL
 */
export function generatePNGDataUrl(
  config: SubtitleConfig,
  ratio: CanvasRatio,
  progress: number = 1.0
): string {
  const { width, height } = getCanvasDimensions(ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  renderSubtitleToCanvas({
    canvas,
    config,
    ratio,
    progress,
    transparentBackground: true,
  });

  return canvas.toDataURL('image/png');
}

/**
 * Downloads single transparent PNG file
 */
export function downloadPNG(config: SubtitleConfig, ratio: CanvasRatio) {
  const dataUrl = generatePNGDataUrl(config, ratio, 1.0);
  const link = document.createElement('a');
  link.download = `subtitle_${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export const exportAsPng = downloadPNG;

/**
 * Exports transparent WebM video clip using MediaRecorder API
 */
export async function exportAsWebMVideo(
  config: SubtitleConfig,
  ratio: CanvasRatio,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const { width, height } = getCanvasDimensions(ratio);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  const fps = 30;
  const totalFrames = Math.round(fps * config.animationDuration);
  const stream = tempCanvas.captureStream(fps);

  let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    options = { mimeType: 'video/webm;codecs=vp8' };
  }
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    options = { mimeType: 'video/webm' };
  }

  const mediaRecorder = new MediaRecorder(stream, options);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (err) => reject(err);

    mediaRecorder.start();

    let frameIndex = 0;
    const interval = setInterval(() => {
      if (frameIndex >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const progress = frameIndex / (fps * config.animationDuration);
      renderSubtitleToCanvas({
        canvas: tempCanvas,
        config,
        ratio,
        progress: Math.min(1.0, progress),
        transparentBackground: true,
      });

      if (onProgress) {
        onProgress(Math.round((frameIndex / totalFrames) * 100));
      }

      frameIndex++;
    }, 1000 / fps);
  });
}

/**
 * Exports a SINGLE full timeline transparent WebM video containing ALL SRT subtitles at exact timestamps
 */
export async function exportSRTAsSingleWebMVideo(
  srtItems: SRTItem[],
  config: SubtitleConfig,
  ratio: CanvasRatio,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const { width, height } = getCanvasDimensions(ratio);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  if (srtItems.length === 0) {
    throw new Error('No SRT items provided');
  }

  const totalDuration = srtItems[srtItems.length - 1].endSec;
  const fps = 30;
  const totalFrames = Math.round(fps * totalDuration);

  const stream = tempCanvas.captureStream(fps);
  let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9' };
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    options = { mimeType: 'video/webm;codecs=vp8' };
  }
  if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
    options = { mimeType: 'video/webm' };
  }

  const mediaRecorder = new MediaRecorder(stream, options);
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (err) => reject(err);

    mediaRecorder.start();

    let frameIndex = 0;
    const interval = setInterval(() => {
      if (frameIndex >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const currentSec = frameIndex / fps;
      const activeItem = srtItems.find(
        (item) => item.startSec <= currentSec && currentSec <= item.endSec
      );

      if (activeItem) {
        const itemProgress = config.animation === 'none' 
          ? 1.0 
          : Math.min(1.0, (currentSec - activeItem.startSec) / (config.animationDuration || 1.5));
          
        renderSubtitleToCanvas({
          canvas: tempCanvas,
          config,
          ratio,
          progress: itemProgress,
          customMainText: activeItem.text.replace(/[\n\r]+/g, ' '),
          transparentBackground: true,
        });
      } else {
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }

      if (onProgress) {
        onProgress(Math.round((frameIndex / totalFrames) * 100));
      }

      frameIndex++;
    }, 1000 / fps);
  });
}

/**
 * Batch exports multiple text lines into a single ZIP archive containing transparent PNGs
 */
export async function exportBatchAsZip(
  textLines: string[],
  config: SubtitleConfig,
  ratio: CanvasRatio,
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder('clipchamp_subtitles') || zip;
  const { width, height } = getCanvasDimensions(ratio);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  for (let i = 0; i < textLines.length; i++) {
    const line = textLines[i].trim();
    if (!line) continue;

    renderSubtitleToCanvas({
      canvas: tempCanvas,
      config,
      ratio,
      progress: 1.0,
      customMainText: line,
      transparentBackground: true,
    });

    const dataUrl = tempCanvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const fileName = `subtitle_${String(i + 1).padStart(3, '0')}.png`;
    folder.file(fileName, base64Data, { base64: true });

    if (onProgress) {
      onProgress(i + 1, textLines.length);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `clipchamp_subtitles_batch_${Date.now()}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/**
 * Batch exports SRT items with Timecodes into a ZIP archive containing transparent PNGs & Placement manifest
 */
export async function exportSRTBatchAsZip(
  srtItems: SRTItem[],
  config: SubtitleConfig,
  ratio: CanvasRatio,
  onProgress?: (current: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder('srt_timecoded_subtitles') || zip;
  const { width, height } = getCanvasDimensions(ratio);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  let manifestText = `# Clipchamp SRT Timecode Placement Guide\n# Subtitle Design Preset: ${config.name}\n\n`;

  for (let i = 0; i < srtItems.length; i++) {
    const item = srtItems[i];
    const safeText = item.text.replace(/[\n\r]+/g, ' ');

    renderSubtitleToCanvas({
      canvas: tempCanvas,
      config,
      ratio,
      progress: 1.0,
      customMainText: safeText,
      transparentBackground: true,
    });

    const dataUrl = tempCanvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const cleanStart = item.startTime.replace(/[:,]/g, '-');
    const cleanEnd = item.endTime.replace(/[:,]/g, '-');
    const fileName = `${String(i + 1).padStart(3, '0')}_TC_[${cleanStart}_to_${cleanEnd}].png`;

    folder.file(fileName, base64Data, { base64: true });

    manifestText += `[${String(i + 1).padStart(3, '0')}] File: ${fileName}\n    Timecode: ${item.startTime} --> ${item.endTime} (Duration: ${item.duration.toFixed(2)}s)\n    Text: ${safeText}\n\n`;

    if (onProgress) {
      onProgress(i + 1, srtItems.length);
    }
  }

  folder.file('TIMECODE_MANIFEST.txt', manifestText);

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `srt_timecoded_subtitles_${Date.now()}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
