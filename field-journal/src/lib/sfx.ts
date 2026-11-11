export type SfxName = 'tick' | 'stamp' | 'scribe' | 'chime' | 'fanfare' | 'coin' | 'error' | 'sync';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let soundEnabled = true;
const lastPlayed = new Map<SfxName, number>();

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioCtor) return null;
    try {
      audioContext = new AudioCtor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(audioContext.destination);
    } catch {
      return null;
    }
  }
  return audioContext;
}

function getNoise(context: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const length = Math.floor(context.sampleRate * 0.6);
    noiseBuffer = context.createBuffer(1, length, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function tone(
  context: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
  slideTo?: number
) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  if (masterGain) envelope.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noise(
  context: AudioContext,
  duration: number,
  filterType: BiquadFilterType,
  frequency: number,
  gain: number,
  delay = 0
) {
  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  source.buffer = getNoise(context);
  const filter = context.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, start);
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(envelope);
  if (masterGain) envelope.connect(masterGain);
  source.start(start);
  source.stop(start + duration + 0.02);
}

export function primeAudio() {
  const context = getContext();
  if (context && context.state === 'suspended') {
    void context.resume().catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const unlock = () => primeAudio();
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function setSoundEnabled(value: boolean) {
  soundEnabled = value;
  if (value) primeAudio();
}

export function playSfx(name: SfxName) {
  if (!soundEnabled || typeof window === 'undefined') return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) || 0) < 160) return;
  lastPlayed.set(name, now);
  const context = getContext();
  if (!context || !masterGain) return;
  if (context.state === 'suspended') void context.resume().catch(() => {});

  switch (name) {
    case 'tick':
      noise(context, 0.03, 'highpass', 2600, 0.045);
      tone(context, 1700, 0.025, 'sine', 0.02);
      break;
    case 'stamp':
      tone(context, 150, 0.16, 'sine', 0.1, 0, 68);
      noise(context, 0.1, 'lowpass', 260, 0.055);
      break;
    case 'scribe':
      noise(context, 0.07, 'bandpass', 1500, 0.04);
      noise(context, 0.05, 'bandpass', 2600, 0.03, 0.06);
      break;
    case 'chime':
      tone(context, 880, 0.32, 'sine', 0.045);
      tone(context, 1320, 0.28, 'sine', 0.03, 0.05);
      break;
    case 'fanfare':
      [523, 659, 784, 1046].forEach((frequency, index) => {
        tone(context, frequency, 0.22, 'triangle', 0.045, index * 0.1);
      });
      tone(context, 1046, 0.5, 'triangle', 0.04, 0.42);
      break;
    case 'coin':
      tone(context, 1400, 0.1, 'sine', 0.04, 0, 2100);
      tone(context, 2100, 0.09, 'sine', 0.03, 0.06, 2350);
      break;
    case 'error':
      tone(context, 120, 0.22, 'square', 0.035, 0, 80);
      break;
    case 'sync':
      noise(context, 0.18, 'bandpass', 900, 0.04);
      tone(context, 480, 0.14, 'sine', 0.03, 0, 720);
      break;
    default:
      break;
  }
}
