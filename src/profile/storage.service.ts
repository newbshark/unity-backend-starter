import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SavedProfile {
  player: string;
  level: number;
  xp: number;
  wins: number;
  savedAt: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly filePath = path.resolve(process.cwd(), 'save-data.json');
  private profiles: Record<string, SavedProfile> = {};

  onModuleInit() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.profiles = JSON.parse(raw) || {};
        this.logger.log(`Загружено профилей с диска: ${Object.keys(this.profiles).length}`);
      } catch (err) {
        this.logger.error('Ошибка чтения save-data.json, стартуем с чистого листа');
        this.profiles = {};
      }
    }
  }

  private saveAtomically() {
    const tmpPath = this.filePath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(this.profiles, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.filePath);
  }

  getProfile(rawName?: string): SavedProfile {
    const clean = (rawName || 'Игрок').trim().slice(0, 24) || 'Игрок';
    if (!this.profiles[clean]) {
      this.profiles[clean] = {
        player: clean,
        level: 1,
        xp: 0,
        wins: 0,
        savedAt: new Date().toISOString(),
      };
      this.saveAtomically();
    }
    return this.profiles[clean];
  }

  addXp(rawName?: string, rawAmount = 25): SavedProfile {
    const rec = this.getProfile(rawName);
    const amount = Math.max(1, Math.min(100, Math.round(Number(rawAmount) || 25)));
    rec.xp += amount;
    rec.level = 1 + Math.floor(rec.xp / 100);
    rec.savedAt = new Date().toISOString();
    this.saveAtomically();
    return rec;
  }
}
