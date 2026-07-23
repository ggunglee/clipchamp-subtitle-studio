/**
 * 🎵 YouTube Editing SFX Engine (Web Audio API Synthesizer)
 * 100% Offline, Pristine 48kHz, Zero Latency, Zero File Size
 */

export type SFXType = 
  | 'pop'           // 💥 팝/뿅! (Pop/Plop - 귀여운 튀어나옴)
  | 'whoosh'        // 💨 슉/스윽! (Whoosh/Swipe - 슬라이드 이동)
  | 'ding'          // 🔔 띵! / 딩동! (Chime - 뱃지 및 알림)
  | 'click'         // ⌨️ 딸깍! (Click/Typewriter - 타자기 & 버튼)
  | 'tick'          // ⏱️ 째깍! (Tick - 시계 & 스톱워치)
  | 'impact'        // 🥁 두둥! (Impact/Shock - 분노 및 강조 자막)
  | 'glitch'        // ⚡ 찌릿! (Neon Glitch - 사이버 네온 및 글리치)
  | 'fanfare'       // 🎺 빰빠카빰! (Fanfare - 랭킹 1위 & 하이라이트)
  | 'chart-rise';   // 📊 차트 상승음 (Rising Arpeggio - 차트 렌더링)

class SFXEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Connects SFX engine to MediaStreamAudioDestinationNode for WebM Video Recording
   */
  public getAudioDestinationNode(audioCtx: AudioContext): MediaStreamAudioDestinationNode {
    if (!this.destinationNode || this.destinationNode.context !== audioCtx) {
      this.destinationNode = audioCtx.createMediaStreamDestination();
    }
    return this.destinationNode;
  }

  /**
   * Plays a YouTube editing sound effect
   */
  public play(type: SFXType, customCtx?: AudioContext, targetNode?: AudioNode) {
    if (this.isMuted && !customCtx) return;

    try {
      const ctx = customCtx || this.getContext();
      const now = ctx.currentTime;
      const dest = targetNode || ctx.destination;

      switch (type) {
        // 💥 팝 / 뿅! (Pop / Plop)
        case 'pop': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        // 💨 슉 / 스윽! (Whoosh / Swipe)
        case 'whoosh': {
          const bufferSize = ctx.sampleRate * 0.18;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(300, now);
          filter.frequency.exponentialRampToValueAtTime(2400, now + 0.09);
          filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
          filter.Q.setValueAtTime(3, now);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          noise.start(now);
          noise.stop(now + 0.18);
          break;
        }

        // 🔔 띵! / 딩동! (Chime / Bell)
        case 'ding': {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(1046.5, now); // C6
          osc2.frequency.setValueAtTime(2093.0, now); // C7

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(dest);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
          break;
        }

        // ⌨️ 딸깍! (Click / Typewriter)
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        // ⏱️ 째깍! (Clock Tick)
        case 'tick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(2400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.02);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        // 🥁 두둥! (Impact / Shock Dudung)
        case 'impact': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        // ⚡ 찌릿! (Glitch / Cyber Spark)
        case 'glitch': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.setValueAtTime(1500, now + 0.02);
          osc.frequency.setValueAtTime(300, now + 0.04);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        // 🎺 빰빠카빰! (Fanfare Highlight)
        case 'fanfare': {
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.06;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

            osc.connect(gain);
            gain.connect(dest);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
          });
          break;
        }

        // 📊 차트 상승음 (Chart Arpeggio Rise)
        case 'chart-rise': {
          const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

            osc.connect(gain);
            gain.connect(dest);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
          break;
        }
      }
    } catch (err) {
      console.warn('SFX Playback error:', err);
    }
  }
}

export const sfx = new SFXEngine();
