/** 초를 m:ss 로. 1시간 이상이면 h:mm:ss */
export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${mm}:${pad(ss)}`;
}

/** 시간 입력이 틀린 이유 */
export type TimeParseError =
  | 'chars' // 숫자와 : 외의 글자
  | 'noColon' // 숫자만 있다 ("90")
  | 'empty' // 콜론 사이가 비었다 ("1:", ":30")
  | 'parts' // 시:분:초보다 칸이 많다
  | 'secondsDigits' // 초가 두 자리가 아니다 ("1:3")
  | 'minutesDigits' // 시:분:초에서 분이 두 자리가 아니다 ("1:2:03")
  | 'seconds' // 초가 60 이상
  | 'minutes' // 분:초에서 분이 60 이상 ("75:30")
  | 'minutesInHour'; // 시:분:초에서 분이 60 이상

export type TimeParseResult = { ok: true; seconds: number } | { ok: false; error: TimeParseError };

/**
 * 사람이 직접 입력한 시간. **화면에 보이는 표기(formatSeconds) 그대로만** 받고 계산해 주지 않는다.
 * - 분:초 "1:30", "01:30" — 분 0~59, 초는 두 자리 00~59
 * - 시:분:초 "1:02:03" — 분·초는 두 자리 00~59
 *
 * "90"(초)이나 "75:30"(60분 이상)을 받아 1:30, 1:15:30으로 바꿔 주면, 어떤 건 계산해 주고
 * 어떤 건("80:80") 거절하는 셈이 되어 규칙이 흐려진다. "1:3"은 1:03인지 1:30을 치다 만 것인지 모호하다.
 */
export function parseTime(text: string): TimeParseResult {
  const t = text.trim();
  if (/[^\d:]/.test(t)) return { ok: false, error: 'chars' };
  if (!t.includes(':')) return { ok: false, error: 'noColon' };

  const parts = t.split(':');
  if (parts.some((p) => p === '')) return { ok: false, error: 'empty' };
  if (parts.length > 3) return { ok: false, error: 'parts' };

  const [ss, mm] = [parts[parts.length - 1], parts[parts.length - 2]];
  if (ss.length !== 2) return { ok: false, error: 'secondsDigits' };
  if (Number(ss) >= 60) return { ok: false, error: 'seconds' };

  if (parts.length === 2) {
    if (Number(mm) >= 60) return { ok: false, error: 'minutes' };
    return { ok: true, seconds: Number(mm) * 60 + Number(ss) };
  }

  if (mm.length !== 2) return { ok: false, error: 'minutesDigits' };
  if (Number(mm) >= 60) return { ok: false, error: 'minutesInHour' };
  return { ok: true, seconds: Number(parts[0]) * 3600 + Number(mm) * 60 + Number(ss) };
}

/**
 * 타임스탬프 목록 속 시간 표기를 초로. 형식이 아니면 null.
 *
 * 사람이 직접 치는 parseTime과 달리 너그럽다. 남이 쓴 목록을 붙여넣는 것이라
 * "75:30"(60분 이상을 분으로)이나 "1:5" 같은 표기가 실제로 나온다. 받을 수 있으면 받는다.
 * 첫 칸은 60을 넘어도 되고, 나머지 칸이 60 이상이면 시간 표기가 아니다.
 */
export function parseClock(text: string): number | null {
  const parts = text.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d+$/.test(p))) return null;

  const nums = parts.map(Number);
  if (nums.slice(1).some((n) => n >= 60)) return null;

  return parts.length === 3 ? nums[0] * 3600 + nums[1] * 60 + nums[2] : nums[0] * 60 + nums[1];
}
