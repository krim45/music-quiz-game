import type { Server, Socket } from 'socket.io';
import type { Player, CreateRoomPayload, RoomJoinPayload, RoomResponse, RoomListItemDTO, SocketRoom } from '@/types';
import { assignColor, randomRoomCode, reassignOwner, shuffle } from '@/utils/room';
import { RoomManager } from '@/sockets/RoomManager';

// TODO
// 노래 목록, 노래 정답
// 방장, 플레이어 기준, 방장 시작, 플레이어 준비
// 방 제목, 방에서 정한 플레이 리스트 이름, 비번

export function registerRoomHandlers(io: Server, socket: Socket, RoomManager: RoomManager) {
  // 방 생성
  socket.on('room:create', (payload: CreateRoomPayload, ack: (res: RoomResponse) => void) => {
    if (!payload.title.trim()) {
      return ack({ ok: false, message: '게임 제목이 없습니다.' });
    }

    if (!payload.songList.length) {
      return ack({ ok: false, message: '노래 목록이 비어 있습니다.' });
    }

    let roomId = randomRoomCode();
    while (RoomManager.has(roomId)) {
      roomId = randomRoomCode();
    }

    RoomManager.create(roomId, {
      ...payload,
      songList: shuffle(payload.songList),
      players: new Map<string, Player>(),
      currentSongIndex: 0,
      status: 'waiting',
    });

    ack({ ok: true, roomId });
  });

  // 방 참여
  socket.on('room:join', (payload: RoomJoinPayload, ack: (res: RoomResponse) => void) => {
    const { roomId, playerId, nickname, password } = payload;
    const room = RoomManager.get(roomId);

    if (!room) {
      return ack({ ok: false, message: '존재하지 않는 방입니다.' });
    }

    const existingPlayer = room.players.get(playerId);

    // 🔁 재접속 흐름
    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
      existingPlayer.isOwner = false;

      socket.join(roomId);
      room.players.set(playerId, existingPlayer);
      RoomManager.setSocketRoom(socket.id, roomId, playerId);
      RoomManager.emitRoomUpdate(io, roomId);

      return ack({ ok: true, roomId });
    }

    if (room.password && room.password !== password) {
      return ack({ ok: false, message: '비밀번호가 틀렸습니다.' });
    }

    if (room.players.size >= room.maxPlayers) {
      return ack({ ok: false, message: '방이 꽉 찼습니다.' });
    }

    // 닉네임 중복 검사
    const isNicknameUsed = [...room.players.values()].some((p) => p.nickname === nickname);
    if (isNicknameUsed) {
      return ack({ ok: false, message: '이미 존재하는 닉네임입니다.' });
    }

    // 플레이어 생성 및 등록
    const player: Player = {
      playerId,
      socketId: socket.id,
      nickname,
      color: assignColor(room),
      score: 0,
      ready: room.players.size === 0,
      isOwner: room.players.size === 0, // 첫 번째 유저는 방장
    };

    socket.join(roomId);
    room.players.set(playerId, player);
    RoomManager.setSocketRoom(socket.id, roomId, playerId);
    RoomManager.emitRoomUpdate(io, roomId);
    ack({ ok: true, roomId });
  });

  // 명시적 방 나가기 (유저가 "나가기" 버튼 클릭)
  socket.on('room:leave', (payload: SocketRoom, ack: (res: RoomResponse) => void) => {
    const { roomId, playerId } = payload;
    const room = RoomManager.get(roomId);

    if (!room) {
      return ack({ ok: true, roomId });
    }

    const player = room.players.get(playerId);
    const wasOwner = player?.isOwner ?? false;

    // leave는 완전 삭제
    room.players.delete(playerId);
    RoomManager.deleteSocketRoom(socket.id);
    socket.leave(roomId);

    if (room.players.size === 0) {
      RoomManager.delete(roomId);
      return ack({ ok: true, roomId });
    }

    if (wasOwner) {
      reassignOwner(room);
    }

    RoomManager.emitRoomUpdate(io, roomId);

    return ack({ ok: true, roomId });
  });

  // 연결 종료 시 클린업
  socket.on('disconnect', (reason: string) => {
    console.log('disconnect: ', reason);

    const socketRoom = RoomManager.getSocketRoom(socket.id);
    if (!socketRoom) return;

    const { roomId, playerId } = socketRoom;
    RoomManager.deleteSocketRoom(socket.id);

    const room = RoomManager.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    const wasOwner = player.isOwner;

    // 🔥 disconnect는 플레이어 삭제 X
    player.socketId = null;
    player.isOwner = false;

    room.players.set(playerId, player);
    socket.leave(roomId);

    // 방 전체가 offline이면 삭제
    const hasActive = [...room.players.values()].some((p) => p.socketId !== null);
    if (!hasActive) {
      RoomManager.delete(roomId);
      return;
    }

    if (wasOwner) {
      reassignOwner(room);
    }

    RoomManager.emitRoomUpdate(io, roomId);
  });

  // 방 목록 조회
  socket.on('room:list', (ack: (res: { ok: boolean; rooms: RoomListItemDTO[] }) => void) => {
    const rooms: RoomListItemDTO[] = [];

    for (const [roomId, room] of RoomManager.rooms.entries()) {
      rooms.push({
        roomId,
        title: room.title,
        curPlayers: room.players.size,
        maxPlayers: room.maxPlayers,
        hasPassword: Boolean(room.password && room.password.length > 0),
        status: room.status,
      });
    }

    ack({ ok: true, rooms });
  });

  // 채팅 이벤트
  socket.on('chat:message', (payload: { roomId: string; message: string }) => {
    const { roomId, message } = payload;
    const room = RoomManager.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    console.log(message);
    // 예시 정답 (나중에 라운드별로 동적 관리 가능)
    if (message === 'start') {
      io.to(roomId).emit('game:play', { index: 0 });
    }

    if (message === 'next') {
      io.to(roomId).emit('game:play', { index: 1 });
    }
    const ANSWER = 'hello';

    io.to(roomId).emit('chat:message', {
      from: player.nickname,
      color: player.color,
      message,
    });

    if (message.trim().toLowerCase() === ANSWER.toLowerCase()) {
      player.score += 1;

      io.to(roomId).emit('chat:message', {
        from: player.nickname,
        color: player.color,
        message: `✅ 정답! ${player.nickname} (${player.score}점)`,
      });

      io.to(roomId).emit('score:update', {
        players: Array.from(room.players.values()),
      });
    }
  });
}
