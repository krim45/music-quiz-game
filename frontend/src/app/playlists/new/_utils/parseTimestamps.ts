/**
 * 타임스탬프 목록을 붙여넣으면 곡 구간으로 바꾼다.
 *
 * 유튜브의 설명란이든 댓글이든 남이 정리한 메모든
 * 같은 파서로 처리할 수 있다.
 *
 * 형식이 제각각이라 100%는 불가능하다. 그래서 줄마다 규칙을 늘리기보다
 * - 목록 전체를 보고 구분자를 정하고 (한 번에 붙여넣는 목록은 대개 한 사람이 같은 형식으로 쓴다)
 * - 추측이 틀리면 사용자가 목록 단위로 바로잡을 수 있게 옵션을 받는다.
 * 파싱 결과를 사용자가 확인·수정하는 화면도 반드시 필요하다.
 */

import { parseClock } from '@/utils/time';

export type ParsedTrack = {
  /** 구간 시작(초) */
  startSeconds: number;
  /** 구간 끝(초). 줄에 구간("00:00 - 03:42")이 적혀 있으면 그 끝, 아니면 다음 항목의 시작. 둘 다 없으면 null */
  endSeconds: number | null;
  singer: string;
  title: string;
  /** 파싱 근거를 보여주기 위한 원문 */
  raw: string;
};

/**
 * 가수와 제목 사이 구분자 후보. 앞에 있을수록 동률일 때 먼저 고른다.
 * 하이픈은 이름 안에도 흔해서("pH-1", "D-Hack") 양옆에 공백이 있을 때만 구분자로 본다.
 */
export const SEPARATORS = {
  dash: { label: '-', pattern: /\s+[-–—]\s+/ },
  underscore: { label: '_', pattern: /\s*_\s*/ },
  slash: { label: '/', pattern: /\s+\/\s+/ },
  pipe: { label: '|', pattern: /\s+\|\s+/ },
} as const;

export type SeparatorKey = keyof typeof SEPARATORS;

export type ParseOptions = {
  /** 비우면 목록 전체에서 가장 많이 쓰인 구분자를 고른다. custom은 적힌 글자 그대로 나눈다 */
  separator?: SeparatorKey | { custom: string };
  /** "제목 - 가수" 순서로 쓴 목록용 */
  swap?: boolean;
  /** 제목에서 (Feat. …) (Prod. …) [MV] 같은 표기를 뺀다 */
  cleanTitle?: boolean;
};

export type ParseResult = {
  tracks: ParsedTrack[];
  /** 자동으로 고른 구분자. 어느 것도 목록 절반 이상에 나오지 않으면 null */
  detected: SeparatorKey | null;
};

const TIME = String.raw`\d{1,2}:\d{2}(?::\d{2})?`;
/** 첫 번째 시간 표기 */
const TIME_RE = new RegExp(`(${TIME})`);
/** 구간 표기: "00:00 - 03:42", "0:00~3:42", "00:00 – 03:42" */
const RANGE_RE = new RegExp(String.raw`(${TIME})\s*[-–—~]\s*(${TIME})`);

const OPEN_OF: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const CLOSE_OF: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

const countOf = (s: string, ch: string) => s.split(ch).length - 1;

/**
 * 줄 앞뒤의 장식을 걷어낸다: "1.", "-", "|", "·", 불릿, 괄호 등.
 *
 * 괄호는 짝이 맞으면 곡 정보다 — "Hype Boy (Live)", "(여자)아이들", "밤편지 [MV]".
 * 걷어낼 괄호는 두 가지뿐이다.
 * - 시간 표기를 지우고 남은 빈 괄호: "[00:00] 좋은 날" → "[ ] 좋은 날"
 * - 짝이 없는 괄호: 위처럼 시간이 빠지며 한쪽만 남은 것
 *
 * 한 겹을 벗기면 다른 장식이 드러날 수 있어("1. [ ] - 곡"), 더 벗겨낼 게 없을 때까지 반복한다.
 */
