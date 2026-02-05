type SoundName = 'countdown' | 'correct' | 'timeout';

const SOUND_FILES: Record<SoundName, string> = {
  countdown: '/sounds/countdown.mp3',
  correct: '/sounds/noti.mp3',
  timeout: '/sounds/game-over.mp3',
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function ensureAudio() {
  if (!ctx) ctx = new AudioContext();

  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  return { ctx, masterGain };
}

export async function unlockSound() {
  const { ctx } = ensureAudio();
  if (ctx.state === 'suspended') await ctx.resume();
}

export function setSystemSoundVolume(volume01: number, mute?: boolean) {
  const { masterGain } = ensureAudio();
  const v = clamp01(volume01);
  masterGain.gain.value = mute || v <= 0.0001 ? 0 : v;
}

async function loadSound(name: SoundName, url: string) {
  const { ctx } = ensureAudio();

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  buffers[name] = await ctx.decodeAudioData(arrayBuffer);
}

export async function loadAllSounds() {
  await Promise.all((Object.keys(SOUND_FILES) as SoundName[]).map((name) => loadSound(name, SOUND_FILES[name])));
}

export function playSystemSound(name: SoundName) {
  const { ctx, masterGain } = ensureAudio();
  const buffer = buffers[name];
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(masterGain);
  source.start(0);
}
