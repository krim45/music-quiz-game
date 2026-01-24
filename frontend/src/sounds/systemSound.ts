export const systemSounds = {
  countdown: new Audio('/sounds/countdown.mp3'),
  correct: new Audio('/sounds/noti.mp3'),
  timeout: new Audio('/sounds/game-over.mp3'),
} as const;

type SystemSoundType = keyof typeof systemSounds;

export function playSystemSound(type: SystemSoundType) {
  const sound = systemSounds[type];
  if (!sound) return;

  sound.currentTime = 0; // 연속 재생 대응
  sound.play();
}

export function unlockSound() {
  Object.values(systemSounds).forEach((sound) => {
    sound.volume = 0;
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = 1;
    });
  });
}
