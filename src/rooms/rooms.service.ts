import { Injectable } from '@nestjs/common';

export interface RoomState {
  roomCode: string;
  bossHp: number;
  players: string[];
}

@Injectable()
export class RoomsService {
  private readonly rooms = new Map<string, RoomState>();

  private getOrCreateRoom(rawCode?: string): RoomState {
    const code = (rawCode || 'ALPHA').trim().toUpperCase().slice(0, 12) || 'ALPHA';
    let room = this.rooms.get(code);
    if (!room) {
      room = { roomCode: code, bossHp: 100, players: [] };
      this.rooms.set(code, room);
    }
    return room;
  }

  joinRoom(rawCode?: string, rawPlayer?: string) {
    const room = this.getOrCreateRoom(rawCode);
    const player = (rawPlayer || 'Игрок').trim().slice(0, 24) || 'Игрок';
    if (!room.players.includes(player)) {
      room.players.push(player);
    }
    return { ...room, message: `${player} вошёл в комнату #${room.roomCode}` };
  }

  hitRoomBoss(rawCode?: string, rawPlayer?: string) {
    const room = this.getOrCreateRoom(rawCode);
    const player = (rawPlayer || 'Игрок').trim().slice(0, 24) || 'Игрок';
    if (!room.players.includes(player)) room.players.push(player);
    room.bossHp = room.bossHp <= 20 ? 100 : room.bossHp - 20;
    return {
      ...room,
      message: room.bossHp === 100 ? `${player} добил босса! Новый раунд 100 HP` : `${player} ударил (-20 HP)`,
    };
  }

  listRooms() {
    return Array.from(this.rooms.values());
  }

  clearRooms() {
    this.rooms.clear();
    return { ok: true };
  }
}
