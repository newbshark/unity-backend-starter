import { Injectable } from '@nestjs/common';

export interface PlayerPositionRecord {
  player: string;
  x: number;
  y: number;
  z: number;
  colorHex: string;
  updatedAt: number;
}

@Injectable()
export class PlayerSyncService {
  private readonly TTL_MS = 10_000;
  private readonly positions = new Map<string, PlayerPositionRecord>();

  private pruneExpired() {
    const now = Date.now();
    for (const [name, rec] of this.positions.entries()) {
      if (now - rec.updatedAt > this.TTL_MS) {
        this.positions.delete(name);
      }
    }
  }

  updatePosition(body: {
    player?: string;
    x?: number;
    y?: number;
    z?: number;
    colorHex?: string;
  }) {
    this.pruneExpired();
    const clean = (body.player || 'Игрок').trim().slice(0, 24) || 'Игрок';
    const rec: PlayerPositionRecord = {
      player: clean,
      x: Number.isFinite(Number(body.x)) ? Number(body.x) : 0,
      y: Number.isFinite(Number(body.y)) ? Number(body.y) : 0,
      z: Number.isFinite(Number(body.z)) ? Number(body.z) : 0,
      colorHex: typeof body.colorHex === 'string' && body.colorHex.trim() ? body.colorHex.trim() : '#38BDF8',
      updatedAt: Date.now(),
    };
    this.positions.set(clean, rec);
    return this.getAll();
  }

  getAll() {
    this.pruneExpired();
    return {
      players: Array.from(this.positions.values()),
    };
  }
}
