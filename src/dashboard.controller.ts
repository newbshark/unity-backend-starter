import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { GameStateService } from './game-state.service';

@ApiExcludeController()
@Controller()
export class DashboardController {
  constructor(private readonly gameState: GameStateService) {}

  @Get('admin/state')
  getAdminState() {
    return {
      config: this.gameState.getConfig(),
      stats: this.gameState.getStats(),
      boss: this.gameState.getBoss(),
      leaderboard: this.gameState.getLeaderboard(),
      events: this.gameState.getRecentEvents(),
    };
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderMobilePanel(): string {
    const initial = JSON.stringify({
      config: this.gameState.getConfig(),
      stats: this.gameState.getStats(),
      boss: this.gameState.getBoss(),
      leaderboard: this.gameState.getLeaderboard(),
      events: this.gameState.getRecentEvents(),
    });

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
        <div class="title">ПУЛЬТ УЧИТЕЛЯ LIVE</div>
        <div class="sub">Одно нажатие меняет игру у всего класса</div>
      </div>
      <div class="pill" id="live-pill">x2 XP</div>
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

    <!-- РЕЖИМЫ МИРА (GOD MODE) -->
    <div class="card">
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
      <div class="row-actions">
        <button class="mini-btn volt" onclick="resetBoss()">Возродить Босса (100 HP)</button>
        <button class="mini-btn" onclick="testBossHit()">Ударить с панели (-15 HP)</button>
      </div>
    </div>

    <!-- ТЕКСТ НА ЭКРАНЫ -->
    <div class="card">
      <div class="card-title">3. Сообщение классу (в Unity MOTD)</div>
      <label class="lbl" for="in-motd">Текст на экранах ребят</label>
      <input type="text" id="in-motd" placeholder="Например: Саша, лови привет из облака!" />
      <button class="send-btn" onclick="sendCustomMotd()">Отправить в Unity всем</button>
    </div>

    <!-- ТАБЛИЦА ЛИДЕРОВ И ЛОГ -->
    <div class="card">
      <div class="card-title">
        <span>4. Игроки, Монеты и Античит</span>
        <button class="mini-btn red" onclick="resetPlayers()">Сбросить</button>
      </div>
      <div id="lb-list" style="margin-bottom:10px;">
        <div class="hint" style="margin:0;">Пока никто не собрал монеты — пусть нажмут E или F в Unity.</div>
      </div>
      <label class="lbl">Живой лог сервера</label>
      <div class="feed" id="event-feed"></div>
    </div>

    <div style="text-align:center; font-size:12px; color:var(--dim); margin-top:8px;">
      <a href="/api" target="_blank" style="color:var(--cyan); font-weight:700;">Swagger API (/api)</a>
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
        lbList.innerHTML = players.map((p, i) =>
          '<div class="lb-row">' +
            '<span>' + (i + 1) + '. <b>' + p.player + '</b> (хитов: ' + p.hits + ')</span>' +
            '<span style="color:#ffd600;">' + p.coins + ' мон.' + (p.cheatAttempts > 0 ? ' <span style="color:#f43f5e;">[читов: ' + p.cheatAttempts + ']</span>' : '') + '</span>' +
          '</div>'
        ).join('');
      }

      // Feed
      const feedEl = document.getElementById('event-feed');
      if (feedEl) {
        feedEl.innerHTML = events.map(e => '<div>' + e.replace(/</g, '&lt;') + '</div>').join('');
      }
    }

    async function applyMode(payload, btnId) {
      document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
      const res = await fetch('/server/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await res.json();
      await refreshState();
      showToast('Законы мира обновлены!');
    }

    async function sendCustomMotd() {
      const motd = document.getElementById('in-motd').value.trim();
      await fetch('/server/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motd }),
      });
      await refreshState();
      showToast('Сообщение отправлено!');
    }

    async function resetBoss() {
      await fetch('/game/boss/reset', { method: 'POST' });
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
      await fetch('/game/players/reset', { method: 'POST' });
      await refreshState();
      showToast('Таблица игроков сброшена.');
    }

    async function refreshState() {
      try {
        const res = await fetch('/admin/state');
        const data = await res.json();
        renderAll(data);
      } catch (_) {}
    }

    renderAll(INITIAL);
    setInterval(refreshState, 2500);
  </script>
</body>
</html>`;
  }
}