function stripDecoration(s: string): string {
  let out = s.replace(/[\[({]\s*[\])}]/g, ' ').trim();

  for (let i = 0; i < 5; i += 1) {
    const before = out;

    out = out
      .replace(/^[\s\-–—·•*|]+/, '') // 앞머리 장식
      .replace(/^\d{1,3}[.)]\s*/, '') // 앞머리 번호 "1." "2)"
      .replace(/[\s\-–—·•*|]+$/, '') // 꼬리 장식
      .trim();

    // 짝이 없는 여는 괄호가 맨 앞에 있으면 뗀다
    const head = out[0];
    if (head in CLOSE_OF && countOf(out, head) > countOf(out, CLOSE_OF[head])) out = out.slice(1).trim();

    // 짝이 없는 닫는 괄호가 맨 끝에 있으면 뗀다
    const tail = out[out.length - 1];
    if (tail in OPEN_OF && countOf(out, tail) > countOf(out, OPEN_OF[tail])) out = out.slice(0, -1).trim();

    if (out === before) break;
  }

  return out;
}

/**
 * 목록 절반 이상의 줄에 나오는 구분자 중 가장 많이 나오는 것.
 * 절반을 못 넘기면 우연히 들어간 기호일 수 있어(제목 속 " - " 등) 고르지 않는다.
 */
function detectSeparator(texts: string[]): SeparatorKey | null {
  let best: SeparatorKey | null = null;
  let bestCount = 0;

  for (const key of Object.keys(SEPARATORS) as SeparatorKey[]) {
    const count = texts.filter((t) => SEPARATORS[key].pattern.test(t)).length;
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }

  return bestCount * 2 >= texts.length ? best : null;
}

/**
 * 첫 번째 구분자에서 나눈다 ("IU - 좋은 날 - Live" → "IU" / "좋은 날 - Live").
 * 구분자가 없는 줄은 제목만 있는 것으로 본다.
 */
function splitArtistTitle(text: string, separator: RegExp | string | null): { singer: string; title: string } {
  if (!separator) return { singer: '', title: text };

  let index = -1;
  let length = 0;

  if (typeof separator === 'string') {
    index = text.indexOf(separator);
    length = separator.length;
  } else {
    const m = text.match(separator);
    if (m?.index !== undefined) {
      index = m.index;
      length = m[0].length;
    }
  }

  const singer = index > 0 ? text.slice(0, index).trim() : '';
  const title = index > 0 ? text.slice(index + length).trim() : '';

  // 구분자가 맨 앞·맨 뒤에 있어 한쪽이 비면 나누지 않은 것으로 본다
  if (!singer || !title) return { singer: '', title: text };
  return { singer, title };
}

/** 정답으로 치지 않는 표기. 괄호 안이 이 말로 시작하면 괄호째 뺀다 */
const TITLE_NOISE = /^(feat|ft|featuring|prod|produced|mv|m\/v|official|lyrics?|audio|visualizer)\b/i;

/** s[start]의 여는 괄호와 짝이 되는 닫는 괄호 위치. 괄호 안의 괄호도 센다: "(Feat. 이을 (E.ul))" */
function findClosing(s: string, start: number): number {
  const open = s[start];
  const close = CLOSE_OF[open];
  let depth = 0;

  for (let i = start; i < s.length; i += 1) {
    if (s[i] === open) depth += 1;
    if (s[i] === close && --depth === 0) return i;
  }

  return -1;
}

/**
 * 제목에서 채점에 방해되는 표기를 뺀다.
 *
 * 채점은 괄호 부분을 빼고 입력해도 인정하지만, "거리에서 (Feat. ASH ISLAND)"처럼
 * 제목에 남아 있으면 목록과 정답 공개 화면에 그대로 보인다. 사람이 정답으로 떠올리지 않는 표기만 뺀다.
 * "밤 (Night)" "Hype Boy (Live)"처럼 다른 괄호는 곡 정보일 수 있어 그대로 둔다.
 */
