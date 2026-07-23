export interface SRTItem {
  id: number;
  startTime: string;
  endTime: string;
  startSec: number;
  endSec: number;
  duration: number;
  text: string;
}

/**
 * Parses timestamp string "00:01:23,456" or "00:01:23.456" into total seconds (number)
 */
export function srtTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length < 3) return 0;

  const hours = parseFloat(parts[0]) || 0;
  const minutes = parseFloat(parts[1]) || 0;
  const seconds = parseFloat(parts[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parses raw SRT string content into an array of SRTItem objects
 */
export function parseSRT(srtContent: string): SRTItem[] {
  const blocks = srtContent.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n\n');
  const items: SRTItem[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n');
    if (lines.length < 2) continue;

    // Line 0: ID (optional numeric)
    let timeLineIdx = 1;
    let id = i + 1;
    if (!lines[0].includes('-->')) {
      id = parseInt(lines[0], 10) || id;
      timeLineIdx = 1;
    } else {
      timeLineIdx = 0;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
    const textLines = lines.slice(timeLineIdx + 1).join('\n').trim();

    const startSec = srtTimeToSeconds(startStr);
    const endSec = srtTimeToSeconds(endStr);
    const duration = Math.max(0.1, endSec - startSec);

    items.push({
      id,
      startTime: startStr,
      endTime: endStr,
      startSec,
      endSec,
      duration,
      text: textLines || '(자막 없음)',
    });
  }

  return items;
}
