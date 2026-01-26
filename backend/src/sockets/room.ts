import crypto from 'crypto';

import { RoomManager } from '@/sockets/RoomManager';
import { getPlaylist, getPlaylistDetail } from '@/services/playlists';
import { computeRequiredSkipCount, getClientIp, handleSkipMajority, reveal, scheduleRoundStart } from '@/utils/game';
import { assignColor, getMe, isCorrect, randomRoomCode, reassignOwner, shuffle, toRoomListItemDTO } from '@/utils/room';

import type { Server, Socket } from 'socket.io';
import type {
  Player,
  CreateRoomPayload,
  RoomJoinPayload,
  RoomResponse,
  RoomListItemDTO,
  RoomInfoPayload,
  RoomInfoResponse,
} from '@/types';
import { addBan, getSid, getUserAgent, hashUA, isBanned, makeBanEntry, toIpPrefix } from '@/utils/ban';

export function registerRoomHandlers(io: Server, socket: Socket, RoomManager: RoomManager) {
  // 방 생성
  // TODO
  // maxPlayer, 전체 곡 한계치 정하기 => 프론트에서
  socket.on('room:create', async (payload: CreateRoomPayload, ack: (res: RoomResponse) => void) => {
    const { title, playlistId } = payload;
    if (!title.trim()) {
      return ack({ ok: false, message: '방 제목을 입력하세요.' });
    }

    if (!playlistId) {
      return ack({ ok: false, message: '플레이리스트를 선택하세요.' });
    }

    let roomId = randomRoomCode();
    while (RoomManager.has(roomId)) {
      roomId = randomRoomCode();
    }

    const { songs } = await getPlaylistDetail(playlistId);

    if (songs.length === 0) {
      return ack({ ok: false, message: '플레이리스트에 노래가 없어요.' });
    }

    RoomManager.create(roomId, {
      ...payload,
      playlistId,
      songList: shuffle(songs),
      players: new Map(),
      currentSongIndex: 0,
      status: 'waiting',
      maxPlayers: 12,

      runtime: {
        phase: 'countdown',
        roundNonce: 0,
        revealed: false,
        hintShown: false,
        skipVotes: new Set(),
        requiredSkipCount: 0,
      },
    });

    ack({ ok: true, roomId });
  });

  // 방 참여
  socket.on('room:join', (payload: RoomJoinPayload, ack: (res: RoomResponse) => void) => {
    const { roomId, nickname, password } = payload;
    const room = RoomManager.get(roomId);

    if (!room) return ack({ ok: false, message: '존재하지 않는 방입니다.' });

    if (room.status === 'playing') {
      return ack({ ok: false, message: '진행 중인 게임에는 참여할 수 없습니다.' });
    }

    if (room.password && room.password !== password) {
      return ack({ ok: false, message: '비밀번호가 틀렸습니다.' });
    }

    const sid = getSid(socket);
    if (!sid) return ack({ ok: false, message: '세션이 없습니다. 다시 시도해주세요.' });

    const ip = getClientIp(socket);
    if (!ip) return ack({ ok: false, message: 'IP를 확인할 수 없습니다.' });

    const uaHash = hashUA(getUserAgent(socket));
    const ipPrefix = toIpPrefix(ip);

    if (isBanned(room, sid, ipPrefix, uaHash)) {
      return ack({ ok: false, message: '강퇴된 사용자입니다. 입장할 수 없습니다.' });
    }

    // ✅ 이미 이 소켓이 방에 들어가 있으면(중복 join 방지)
    const existingSocketRoom = RoomManager.getSocketRoom(socket.id);
    if (existingSocketRoom) {
      if (existingSocketRoom.roomId === roomId) {
        return ack({ ok: true, roomId, playerId: existingSocketRoom.playerId });
      }
      return ack({ ok: false, message: '이미 다른 방에 참여 중입니다.' });
    }

    const nick = nickname.trim();

    if (nick.length < 2 || nick.length > 10) {
      return ack({ ok: false, message: '닉네임은 2~10자여야 합니다.' });
    }

    const isNicknameUsed = [...room.players.values()].some((p) => p.nickname === nick);
    if (isNicknameUsed) {
      return ack({ ok: false, message: '이미 존재하는 닉네임입니다.' });
    }

    if (room.players.size >= room.maxPlayers) {
      return ack({ ok: false, message: '방이 꽉 찼습니다.' });
    }

    // ✅ 서버 발급 playerId
    const playerId = crypto.randomUUID();

    const player: Player = {
      ip,
      playerId,
      socketId: socket.id,
      nickname: nick,
      color: assignColor(room),
      score: 0,
      // ready: room.players.size === 0,
      isOwner: room.players.size === 0,
    };

    socket.join(roomId);
    room.players.set(playerId, player);

    RoomManager.setSocketRoom(socket.id, roomId, playerId);
    RoomManager.emitRoomUpdate(io, roomId);
    RoomManager.emitRoomList(io);

    return ack({ ok: true, roomId, playerId });
  });

  // 강퇴
  socket.on(
    'room:kick',
    (payload: { roomId: string; targetPlayerId: string }, ack: (res: { ok: boolean; message?: string }) => void) => {
      const { roomId, targetPlayerId } = payload;

      const room = RoomManager.get(roomId);
      if (!room) return ack({ ok: false, message: '존재하지 않는 방입니다.' });

      // 방장 체크
      const meRes = getMe(RoomManager, roomId, socket.id);
      if (!meRes.ok) return ack({ ok: false, message: meRes.message });

      if (!meRes.me.isOwner) return ack({ ok: false, message: '방장만 강퇴할 수 있습니다.' });

      // 방장 강퇴 방지
      if (meRes.playerId === targetPlayerId) return ack({ ok: false, message: '방장은 강퇴할 수 없습니다.' });

      const target = room.players.get(targetPlayerId);
      if (!target) return ack({ ok: false, message: '대상을 찾을 수 없습니다.' });

      // 밴 등록
      const targetSocket = target.socketId ? io.sockets.sockets.get(target.socketId) : undefined;
      if (targetSocket) {
        const entry = makeBanEntry(targetSocket, 1000 * 60 * 60);
        if (entry) addBan(room, entry);
      }

      // 대상 제거
      room.players.delete(targetPlayerId);

      // 대상 소켓 강제 퇴장 + 알림
      if (target.socketId) {
        const targetSocket = io.sockets.sockets.get(target.socketId);
        if (targetSocket) {
          RoomManager.deleteSocketRoom(target.socketId);
          targetSocket.leave(roomId);
          targetSocket.emit('room:kicked', { roomId, message: '방에서 강퇴되었습니다.' });
        }
      }

      RoomManager.emitRoomUpdate(io, roomId);
      RoomManager.emitRoomList(io);
      return ack({ ok: true });
    }
  );

  // 명시적 방 나가기
  socket.on('room:leave', (payload: { roomId: string }, ack: (res: RoomResponse) => void) => {
    const { roomId } = payload;

    const room = RoomManager.get(roomId);
    if (!room) return ack({ ok: true, roomId });

    const socketRoom = RoomManager.getSocketRoom(socket.id);
    if (!socketRoom || socketRoom.roomId !== roomId) {
      if (room.players.size === 0) {
        RoomManager.delete(roomId);
      }
      return ack({ ok: true, roomId });
    }

    const playerId = socketRoom.playerId;
    const player = room.players.get(playerId);
    const wasOwner = player?.isOwner ?? false;

    room.players.delete(playerId);
    RoomManager.deleteSocketRoom(socket.id);
    socket.leave(roomId);

    if (room.players.size === 0) {
      RoomManager.delete(roomId);
      RoomManager.emitRoomList(io);

      return ack({ ok: true, roomId });
    }

    if (wasOwner) {
      reassignOwner(room);
    }

    RoomManager.emitRoomUpdate(io, roomId);
    RoomManager.emitRoomList(io);

    return ack({ ok: true, roomId });
  });

  // 연결 종료 시 클린업
  socket.on('disconnect', (reason: string) => {
    const socketRoom = RoomManager.getSocketRoom(socket.id);
    if (!socketRoom) {
      for (const [roomId, room] of RoomManager.rooms.entries()) {
        if (room.players.size === 0) {
          RoomManager.delete(roomId);
        }
      }
      return;
    }

    const { roomId, playerId } = socketRoom;
    RoomManager.deleteSocketRoom(socket.id);

    const room = RoomManager.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    const wasOwner = player?.isOwner ?? false;

    // 완전 삭제
    room.players.delete(playerId);
    socket.leave(roomId);

    if (room.players.size === 0) {
      RoomManager.delete(roomId);
      RoomManager.emitRoomList(io);
      return;
    }

    if (wasOwner) {
      reassignOwner(room);
    }

    RoomManager.emitRoomUpdate(io, roomId);
    RoomManager.emitRoomList(io);
  });

  // 방 목록 조회
  socket.on('room:list', (ack: (res: { ok: boolean; rooms: RoomListItemDTO[] }) => void) => {
    const rooms: RoomListItemDTO[] = [];

    for (const [roomId, room] of RoomManager.rooms.entries()) {
      if (room.players.size === 0) continue;

      rooms.push(toRoomListItemDTO(roomId, room));
    }

    // ✅ playing 방은 항상 마지막
    rooms.sort((a, b) => {
      const ap = a.status === 'playing' ? 1 : 0;
      const bp = b.status === 'playing' ? 1 : 0;
      if (ap !== bp) return ap - bp;

      return a.title.localeCompare(b.title);
    });

    ack({ ok: true, rooms });
  });

  // 방 정보 조회
  socket.on('room:info', async ({ roomId }: RoomInfoPayload, ack: (res: RoomInfoResponse) => void) => {
    const room = RoomManager.get(roomId);
    if (!room) {
      return ack({ ok: false, message: '존재하지 않는 방입니다.' });
    }

    const playlist = await getPlaylist({ playlistId: room.playlistId });
    if (!playlist) {
      return ack({ ok: false, message: '플레이리스트 정보를 찾을 수 없습니다.' });
    }

    return ack({
      ok: true,
      data: {
        playlist,
        room: {
          id: roomId,
          title: room.title,
          hasPassword: !!room.password,
          status: room.status,
          songCount: room.songList.length,
        },
      },
    });
  });

  // 게임 시작
  socket.on('game:start', (payload: { roomId: string }, ack: (res: { ok: boolean; message?: string }) => void) => {
    const { roomId } = payload;
    const room = RoomManager.get(roomId);
    if (!room) return ack({ ok: false, message: '존재하지 않는 방입니다.' });

    const socketRoom = RoomManager.getSocketRoom(socket.id);
    if (!socketRoom || socketRoom.roomId !== roomId) {
      return ack({ ok: false, message: '방에 참여한 유저만 시작할 수 있습니다.' });
    }

    const me = room.players.get(socketRoom.playerId);
    if (!me) return ack({ ok: false, message: '플레이어 정보를 찾을 수 없습니다.' });
    if (!me.isOwner) return ack({ ok: false, message: '방장만 게임을 시작할 수 있습니다.' });

    if (room.status === 'playing') return ack({ ok: false, message: '이미 게임이 시작되었습니다.' });
    if (room.songList.length === 0) return ack({ ok: false, message: '플레이리스트에 노래가 없어요.' });

    room.status = 'playing';
    room.currentSongIndex = 0;

    RoomManager.emitRoomList(io);
    scheduleRoundStart(io, RoomManager, roomId, room.currentSongIndex);

    return ack({ ok: true });
  });

  // 스킵
  socket.on(
    'game:skip',
    (payload: { roomId: string; currentSongIndex?: number }, ack: (res: { ok: boolean; message?: string }) => void) => {
      const { roomId, currentSongIndex } = payload;

      const meRes = getMe(RoomManager, roomId, socket.id);
      if (!meRes.ok) return ack({ ok: false, message: meRes.message });

      const { room, playerId } = meRes;

      if (room.status !== 'playing') return ack({ ok: false, message: '게임 중에만 스킵할 수 있습니다.' });
      if (room.runtime.phase !== 'round') return ack({ ok: false, message: '다음 곡 준비 중입니다.' });

      if (currentSongIndex !== room.currentSongIndex) {
        return ack({ ok: false, message: '현재 라운드가 아닙니다.' });
      }

      room.runtime.skipVotes.add(playerId);

      const current = room.runtime.skipVotes.size;
      const required = computeRequiredSkipCount(room);

      io.to(roomId).emit('game:skip:update', {
        currentSongIndex: room.currentSongIndex,
        skip: { current, required },
      });

      if (current >= required) {
        handleSkipMajority(io, RoomManager, roomId);
      }

      return ack({ ok: true });
    }
  );

  // 채팅 + 정답 판정
  socket.on('chat:message', (payload: { roomId: string; message: string }) => {
    const { roomId, message } = payload;

    const meRes = getMe(RoomManager, roomId, socket.id);
    if (!meRes.ok) return;

    const { room, me, playerId } = meRes;

    // 채팅은 항상 broadcast
    io.to(roomId).emit('chat:message', { type: 'user', from: me.nickname, color: me.color, message });

    if (room.status !== 'playing') return;

    if (room.runtime.phase !== 'round') return;

    if (room.runtime.revealed) return;

    const currentSong = room.songList[room.currentSongIndex];
    if (!currentSong) return;

    if (!isCorrect(message, currentSong)) return;

    // 정답 처리
    me.score += 1;
    me.lastCorrectAtMs = Date.now();
    RoomManager.emitRoomUpdate(io, roomId);

    reveal(io, RoomManager, roomId, 'correct', { playerId, nickname: me.nickname, color: me.color, score: me.score });
  });
}