function cleanTitle(title: string): string {
  let out = '';

  for (let i = 0; i < title.length; i += 1) {
    if (title[i] in CLOSE_OF) {
      const end = findClosing(title, i);
      if (end !== -1 && TITLE_NOISE.test(title.slice(i + 1, end).trim())) {
        i = end;
        continue;
      }
    }

    out += title[i];
  }

  // 괄호 없이 붙은 피처링: "거리에서 feat. ASH ISLAND"
  out = out.replace(/\s+(feat|ft|featuring)\.?\s.*$/i, '');

  const cleaned = out.replace(/\s{2,}/g, ' ').trim();
  // 전부 지워지면 원래 제목을 둔다 — 빈 제목보다는 고칠 거리가 있는 편이 낫다
  return cleaned || title;
}

/**
 * 줄에서 시간을 읽는다. 줄 어디에 있든 된다.
 *
 * 구간("00:00 - 03:42")이 있으면 시작과 끝을 함께 읽는다. 첫 시간만 읽으면
 * 두 번째 시간이 곡 정보로 남아 가수가 "03:42 IU"가 된다.
 * 구간이 아니면 첫 번째 시간 표기만 시작으로 쓴다 — 제목 속 시간("4:44")은 곡 정보다.
 */
function readTime(line: string): { start: number; end: number | null; matched: string } | null {
  const range = line.match(RANGE_RE);
  if (range) {
    const start = parseClock(range[1]);
    const end = parseClock(range[2]);
    // 끝이 시작보다 앞이면 표기 실수로 보고 끝은 버린다. 두 시간 모두 곡 정보가 아니므로 함께 걷어낸다
    if (start !== null) return { start, end: end !== null && end > start ? end : null, matched: range[0] };
  }

  const m = line.match(TIME_RE);
  if (!m) return null;

  const start = parseClock(m[1]);
  return start === null ? null : { start, end: null, matched: m[1] };
}

export function parseTimestamps(input: string, options: ParseOptions = {}): ParseResult {
  const found: { startSeconds: number; endSeconds: number | null; text: string; raw: string }[] = [];

  for (const line of input.split('\n')) {
    if (!line.trim()) continue;

    const time = readTime(line);
    if (!time) continue;

    // 시간 표기를 뺀 나머지가 곡 정보
    const text = stripDecoration(line.replace(time.matched, ' '));
    if (!text) continue;

    found.push({ startSeconds: time.start, endSeconds: time.end, text, raw: line.trim() });
  }

  // 같은 지점이 여러 번 나오면 첫 번째만 남긴다
  const bySeconds = new Map<number, (typeof found)[number]>();
  for (const t of found) if (!bySeconds.has(t.startSeconds)) bySeconds.set(t.startSeconds, t);

  const sorted = [...bySeconds.values()].sort((a, b) => a.startSeconds - b.startSeconds);

  const detected = detectSeparator(sorted.map((t) => t.text));
  const { separator } = options;
  const splitter =
    typeof separator === 'object' && separator.custom
      ? separator.custom
      : typeof separator === 'string'
        ? SEPARATORS[separator].pattern
        : detected && SEPARATORS[detected].pattern;

  const tracks = sorted.map((t, i) => {
    const parts = splitArtistTitle(t.text, splitter);
    const [singer, title] = options.swap && parts.singer ? [parts.title, parts.singer] : [parts.singer, parts.title];

    return {
      startSeconds: t.startSeconds,
      // 적힌 구간이 있으면 그대로 쓰고, 없으면 다음 곡의 시작으로 채운다. 구간이 겹치지 않게.
      endSeconds: t.endSeconds ?? (i + 1 < sorted.length ? sorted[i + 1].startSeconds : null),
      singer,
      title: options.cleanTitle ? cleanTitle(title) : title,
      raw: t.raw,
    };
  });

  return { tracks, detected };
}
