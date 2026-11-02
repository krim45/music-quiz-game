/**
 * 정답 판정 규칙. 정책은 docs/policy/answer-judging.md
 *
 * 채점은 백엔드 backend/src/utils/answer.ts 가 한다. 이 파일은 그 복사본으로,
 * 추가 정답을 넣을 때 "이미 정답으로 인정되는 값"을 걸러내는 데만 쓴다.
 * 규칙을 바꾸면 둘 다 고친다. @music-quiz/shared 는 타입 전용이라 런타임 코드를 둘 수 없다.
 */

/**
 * 비교용으로 다듬는다: 유니코드 정규화 → 소문자 → 문자·숫자만 남긴다.
 *
 * 띄어쓰기·대소문자뿐 아니라 특수문자도 무시한다.
 * "It's You" = "its you", "O.O" = "OO", "이름이 뭐예요?" = "이름이 뭐예요".
 * NFKC는 전각 문자(Ａ, （)와 호환 문자를 보통 문자로 바꾼다.
 */
export function normalizeAnswer(input: string): string {
  const base = input.normalize('NFKC').toLowerCase();
  const lettersOnly = base.replace(/[^\p{L}\p{N}]/gu, '');

  // 특수문자로만 된 답("?!")은 다 지워진다. 그때는 공백만 무시하는 이전 방식으로 비교한다
  return lettersOnly || base.replace(/\s+/g, '');
}

/**
 * 괄호 부분을 뺀다. 안쪽 괄호부터 벗긴다.
 * "미쳐 (Crazy)" → "미쳐", "BLUE CHECK (Feat. Jay Park (JP)) (Prod. by Slom)" → "BLUE CHECK"
 */
export function stripBrackets(input: string): string {
  let out = input.normalize('NFKC');

  for (;;) {
    const next = out.replace(/\([^()]*\)|\[[^[\]]*\]/g, ' ');
    if (next === out) break;
    out = next;
  }

  return out.replace(/\s+/g, ' ').trim();
}

/**
 * 한 답이 인정하는 비교 키: 그대로 + 괄호를 뺀 것.
 * 괄호 안(Crazy)은 넣지 않는다 — "Hype Boy (Live)"의 "Live"까지 정답이 되면 안 된다.
 */
export function answerKeys(answer: string): string[] {
  const keys = new Set<string>();

  const full = normalizeAnswer(answer);
  if (full) keys.add(full);

  // 괄호만으로 된 답은 빼고 나면 비므로 넣지 않는다
  const base = stripBrackets(answer);
  if (base) keys.add(normalizeAnswer(base));

  return [...keys];
}

/** 입력이 답 목록 중 하나로 인정되는가 */
export function isAcceptedAnswer(guess: string, answers: string[]): boolean {
  const key = normalizeAnswer(guess);
  if (!key) return false;

  return answers.some((answer) => answerKeys(answer).includes(key));
}
