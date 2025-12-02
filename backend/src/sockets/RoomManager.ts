import type { Server, Socket } from 'socket.io';
import type { Room, RoomListItemDTO, RoomResponse } from '@/types';
import { reassignOwner } from '@/utils/room';

export class RoomManager {
  public rooms: Map<string, Room> = new Map();
  public socketRoomMap: Map<string, string> = new Map();

  create(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  has(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  delete(roomId: string): void {
    this.rooms.delete(roomId);
  }

  setSocketRoom(socketId: string, roomId: string): void {
    this.socketRoomMap.set(socketId, roomId);
  }

  getSocketRoom(socketId: string): string | undefined {
    return this.socketRoomMap.get(socketId);
  }

  deleteSocket(socketId: string): void {
    this.socketRoomMap.delete(socketId);
  }

  handleLeave(socket: Socket, io: Server, roomId: string): RoomResponse {
    const room = this.rooms.get(roomId);
    this.socketRoomMap.delete(socket.id);

    if (!room) {
      return { ok: false, message: '존재하지 않는 방입니다.' };
    }

    room.players.delete(socket.id);
    socket.leave(roomId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      return { ok: true, roomId };
    }

    const leavingPlayer = room.players.get(socket.id);
    if (leavingPlayer?.isOwner) {
      reassignOwner(room);
    }

    this.emitRoomUpdate(io, roomId);
    return { ok: true, roomId };
  }

  emitRoomUpdate(io: Server, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const players = [...room.players.values()].map((p) => ({
      id: p.id,
      nickname: p.nickname,
      color: p.color,
      score: p.score,
      ready: p.ready,
      isOwner: p.isOwner,
    }));

    io.to(roomId).emit('room:update', {
      roomId,
      title: room.title,
      status: room.status,
      currentSongIndex: room.currentSongIndex,
      players,
    });
  }

  listRooms(): RoomListItemDTO[] {
    const list: RoomListItemDTO[] = [];

    for (const [id, room] of this.rooms.entries()) {
      if (room.status !== 'waiting') continue;

      list.push({
        id,
        title: room.title,
        curPlayers: room.players.size,
        maxPlayers: room.maxPlayers,
        hasPassword: Boolean(room.password && room.password.length > 0),
        status: room.status,
      });
    }

    return list;
  }
}
