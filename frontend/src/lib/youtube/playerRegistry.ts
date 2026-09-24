/**
 * 화면에 떠 있는 YouTube 플레이어들을 모아 둔다.
 *
 * 미리보기가 여러 곳(입력 폼, 노래 목록, 노래 검색)에 있어서 하나를 재생하면
 * 나머지가 계속 소리를 내는 문제가 있었다. 재생이 시작될 때 나머지를 멈춘다.
 *
 * 렌더링에 쓰이지 않는 명령형 핸들이라 스토어가 아니라 모듈 싱글턴으로 둔다
 * (`lib/socket.ts`와 같은 결).
 *
 * ⚠️ 지금은 게임 방의 플레이어('player')도 같은 레지스트리에 들어간다.
 *    /room/[roomId]와 /playlists/new가 함께 떠 있을 수 없어 문제가 없지만,
 *    방 안에서 곡을 추가하는 기능이 생기면 미리보기가 진행 중인 게임을 멈추게 된다.
 *    그때는 범위를 나눠야 한다.
 */

const players = new Map<string, YT.Player>();

export function registerPlayer(id: string, player: YT.Player) {
  players.set(id, player);
}

export function unregisterPlayer(id: string) {
  players.delete(id);
}

/** 지정한 하나만 남기고 나머지를 일시정지한다. */
export function pauseOtherPlayers(exceptId: string) {
  for (const [id, player] of players) {
    if (id === exceptId) continue;

    try {
      player.pauseVideo?.();
    } catch (e) {
      // 이미 정리된 플레이어는 무시한다.
      // 해제가 누락된 경우일 수도 있어 개발 중에는 남겨 둔다.
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[playerRegistry] pauseVideo 실패(무시)', id, e);
      }
    }
  }
}
