import { Injectable } from '@nestjs/common';

export interface GameConfigState {
  status: string;
  title: string;
  motd: string;
  expMultiplier: number;
  speedMultiplier: number;
  cubeScale: number;
  gravityY: number;
  lowGravity: boolean;
  cubeColorHex: string;
  themeColor: string;
  activePlayers: number;
  customData: Record<string, string>;
}

export interface BossState {
  bossName: string;
  hp: number;
  maxHp: number;
  defeatedCount: number;
  lastAttacker: string;
  lastEvent: string;
}

export interface LootResult {
  itemName: string;
  rarity: string;
  bonusScore: number;
  colorHex: string;
  message: string;
}

export interface QuestListState {
  q1: string;
  q2: string;
  q3: string;
}

export interface PlayerRecord {
  player: string;
  coins: number;
  hits: number;
  chests: number;
  cheatAttempts: number;
  completedQuests: string[];
  lastItem: string;
}

const LOOT_POOL: Array<Omit<LootResult, 'message'> & { weight: number }> = [
  { itemName: 'Квантовый ускоритель', rarity: 'EPIC', bonusScore: 50, colorHex: '#A855F7', weight: 15 },
  { itemName: 'Золотое ядро x2', rarity: 'RARE', bonusScore: 30, colorHex: '#FFD600', weight: 25 },
  { itemName: 'Неоновый щит', rarity: 'RARE', bonusScore: 25, colorHex: '#38BDF8', weight: 25 },
  { itemName: 'Батарейка пинга', rarity: 'COMMON', bonusScore: 10, colorHex: '#22C55E', weight: 28 },
  { itemName: 'Древний Метеорит', rarity: 'LEGENDARY', bonusScore: 100, colorHex: '#FF3B00', weight: 7 },
];

@Injectable()
export class GameStateService {
  private readonly launchTime = Date.now();
  private totalRequests = 0;
  private totalCheatBlocks = 0;
  private lastPingAt: string | null = null;

  private state: GameConfigState = {
    status: 'online',
    title: 'Cyber Arena Server',
    motd: 'Добро пожаловать на сервер! Двойной опыт x2 активен!',
    expMultiplier: 2.0,
    speedMultiplier: 2.0,
    cubeScale: 1.0,
    gravityY: -9.81,
    lowGravity: false,
    cubeColorHex: '#FFD600',
    themeColor: '#FFD600',
    activePlayers: 1,
    customData: {
      event: 'Lesson 01 Live',
      bonusCode: 'ARENA',
    },
  };

  private boss: BossState = {
    bossName: 'Хранитель Багов',
    hp: 100,
    maxHp: 100,
    defeatedCount: 0,
    lastAttacker: 'Никто',
    lastEvent: 'Босс ждёт первого удара из Unity (клавиша F)!',
  };

  private quests: QuestListState = {
    q1: 'Поставить ServerCube и увидеть смену режима',
    q2: 'Ударить Босса клавишей F и открыть сундук L',
    q3: 'Проверить Античит кнопкой C (+999999)',
  };

  private players = new Map<string, PlayerRecord>();
  private recentEvents: string[] = ['Сервер запущен и ждёт подключений класса.'];

  private pushEvent(text: string) {
    const time = new Date().toTimeString().slice(0, 8);
    this.recentEvents.unshift(`[${time}] ${text}`);
    if (this.recentEvents.length > 18) {
      this.recentEvents.length = 18;
    }
  }

  private getOrCreatePlayer(rawName?: string): PlayerRecord {
    const clean = (rawName || 'Игрок').trim().slice(0, 24) || 'Игрок';
    let rec = this.players.get(clean);
    if (!rec) {
      rec = {
        player: clean,
        coins: 0,
        hits: 0,
        chests: 0,
        cheatAttempts: 0,
        completedQuests: [],
        lastItem: '—',
      };
      this.players.set(clean, rec);
      this.state.activePlayers = Math.max(1, this.players.size);
    }
    return rec;
  }

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

  getWorldState() {
    return {
      title: this.state.title,
      motd: this.state.motd,
      expMultiplier: this.state.expMultiplier,
      cubeScale: this.state.cubeScale,
      gravityY: this.state.gravityY,
      cubeColorHex: this.state.cubeColorHex,
      lowGravity: this.state.lowGravity,
      bossHp: this.boss.hp,
      bossMaxHp: this.boss.maxHp,
      q1: this.quests.q1,
      q2: this.quests.q2,
      q3: this.quests.q3,
    };
  }

