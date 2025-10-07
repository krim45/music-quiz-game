import type { Server, Socket } from 'socket.io';
import type { Room, Player, RoomCreatePayload, RoomJoinPayload } from '@/types';
import { randomRoomCode } from '@/utils/room';

const rooms: Map<string, Room> = new Map();
const socketRoomMap: Map<string, string> = new Map();

// 1. 채팅 기능 먼저 구현해보기

// ✅ 방 상태 갱신 broadcast 유틸
function emitRoomUpdate(io: Server, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  io.to(roomId).emit('room:update', {
    // TODO: 플레이어 정렬
    players: Array.from(room.players.values()),
  });
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  // 방 생성
  socket.on('room:create', ({ password }: RoomCreatePayload, ack: (res: any) => void) => {
    // TODO: 방 코드 고도화
    const roomId = randomRoomCode();

    if (!rooms.has(roomId)) {
      // TODO: 문제 추가
      rooms.set(roomId, { password, players: new Map() });
    }

    ack({ ok: true, roomId });
  });

  // 방 참여
  socket.on('room:join', ({ roomId, password, nickname }: RoomJoinPayload, ack) => {
    const room = rooms.get(roomId);

    if (!room) {
      return ack({ ok: false, error: 'ROOM_NOT_FOUND' });
    }

    if (room.password && room.password !== password) {
      return ack({ ok: false, error: 'INVALID_PASSWORD' });
    }

    // 플레이어 생성 및 등록
    const player: Player = {
      id: socket.id,
      nickname,
      // TODO: 색상 로직 고도화
      color: 'red',
      score: 0,
    };

    room.players.set(socket.id, player);
    socket.join(roomId);
    console.log(`[room:join] ${nickname} joined room ${roomId}`);
    emitRoomUpdate(io, roomId);
    socketRoomMap.set(socket.id, roomId);
    ack({ ok: true, roomId });
  });

  // 방 나가기
  socket.on('room:leave', (roomId: string, ack: (res: any) => void) => {
    const room = rooms.get(roomId);
    socketRoomMap.delete(socket.id);

    if (!room) {
      return ack({ ok: false, error: 'ROOM_NOT_FOUND' });
    }

    room.players.delete(socket.id);
    socket.leave(roomId);

    if (room.players.size === 0) {
      rooms.delete(roomId); // 방 비었으면 삭제
      console.log(`[room:leave] room ${roomId} deleted`);
    } else {
      emitRoomUpdate(io, roomId);
    }

    ack({ ok: true, roomId });
  });

  // 채팅 이벤트
  socket.on('chat:message', (payload: { roomId: string; message: string }) => {
    const { roomId, message } = payload;
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    // 예시 정답 (나중에 라운드별로 동적 관리 가능)
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

  // 연결 종료 시 클린업
  socket.on('disconnect', () => {
    const roomId = socketRoomMap.get(socket.id);
    socketRoomMap.delete(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.players.delete(socket.id);
    socket.leave(roomId);

    if (room.players.size === 0) {
      rooms.delete(roomId);
      console.log(`[disconnect] deleted empty room ${roomId}`);
    } else {
      emitRoomUpdate(io, roomId);
    }
  });
}
