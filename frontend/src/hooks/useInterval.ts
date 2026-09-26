'use client';

import { useEffect, useRef } from 'react';

/**
 * 일정 주기로 콜백을 실행한다. `delayMs`가 null이면 멈춘다.
 *
 * 타이머를 직접 쓰면 매번 놓치기 쉬운 것들을 여기서 한 번만 처리한다:
 * - 시작 즉시 한 번 실행 (안 그러면 첫 주기 동안 이전 값이 남아 보인다)
 * - 콜백이 바뀌어도 타이머를 다시 만들지 않음 (ref로 최신 것을 가리킨다)
 * - 정리 누락 방지
 *
 * 값의 계산과 반올림은 호출부가 맡는다 — 남은 시간은 내림, 카운트다운은 올림처럼
 * 의미가 달라서 여기서 정할 수 없다.
 */
export function useInterval(callback: () => void, delayMs: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;

    const tick = () => savedCallback.current();

    tick();
    const id = window.setInterval(tick, delayMs);

    return () => window.clearInterval(id);
  }, [delayMs]);
}