  getStats() {
    return {
      uptimeSeconds: this.getUptimeSeconds(),
      totalRequests: this.totalRequests,
      totalCheatBlocks: this.totalCheatBlocks,
      playerCount: this.players.size,
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
      const clamped = Math.max(0.5, Math.min(100, Number(patch.expMultiplier)));
      this.state.expMultiplier = clamped;
      this.state.speedMultiplier = clamped;
    }
    if (patch.speedMultiplier !== undefined && !Number.isNaN(Number(patch.speedMultiplier))) {
      this.state.speedMultiplier = Math.max(0.1, Math.min(20, Number(patch.speedMultiplier)));
    }
    if (patch.cubeScale !== undefined && !Number.isNaN(Number(patch.cubeScale))) {
      this.state.cubeScale = Math.max(0.3, Math.min(4.0, Number(patch.cubeScale)));
    }
    if (patch.lowGravity !== undefined) {
      this.state.lowGravity = Boolean(patch.lowGravity);
      if (patch.gravityY === undefined) {
        this.state.gravityY = this.state.lowGravity ? -1.8 : -9.81;
      }
    }
    if (patch.gravityY !== undefined && !Number.isNaN(Number(patch.gravityY))) {
      this.state.gravityY = Math.max(-25, Math.min(-0.5, Number(patch.gravityY)));
      this.state.lowGravity = this.state.gravityY > -5;
    }
    if (typeof patch.cubeColorHex === 'string' && patch.cubeColorHex.trim()) {
      this.state.cubeColorHex = patch.cubeColorHex.trim();
      this.state.themeColor = this.state.cubeColorHex;
    } else if (typeof patch.themeColor === 'string' && patch.themeColor.trim()) {
      this.state.themeColor = patch.themeColor.trim();
      this.state.cubeColorHex = this.state.themeColor;
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
    this.pushEvent(`Режим обновлён: x${this.state.expMultiplier}, scale=${this.state.cubeScale}, gravity=${this.state.gravityY}`);
    return this.getConfig();
  }

  getQuestsForPlayer(rawPlayer?: string) {
    const clean = (rawPlayer || '').trim();
    const rec = clean ? this.players.get(clean) : undefined;
    const done = rec ? rec.completedQuests : [];
    return {
      q1: this.quests.q1,
      q2: this.quests.q2,
      q3: this.quests.q3,
      q1Done: done.includes('q1'),
      q2Done: done.includes('q2'),
      q3Done: done.includes('q3'),
    };
  }

  updateQuests(patch: Partial<QuestListState>): QuestListState {
    if (typeof patch.q1 === 'string' && patch.q1.trim()) this.quests.q1 = patch.q1.trim();
    if (typeof patch.q2 === 'string' && patch.q2.trim()) this.quests.q2 = patch.q2.trim();
    if (typeof patch.q3 === 'string' && patch.q3.trim()) this.quests.q3 = patch.q3.trim();
    this.pushEvent(`Задания обновлены учителем: [1] ${this.quests.q1}`);
    return { ...this.quests };
  }

  toggleQuestComplete(rawPlayer?: string, rawQuestId?: string) {
    this.recordPing();
    const rec = this.getOrCreatePlayer(rawPlayer);
    const qid = ['q1', 'q2', 'q3'].includes(String(rawQuestId)) ? String(rawQuestId) : 'q1';
    const idx = rec.completedQuests.indexOf(qid);
    let completed = false;
    if (idx === -1) {
      rec.completedQuests.push(qid);
      rec.coins += 20;
      completed = true;
      this.pushEvent(`✅ ${rec.player} отметил выполнение ${qid.toUpperCase()} (+20 мон.)!`);
    } else {
      rec.completedQuests.splice(idx, 1);
      completed = false;
      this.pushEvent(`${rec.player} снял отметку с ${qid.toUpperCase()}`);
    }
    return {
      ...this.getQuestsForPlayer(rec.player),
      player: rec.player,
      questId: qid,
      completed,
      coins: rec.coins,
      message: completed ? `Задание ${qid.toUpperCase()} сдано! (+20 монет)` : `Отметка ${qid.toUpperCase()} снята.`,
    };
  }

  getBoss(): BossState {
    return { ...this.boss };
  }

  hitBoss(rawPlayer?: string, rawDamage?: number): BossState {
    this.recordPing();
    const rec = this.getOrCreatePlayer(rawPlayer);
    const reqDmg = Number(rawDamage);
    const damage = Number.isFinite(reqDmg) ? Math.max(1, Math.min(25, Math.round(reqDmg))) : 15;
    rec.hits += 1;

    if (this.boss.hp <= 0) {
      this.boss.hp = this.boss.maxHp;
    }

    this.boss.hp = Math.max(0, this.boss.hp - damage);
    this.boss.lastAttacker = rec.player;

    if (this.boss.hp === 0) {
      this.boss.defeatedCount += 1;
      rec.coins += 50;
      this.boss.lastEvent = `ДОБИЛ! ${rec.player} уничтожил босса (+50 монет)!`;
      this.pushEvent(`Босс повержен игроком ${rec.player} (побед: ${this.boss.defeatedCount})`);
    } else {
      rec.coins += 5;
      this.boss.lastEvent = `${rec.player} нанёс ${damage} урона! Осталось ${this.boss.hp} HP.`;
      this.pushEvent(`${rec.player} ударил босса на -${damage} HP (${this.boss.hp}/${this.boss.maxHp})`);
    }

    return this.getBoss();
  }

  resetBoss(): BossState {
    this.boss.hp = this.boss.maxHp;
    this.boss.lastAttacker = 'Учитель';
    this.boss.lastEvent = 'Учитель возродил Хранителя Багов (100 HP)!';
    this.pushEvent('Учитель возродил босса до 100 HP.');
    return this.getBoss();
  }

  openLootChest(rawPlayer?: string): LootResult {
    this.recordPing();
    const rec = this.getOrCreatePlayer(rawPlayer);
    const totalWeight = LOOT_POOL.reduce((acc, item) => acc + item.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosen = LOOT_POOL[0];
    for (const candidate of LOOT_POOL) {
      roll -= candidate.weight;
      if (roll <= 0) {
        chosen = candidate;
        break;
      }
    }

    const earned = Math.round(chosen.bonusScore * this.state.expMultiplier);
    rec.chests += 1;
    rec.coins += earned;
    rec.lastItem = `${chosen.itemName} (${chosen.rarity})`;

    const msg = `${chosen.rarity}! Выпал «${chosen.itemName}» (+${earned} монет)`;
    this.pushEvent(`${rec.player} открыл сундук: ${chosen.rarity} ${chosen.itemName} (+${earned})`);
    return {
      itemName: chosen.itemName,
      rarity: chosen.rarity,
      bonusScore: earned,
      colorHex: chosen.colorHex,
      message: msg,
    };
  }

  collectCoin(rawPlayer?: string, rawAmount?: number) {
    this.recordPing();
    const rec = this.getOrCreatePlayer(rawPlayer);
    const reqAmount = Number(rawAmount);

    if (!Number.isFinite(reqAmount) || reqAmount <= 0 || reqAmount > 20) {
      rec.cheatAttempts += 1;
      this.totalCheatBlocks += 1;
      const msg = `АНТИЧИТ: запрос +${rawAmount} за 1 раз заблокирован! Максимум +20.`;
      this.pushEvent(`🚫 АНТИЧИТ поймал ${rec.player} (попытка +${rawAmount})`);
      return {
        accepted: false,
        player: rec.player,
        coins: rec.coins,
        cheatAttempts: rec.cheatAttempts,
        message: msg,
      };
    }

    const added = Math.round(reqAmount * this.state.expMultiplier);
    rec.coins += added;
    const msg = `Сервер начислил +${added} монет (итого ${rec.coins}).`;
    this.pushEvent(`${rec.player} собрал +${added} монет (всего ${rec.coins})`);
    return {
      accepted: true,
      player: rec.player,
      coins: rec.coins,
      cheatAttempts: rec.cheatAttempts,
      message: msg,
    };
  }

  getLeaderboard() {
    const players = Array.from(this.players.values())
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 12);
    const topSummary = players.length
      ? players.slice(0, 5).map((p, idx) => `${idx + 1}. ${p.player}: ${p.coins}`).join(' | ')
      : 'Пока пусто — жми E или F в Unity!';
    return {
      topSummary,
      players,
    };
  }

  resetPlayers() {
    this.players.clear();
    this.totalCheatBlocks = 0;
    this.state.activePlayers = 1;
    this.pushEvent('Учитель обнулил таблицу игроков.');
    return this.getLeaderboard();
  }

  getRecentEvents(): string[] {
    return [...this.recentEvents];
  }
}
