type SoundName = 'countdown' | 'correct' | 'timeout';

const SOUND_FILES: Record<SoundName, string> = {
  countdown: '/sounds/countdown.mp3',
  correct: '/sounds/noti.mp3',
  timeout: '/sounds/game-over.mp3',
};

let audioContext: AudioContext | null = null;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function unlockSound() {
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

async function loadSound(name: SoundName, url: string) {
  const ctx = getAudioContext();

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  buffers[name] = audioBuffer;
}

export async function loadAllSounds() {
  await Promise.all((Object.keys(SOUND_FILES) as SoundName[]).map((name) => loadSound(name, SOUND_FILES[name])));
}

export function playSystemSound(name: SoundName) {
  const ctx = getAudioContext();
  const buffer = buffers[name];

  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}
