import type { Room, SocketRoom } from '@/types';
import { Server } from 'socket.io';

export class RoomManager {
  public rooms = new Map<string, Room>();
  public socketRoomMap = new Map<string, SocketRoom>();

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

  setSocketRoom(socketId: string, roomId: string, playerId: string) {
    this.socketRoomMap.set(socketId, { roomId, playerId });
  }

  getSocketRoom(socketId: string) {
    return this.socketRoomMap.get(socketId);
  }

  deleteSocketRoom(socketId: string) {
    this.socketRoomMap.delete(socketId);
  }

  emitRoomUpdate(io: Server, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const players = Array.from(room.players, ([playerId, item]) => ({
      playerId,
      nickname: item.nickname,
      color: item.color,
      score: item.score,
      ready: item.ready,
      isOwner: item.isOwner,
    }));

    io.to(roomId).emit('room:update', {
      roomId,
      status: room.status,
      currentSongIndex: room.currentSongIndex,
      players,
    });
  }
}
