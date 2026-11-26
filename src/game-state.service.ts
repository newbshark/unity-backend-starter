import { Injectable } from '@nestjs/common';

export interface GameConfigState {
  status: string;
  title: string;
  motd: string;
  expMultiplier: number;
  speedMultiplier: number;
  themeColor: string;
  activePlayers: number;
  customData: Record<string, string>;
}

@Injectable()
export class GameStateService {
  private readonly launchTime = Date.now();
  private totalRequests = 0;
  private lastPingAt: string | null = null;

  private state: GameConfigState = {
    status: 'online',
    title: 'Cyber Arena Server',
    motd: 'Добро пожаловать на сервер! Сегодня двойной опыт (x2 XP)!',
    expMultiplier: 2.0,
    speedMultiplier: 1.0,
    themeColor: '#FFD600',
    activePlayers: 1,
    customData: {
      event: 'Lesson 01 Live',
      bonusCode: 'ARENA',
    },
  };

  recordPing() {
    this.totalRequests += 1;
    this.lastPingAt = new Date().toISOString();
  }

  getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.launchTime) / 1000);
  }

  getConfig(): GameConfigState {
    return {
      ...this.state,
      customData: { ...this.state.customData },
    };
  }

  getStats() {
    return {
      uptimeSeconds: this.getUptimeSeconds(),
      totalRequests: this.totalRequests,
      lastPingAt: this.lastPingAt,
      serverTime: new Date().toISOString(),
    };
  }

  updateConfig(patch: Partial<GameConfigState>): GameConfigState {
    if (typeof patch.status === 'string' && patch.status.trim()) {
      this.state.status = patch.status.trim();
    }
    if (typeof patch.title === 'string') {
      this.state.title = patch.title.trim() || 'Cyber Arena Server';
    }
    if (typeof patch.motd === 'string') {
      this.state.motd = patch.motd.trim();
    }
    if (patch.expMultiplier !== undefined && !Number.isNaN(Number(patch.expMultiplier))) {
      this.state.expMultiplier = Math.max(0.1, Math.min(100, Number(patch.expMultiplier)));
    }
    if (patch.speedMultiplier !== undefined && !Number.isNaN(Number(patch.speedMultiplier))) {
      this.state.speedMultiplier = Math.max(0.1, Math.min(20, Number(patch.speedMultiplier)));
    }
    if (typeof patch.themeColor === 'string' && patch.themeColor.trim()) {
      this.state.themeColor = patch.themeColor.trim();
    }
    if (patch.activePlayers !== undefined && !Number.isNaN(Number(patch.activePlayers))) {
      this.state.activePlayers = Math.max(0, Math.floor(Number(patch.activePlayers)));
    }
    if (patch.customData && typeof patch.customData === 'object' && !Array.isArray(patch.customData)) {
      const cleaned: Record<string, string> = {};
      for (const [k, v] of Object.entries(patch.customData)) {
        const key = String(k).trim();
        if (key) cleaned[key] = String(v);
      }
      this.state.customData = cleaned;
    }
    return this.getConfig();
  }
}
