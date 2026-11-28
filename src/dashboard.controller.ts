import { Body, Controller, Get, Header, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';
import { GameStateService } from './game-state.service';
import { PlayerSyncService } from './players/player-sync.service';
import { BeaconService } from './beacon/beacon.service';
import { StorageService } from './profile/storage.service';
import { EventsGateway } from './events/events.gateway';
import { RoomsService } from './rooms/rooms.service';

@ApiExcludeController()
@Controller()
export class DashboardController {
  constructor(
    private readonly gameState: GameStateService,
    private readonly playerSync: PlayerSyncService,
    private readonly beacon: BeaconService,
    private readonly storage: StorageService,
    private readonly eventsGateway: EventsGateway,
    private readonly rooms: RoomsService,
  ) {}

  private buildStateSnapshot() {
    return {
      config: this.gameState.getConfig(),
      stats: this.gameState.getStats(),
      boss: this.gameState.getBoss(),
      quests: this.gameState.getQuestsForPlayer(),
      leaderboard: this.gameState.getLeaderboard(),
      events: this.gameState.getRecentEvents(),
      syncPlayers: this.playerSync.getAll().players,
      beacon: this.beacon.getStatus(),
      profilesCount: this.storage.listProfiles().length,
      rooms: this.rooms.listRooms(),
    };
  }

  @Get('admin/verify')
  @UseGuards(AdminGuard)
  verifyAdmin() {
    return { ok: true };
  }

  @Post('admin/shout')
  @UseGuards(AdminGuard)
  adminShout(@Body() body: { text?: string }) {
    return this.eventsGateway.broadcast(body?.text);
  }

  @Post('admin/beacon/reset')
  @UseGuards(AdminGuard)
  resetBeacon() {
    return this.beacon.reset();
  }

  @Post('admin/rooms/reset')
  @UseGuards(AdminGuard)
  resetRooms() {
    return this.rooms.clearRooms();
  }

  @Get('admin/state')
  getAdminState() {
    return this.buildStateSnapshot();
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderMobilePanel(): string {
    const initial = JSON.stringify(this.buildStateSnapshot());

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ПУЛЬТ БОГА // UNITY + NESTJS LIVE</title>
  <style>
    :root {
      --bg: #0c0e13;
      --card: #141720;
      --elev: #1d2130;
      --border: rgba(255, 255, 255, 0.1);
      --volt: #c6ff00;
      --orange: #ff3b00;
      --amber: #ffd600;
      --cyan: #38bdf8;
      --green: #22c55e;
      --red: #f43f5e;
      --text: #f4f4f5;
      --dim: #9ca3af;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 14px 12px 60px;
      background: radial-gradient(circle at 50% -10%, rgba(56, 189, 248, 0.12), transparent 50%), var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.45;
    }
    .wrap { max-width: 600px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      background: var(--card);
      border: 1px solid rgba(198, 255, 0, 0.45);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 13px 15px;
      margin-bottom: 12px;
    }
    .title { font-weight: 800; font-size: 16px; color: var(--volt); letter-spacing: -0.01em; }
    .sub { font-size: 11.5px; color: var(--dim); margin-top: 2px; }
    .pill {
      font-family: var(--mono);
      font-weight: 800;
      font-size: 11px;
      padding: 5px 9px;
      border-radius: 6px;
      background: var(--volt);
      color: #111;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    @media (max-width: 460px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-box {
      background: var(--card);
      border: 1px solid var(--border);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
      border-radius: 8px;
      padding: 10px 6px;
      text-align: center;
    }
    .stat-val { font-family: var(--mono); font-size: 18px; font-weight: 800; color: var(--amber); font-variant-numeric: tabular-nums; }
    .stat-lbl { font-size: 10.5px; color: var(--dim); margin-top: 2px; }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .hint { font-size: 12px; color: var(--dim); margin-bottom: 10px; }

    .scene-stack { display: flex; flex-direction: column; gap: 8px; }
    .scene-btn {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--elev);
      color: var(--text);
      padding: 12px 13px;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      transition: border-color 0.15s ease, transform 0.08s ease;
    }
    .scene-btn:active { transform: scale(0.99); }
    .scene-btn.active { border-color: var(--volt); box-shadow: 0 0 0 1px var(--volt); }
    .scene-btn-title { font-weight: 700; font-size: 14px; display: block; }
    .scene-btn-sub { font-size: 11.5px; color: var(--dim); display: block; margin-top: 2px; }
    .badge {
      font-family: var(--mono);
      font-size: 10.5px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 5px;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }

    /* BOSS BAR */
    .boss-bar-bg {
      height: 14px;
      width: 100%;
      background: #090b10;
      border: 1px solid var(--border);
      border-radius: 7px;
      overflow: hidden;
      margin: 8px 0;
    }
    .boss-bar-fill {
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, #ff3b00, #f59e0b);
      transition: width 0.25s ease;
    }
    .row-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .mini-btn {
      font-family: var(--mono);
      font-size: 11.5px;
      font-weight: 700;
      padding: 7px 11px;
      border-radius: 7px;
      border: 1px solid var(--border);
      background: var(--elev);
      color: var(--text);
      cursor: pointer;
    }
    .mini-btn.volt { background: var(--volt); color: #111; border-color: var(--volt); }
    .mini-btn.red { background: rgba(244, 63, 94, 0.16); color: #fda4af; border-color: var(--red); }

    label.lbl {
      display: block;
      font-family: var(--mono);
      font-size: 11px;
      color: var(--dim);
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    input[type="text"], input[type="number"] {
      width: 100%;
      background: #0c0e13;
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 9px 11px;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .send-btn {
      width: 100%;
      padding: 11px;
      border-radius: 8px;
      border: none;
      background: var(--volt);
      color: #111;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
    }

    .lb-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 9px;
      background: #0f1219;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      margin-bottom: 5px;
      font-family: var(--mono);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .feed {
      font-family: var(--mono);
      font-size: 11px;
      color: #cbd5e1;
      background: #090b10;
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 9px;
      max-height: 150px;
      overflow-y: auto;
      line-height: 1.5;
    }
    .toast {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--volt);
      color: #111;
      padding: 9px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 13px;
      display: none;
      z-index: 999;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <div class="title">CYBER ARENA LIVE</div>
        <div class="sub" id="role-sub">Монитор класса (только просмотр)</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="mini-btn" id="teacher-login-btn" onclick="promptTeacherLogin()">Вход учителя</button>
        <div class="pill" id="live-pill">x2 XP</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val" id="st-req">0</div>
        <div class="stat-lbl">Запросов</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="st-exp">x2</div>
        <div class="stat-lbl">Опыт</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="st-scale">1.0x</div>
        <div class="stat-lbl">Размер</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="st-cheats" style="color:var(--red);">0</div>
        <div class="stat-lbl">Читов поймано</div>
      </div>
    </div>

    <!-- РЕЖИМЫ МИРА (ТОЛЬКО ДЛЯ УЧИТЕЛЯ) -->
    <div class="card admin-only" style="display:none;">
      <div class="card-title">1. Режимы мира в Unity (1 клик)</div>
      <div class="hint">Нажми — и в проектах ребят (если включён Auto-Sync или по R) изменится цвет, скорость, размер и гравитация!</div>
      <div class="scene-stack">
        <button class="scene-btn" id="sc-normal" onclick="applyMode({ motd: 'Обычный режим x1. Куб зелёный, гравитация Земля.', expMultiplier: 1, cubeScale: 1.0, lowGravity: false, cubeColorHex: '#22C55E', status: 'online' }, 'sc-normal')">
          <div>
            <span class="scene-btn-title">Спокойная Земля (База)</span>
            <span class="scene-btn-sub">Зелёный цвет • размер 1.0 • гравитация -9.81</span>
          </div>
          <span class="badge" style="background:#22c55e; color:#111;">x1</span>
        </button>

        <button class="scene-btn" id="sc-x2" onclick="applyMode({ motd: 'Двойной опыт x2! Куб жёлтый и быстрее!', expMultiplier: 2, cubeScale: 1.2, lowGravity: false, cubeColorHex: '#FFD600', status: 'online' }, 'sc-x2')">
          <div>
            <span class="scene-btn-title">Двойной опыт</span>
            <span class="scene-btn-sub">Жёлтый цвет • крутится 2x • чуть крупнее</span>
          </div>
          <span class="badge" style="background:#ffd600; color:#111;">x2</span>
        </button>

        <button class="scene-btn" id="sc-x5" onclick="applyMode({ motd: 'МЕГА-ИВЕНТ x5! Красный турбо-режим!', expMultiplier: 5, cubeScale: 1.4, lowGravity: false, cubeColorHex: '#FF3B00', status: 'event' }, 'sc-x5')">
          <div>
            <span class="scene-btn-title">Мега-буст Турбо</span>
            <span class="scene-btn-sub">Красный цвет • крутится в 5 раз быстрее</span>
          </div>
          <span class="badge" style="background:#ff3b00; color:#fff;">x5</span>
        </button>

        <button class="scene-btn" id="sc-moon" onclick="applyMode({ motd: 'ЛУННАЯ НЕВЕСОМОСТЬ + ГИГАНТЫ!', expMultiplier: 2, cubeScale: 2.2, lowGravity: true, cubeColorHex: '#38BDF8', status: 'moon' }, 'sc-moon')">
          <div>
            <span class="scene-btn-title">Луна + Гигантский размер</span>
            <span class="scene-btn-sub">Голубой цвет • размер 2.2x • гравитация -1.8</span>
          </div>
          <span class="badge" style="background:#38bdf8; color:#111;">MOON</span>
        </button>

        <button class="scene-btn" id="sc-tiny" onclick="applyMode({ motd: 'МИКРО-РЕЖИМ! Кубики сжались!', expMultiplier: 4, cubeScale: 0.45, lowGravity: false, cubeColorHex: '#A855F7', status: 'tiny' }, 'sc-tiny')">
          <div>
            <span class="scene-btn-title">Фиолетовый Микро-куб</span>
            <span class="scene-btn-sub">Размер 0.45x • крутится 4x</span>
          </div>
          <span class="badge" style="background:#a855f7; color:#fff;">MINI</span>
        </button>
      </div>
    </div>

    <!-- ОБЩИЙ БОСС КЛАССА -->
    <div class="card">
      <div class="card-title">
        <span>2. Общий Босс класса</span>
        <span class="badge" style="background:#1d2130; color:#ffd600;" id="boss-wins">Побед: 0</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-family:var(--mono); font-size:12px;">
        <b id="boss-name">Хранитель Багов</b>
        <span id="boss-hp-text" style="color:var(--amber); font-variant-numeric:tabular-nums;">100 / 100 HP</span>
      </div>
      <div class="boss-bar-bg">
        <div class="boss-bar-fill" id="boss-bar"></div>
      </div>
      <div style="font-size:12px; color:var(--dim);" id="boss-event">Ждём ударов из Unity (клавиша F)...</div>
      <div class="row-actions admin-only" style="display:none;">
        <button class="mini-btn volt" onclick="resetBoss()">Возродить Босса (100 HP)</button>
        <button class="mini-btn" onclick="testBossHit()">Ударить с панели (-15 HP)</button>
      </div>
    </div>

    <!-- ТЕКСТ НА ЭКРАНЫ -->
    <div class="card admin-only" style="display:none;">
      <div class="card-title">3. Сообщение классу (в 3D-табло над кубом)</div>
      <label class="lbl" for="in-motd">Текст в небе Unity</label>
      <input type="text" id="in-motd" placeholder="Например: Саша, лови привет из облака!" />
      <button class="send-btn" onclick="sendCustomMotd()">Отправить в Unity всем</button>
    </div>

    <!-- ЗАДАНИЯ В UNITY -->
    <div class="card admin-only" style="display:none;">
      <div class="card-title">4. Чеклист заданий в Unity (ученики тыкают прямо в игре!)</div>
      <label class="lbl" for="in-q1">Задание 1</label>
      <input type="text" id="in-q1" />
      <label class="lbl" for="in-q2">Задание 2</label>
      <input type="text" id="in-q2" />
      <label class="lbl" for="in-q3">Задание 3</label>
      <input type="text" id="in-q3" />
      <button class="send-btn" style="background:var(--cyan);" onclick="sendQuests()">Обновить задания в Unity</button>
    </div>

    <!-- ТАБЛИЦА ЛИДЕРОВ И ЛОГ -->
    <div class="card">
      <div class="card-title">
        <span>Игроки, Квесты, Монеты и Античит</span>
        <button class="mini-btn red admin-only" style="display:none;" onclick="resetPlayers()">Сбросить</button>
      </div>
      <div id="lb-list" style="margin-bottom:10px;">
        <div class="hint" style="margin:0;">Пока никто не собрал монеты — пусть нажмут E или F в Unity.</div>
      </div>
      <label class="lbl">Живой лог сервера</label>
      <div class="feed" id="event-feed"></div>
    </div>

    <!-- WEBSOCKET PUSH (УРОК 07, ТОЛЬКО УЧИТЕЛЬ) -->
    <div class="card admin-only" style="display:none;">
      <div class="card-title">5. Мгновенный WebSocket-сигнал классу (Урок 07)</div>
      <label class="lbl" for="in-ws-shout">Push в LiveSocketClient (прилетит за миллисекунды)</label>
      <input type="text" id="in-ws-shout" placeholder="Например: ВНИМАНИЕ! Бонус раунд через 5 секунд!" />
      <button class="send-btn" style="background:var(--orange); color:#fff;" onclick="sendWsShout()">⚡ Пушнуть всем по WebSocket</button>
    </div>

    <!-- МУЛЬТИПЛЕЕР: ПРИЗРАКИ, МАЯК, ПРОФИЛИ, КОМНАТЫ (УРОКИ 02-08) -->
    <div class="card">
      <div class="card-title">
        <span>6. Призраки, Маяк и Комнаты (Уроки 02–08)</span>
      </div>
      <div class="stats-grid" style="margin-bottom:10px;">
        <div class="stat-box">
          <div class="stat-val" id="st-ghosts" style="color:var(--cyan);">0</div>
          <div class="stat-lbl">Призраков</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" id="st-beacon" style="color:var(--volt);">0</div>
          <div class="stat-lbl">Маяк</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" id="st-profiles" style="color:var(--green);">0</div>
          <div class="stat-lbl">Профилей</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" id="st-rooms">0</div>
          <div class="stat-lbl">Комнат</div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <label class="lbl" style="margin:0;">Командный маяк (Урок 03)</label>
        <button class="mini-btn red admin-only" style="display:none; padding:3px 7px; font-size:10px;" onclick="resetBeacon()">Сбросить маяк</button>
      </div>
      <div class="lb-row" id="beacon-box" style="margin-bottom:10px;">
        <span id="beacon-text">Маяк активен! Сигналов: 0</span>
      </div>

      <label class="lbl">Живые призраки на арене (Урок 02)</label>
      <div id="sync-list" style="margin-bottom:10px;">
        <div class="hint" style="margin:0;">Призраков пока нет (нужен OnlinePlayersRadar.cs).</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <label class="lbl" style="margin:0;">Игровые комнаты и лобби (Урок 08)</label>
        <button class="mini-btn red admin-only" style="display:none; padding:3px 7px; font-size:10px;" onclick="resetRooms()">Очистить комнаты</button>
      </div>
      <div id="rooms-list">
        <div class="hint" style="margin:0;">Активных комнат пока нет (#ALPHA, #MOON).</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">Готово!</div>

  <script>
    const INITIAL = ${initial};

    function showToast(msg) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 1800);
    }

    function renderAll(data) {
      if (!data) return;
      const cfg = data.config || {};
      const st = data.stats || {};
      const boss = data.boss || {};
      const lb = data.leaderboard || {};
      const events = data.events || [];

      document.getElementById('st-req').textContent = st.totalRequests ?? 0;
      document.getElementById('st-exp').textContent = 'x' + (cfg.expMultiplier ?? 1);
      document.getElementById('st-scale').textContent = Number(cfg.cubeScale ?? 1).toFixed(1) + 'x';
      document.getElementById('st-cheats').textContent = st.totalCheatBlocks ?? 0;
      document.getElementById('live-pill').textContent = 'x' + (cfg.expMultiplier ?? 1) + (cfg.lowGravity ? ' MOON' : ' XP');

      const motdInput = document.getElementById('in-motd');
      if (motdInput && document.activeElement !== motdInput) {
        motdInput.value = cfg.motd || '';
      }

      const quests = data.quests || {};
      ['q1', 'q2', 'q3'].forEach(k => {
        const inp = document.getElementById('in-' + k);
        if (inp && document.activeElement !== inp && quests[k]) {
          inp.value = quests[k];
        }
      });

      // Boss
      document.getElementById('boss-name').textContent = boss.bossName || 'Босс';
      const hp = Number(boss.hp ?? 100);
      const maxHp = Number(boss.maxHp ?? 100) || 100;
      document.getElementById('boss-hp-text').textContent = hp + ' / ' + maxHp + ' HP';
      document.getElementById('boss-wins').textContent = 'Побед: ' + (boss.defeatedCount ?? 0);
      document.getElementById('boss-event').textContent = boss.lastEvent || '';
      document.getElementById('boss-bar').style.width = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100))) + '%';

      // Leaderboard
      const lbList = document.getElementById('lb-list');
      const players = lb.players || [];
      if (players.length === 0) {
        lbList.innerHTML = '<div class="hint" style="margin:0;">Пока пусто — пусть нажмут F (удар), L (сундук) или E (монеты) в Unity.</div>';
      } else {
        lbList.innerHTML = players.map((p, i) => {
          const qDone = Array.isArray(p.completedQuests) ? p.completedQuests.length : 0;
          return '<div class="lb-row">' +
            '<span>' + (i + 1) + '. <b>' + p.player + '</b> (хиты: ' + p.hits + ' | квесты: ' + qDone + '/3)</span>' +
            '<span style="color:#ffd600;">' + p.coins + ' мон.' + (p.cheatAttempts > 0 ? ' <span style="color:#f43f5e;">[читов: ' + p.cheatAttempts + ']</span>' : '') + '</span>' +
          '</div>';
        }).join('');
      }

      // Feed
      const feedEl = document.getElementById('event-feed');
      if (feedEl) {
        feedEl.innerHTML = events.map(e => '<div>' + e.replace(/</g, '&lt;') + '</div>').join('');
      }

      // Lessons 02-08 live metrics
      const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const syncPlayers = data.syncPlayers || [];
      const beacon = data.beacon || {};
      const rooms = data.rooms || [];

      document.getElementById('st-ghosts').textContent = syncPlayers.length;
      document.getElementById('st-beacon').textContent = beacon.totalPulses ?? 0;
      document.getElementById('st-profiles').textContent = data.profilesCount ?? 0;
      document.getElementById('st-rooms').textContent = rooms.length;
      document.getElementById('beacon-text').textContent = (beacon.statusText || 'Маяк активен') + ' (имп: ' + (beacon.totalPulses ?? 0) + ')';

      const syncEl = document.getElementById('sync-list');
      if (syncEl) {
        if (syncPlayers.length === 0) {
          syncEl.innerHTML = '<div class="hint" style="margin:0;">Призраков пока нет (нужен OnlinePlayersRadar.cs).</div>';
        } else {
          syncEl.innerHTML = syncPlayers.map(sp =>
            '<div class="lb-row"><span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;background:' + esc(sp.colorHex || '#38BDF8') + ';"></span><b>' + esc(sp.player) + '</b></span><span>(' + Number(sp.x || 0).toFixed(1) + ', ' + Number(sp.y || 0).toFixed(1) + ', ' + Number(sp.z || 0).toFixed(1) + ')</span></div>'
          ).join('');
        }
      }

      const roomsEl = document.getElementById('rooms-list');
      if (roomsEl) {
        if (rooms.length === 0) {
          roomsEl.innerHTML = '<div class="hint" style="margin:0;">Активных комнат пока нет (#ALPHA, #MOON).</div>';
        } else {
          roomsEl.innerHTML = rooms.map(rm =>
            '<div class="lb-row"><span><b>#' + esc(rm.roomCode) + '</b> (' + esc((rm.players || []).join(', ') || 'пусто') + ')</span><span style="color:#ffd600;">Босс: ' + Number(rm.bossHp ?? 100) + ' HP</span></div>'
          ).join('');
        }
      }
    }

    const ADMIN_KEY_STORAGE = 'unity_arena_admin_key';

    function getAdminKey() {
      try { return localStorage.getItem(ADMIN_KEY_STORAGE) || ''; } catch (_) { return ''; }
    }

    function setTeacherUnlocked(unlocked) {
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = unlocked ? (el.classList.contains('row-actions') ? 'flex' : 'block') : 'none';
      });
      const sub = document.getElementById('role-sub');
      const btn = document.getElementById('teacher-login-btn');
      if (sub) sub.textContent = unlocked ? 'Режим учителя: управление активно' : 'Монитор класса (только просмотр)';
      if (btn) btn.textContent = unlocked ? 'Выйти' : 'Вход учителя';
    }

    async function verifyAndUnlock(key, silent = false) {
      try {
        const res = await fetch('/admin/verify', {
          headers: key ? { 'x-admin-key': key } : {},
        });
        if (res.ok) {
          if (key) { try { localStorage.setItem(ADMIN_KEY_STORAGE, key); } catch (_) {} }
          setTeacherUnlocked(true);
          if (!silent) showToast('Режим учителя открыт!');
          return true;
        }
      } catch (_) {}
      setTeacherUnlocked(false);
      if (!silent) showToast('Неверный ключ учителя');
      return false;
    }

    async function promptTeacherLogin() {
      if (document.getElementById('teacher-login-btn')?.textContent === 'Выйти') {
        try { localStorage.removeItem(ADMIN_KEY_STORAGE); } catch (_) {}
        setTeacherUnlocked(false);
        showToast('Режим учителя закрыт');
        return;
      }
      const key = window.prompt('Введите ключ учителя (ADMIN_KEY):', getAdminKey());
      if (key === null) return;
      await verifyAndUnlock(key.trim(), false);
    }

    async function adminPost(url, bodyObj) {
      const headers = { 'Content-Type': 'application/json' };
      const key = getAdminKey();
      if (key) headers['x-admin-key'] = key;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: bodyObj !== undefined ? JSON.stringify(bodyObj) : undefined,
      });
      if (res.status === 403) {
        setTeacherUnlocked(false);
        showToast('Нужен ключ учителя!');
        throw new Error('Forbidden');
      }
      return res;
    }

    async function applyMode(payload, btnId) {
      document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
      await adminPost('/server/config', payload);
      await refreshState();
      showToast('Законы мира обновлены!');
    }

    async function sendCustomMotd() {
      const motd = document.getElementById('in-motd').value.trim();
      await adminPost('/server/config', { motd });
      await refreshState();
      showToast('Сообщение отправлено!');
    }

    async function sendQuests() {
      const q1 = document.getElementById('in-q1').value.trim();
      const q2 = document.getElementById('in-q2').value.trim();
      const q3 = document.getElementById('in-q3').value.trim();
      await adminPost('/game/quests', { q1, q2, q3 });
      await refreshState();
      showToast('Задания улетели в Unity!');
    }

    async function resetBoss() {
      await adminPost('/game/boss/reset');
      await refreshState();
      showToast('Босс возрождён (100 HP)!');
    }

    async function testBossHit() {
      await fetch('/game/boss/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: 'Учитель', damage: 15 }),
      });
      await refreshState();
      showToast('Босс получил -15 HP!');
    }

    async function resetPlayers() {
      await adminPost('/game/players/reset');
      await refreshState();
      showToast('Таблица игроков сброшена.');
    }

    async function sendWsShout() {
      const inp = document.getElementById('in-ws-shout');
      const text = inp ? inp.value.trim() : '';
      if (!text) return showToast('Введите текст сигнала');
      const res = await adminPost('/admin/shout', { text });
      const data = await res.json();
      if (inp) inp.value = '';
      showToast('Push отправлен (' + (data.clientsNotified ?? 0) + ' кл.)');
    }

    async function resetBeacon() {
      await adminPost('/admin/beacon/reset');
      await refreshState();
      showToast('Маяк сброшен');
    }

    async function resetRooms() {
      await adminPost('/admin/rooms/reset');
      await refreshState();
      showToast('Комнаты очищены');
    }

    async function refreshState() {
      try {
        const res = await fetch('/admin/state');
        const data = await res.json();
        renderAll(data);
      } catch (_) {}
    }

    renderAll(INITIAL);
    verifyAndUnlock(getAdminKey(), true);
    setInterval(refreshState, 2500);
  </script>
</body>
</html>`;
  }
}
