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
    };
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderMobilePanel(): string {
    const initial = JSON.stringify({
      config: this.gameState.getConfig(),
      stats: this.gameState.getStats(),
    });

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>STARTY // ПУЛЬТ УЧИТЕЛЯ (ТЕЛЕФОН)</title>
  <style>
    :root {
      --bg: #0f1117;
      --card: #181b24;
      --elev: #222634;
      --border: #31374a;
      --volt: #c6ff00;
      --orange: #ff3b00;
      --amber: #ffd600;
      --cyan: #38bdf8;
      --green: #22c55e;
      --text: #f4f4f5;
      --dim: #a1a1aa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 14px 14px 56px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.45;
    }
    .wrap { max-width: 560px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      background: var(--card);
      border: 2px solid var(--volt);
      border-radius: 10px;
      padding: 13px 14px;
      margin-bottom: 12px;
    }
    .title { font-weight: 900; font-size: 16px; color: var(--volt); }
    .sub { font-size: 11.5px; color: var(--dim); }
    .pill {
      font-family: monospace;
      font-weight: 900;
      font-size: 11px;
      padding: 5px 9px;
      border-radius: 6px;
      background: var(--volt);
      color: #111;
      white-space: nowrap;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .stat-box {
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 8px;
      padding: 10px 6px;
      text-align: center;
    }
    .stat-val { font-family: monospace; font-size: 19px; font-weight: 900; color: var(--amber); }
    .stat-lbl { font-size: 10.5px; color: var(--dim); }

    .card {
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .hint {
      font-size: 12px;
      color: var(--dim);
      margin-bottom: 10px;
    }
    .tag-ok {
      font-family: monospace;
      font-size: 10px;
      background: rgba(34, 197, 94, 0.16);
      color: #4ade80;
      border: 1px solid #22c55e;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .tag-later {
      font-family: monospace;
      font-size: 10px;
      background: rgba(161, 161, 170, 0.15);
      color: #d4d4d8;
      border: 1px solid #52525b;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* 3 BIG SCENE BUTTONS FOR LIVE LESSON */
    .scene-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .scene-btn {
      width: 100%;
      border: 2px solid var(--border);
      border-radius: 9px;
      background: var(--elev);
      color: var(--text);
      padding: 13px 14px;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .scene-btn:active { transform: scale(0.98); }
    .scene-btn.active { border-color: var(--volt); box-shadow: 0 0 0 1px var(--volt); }
    .scene-btn-title { font-weight: 800; font-size: 14.5px; display: block; }
    .scene-btn-sub { font-size: 11.5px; color: var(--dim); display: block; margin-top: 2px; }
    .scene-badge {
      font-family: monospace;
      font-weight: 900;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--dim);
      margin-bottom: 5px;
      margin-top: 11px;
    }
    input[type="text"], input[type="number"], textarea, select {
      width: 100%;
      background: var(--elev);
      border: 1.5px solid var(--border);
      border-radius: 7px;
      color: var(--text);
      padding: 10px 12px;
      font-size: 15px;
      font-family: inherit;
      outline: none;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--volt); }

    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .btn {
      flex: 1;
      min-width: 80px;
      border: none;
      border-radius: 8px;
      background: var(--elev);
      color: var(--text);
      padding: 12px 12px;
      font-weight: 800;
      font-size: 13.5px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-volt { background: var(--volt); color: #111; }
    .btn-orange { background: var(--orange); color: #fff; }
    .btn-sm { padding: 8px 10px; font-size: 12px; flex: 0 1 auto; }

    details.card summary {
      cursor: pointer;
      font-size: 13px;
      font-weight: 800;
      color: var(--dim);
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    details.card[open] summary { margin-bottom: 10px; color: var(--text); }

    .kv-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 6px;
      margin-bottom: 8px;
      align-items: center;
    }
    .json-preview {
      background: #090b10;
      color: var(--volt);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      font-family: monospace;
      font-size: 11.5px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 8px 0 0;
    }
    .toast {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--volt);
      color: #111;
      font-weight: 900;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 8px;
      display: none;
      z-index: 999;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <div class="title">⚡ ПУЛЬТ УЧИТЕЛЯ (UNITY)</div>
        <div class="sub">Нажми кнопку здесь &rarr; дети жмут <b>R</b> в игре</div>
      </div>
      <div class="pill" id="live-status-pill">ONLINE</div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val" id="stat-pings">0</div>
        <div class="stat-lbl">Запросов Unity</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="stat-exp">x2.0</div>
        <div class="stat-lbl">Множитель</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="stat-uptime">0s</div>
        <div class="stat-lbl">Аптайм</div>
      </div>
    </div>

    <!-- BLOCK 1: 3 MAIN BUTTONS FOR LIVE LESSON -->
    <div class="card">
      <div class="card-title">
        <span>🎬 Быстрые режимы для Урока 1</span>
        <span class="tag-ok">Работает сразу</span>
      </div>
      <div class="hint">Меняют <code>motd</code>, скорость вращения и цвет кубика у всех учеников в Unity (<code>ServerCubeBoost.cs</code> и <code>ServerBridgeExample.cs</code>).</div>

      <div class="scene-stack">
        <button class="scene-btn" id="btn-scene-1" onclick="applyPreset('online', 'Сервер в штатном режиме. Обычный опыт x1.', 1)">
          <div>
            <span class="scene-btn-title">1️⃣ Обычный режим</span>
            <span class="scene-btn-sub">Зелёный куб • медленное вращение</span>
          </div>
          <span class="scene-badge" style="background:#22c55e; color:#111;">x1 XP</span>
        </button>

        <button class="scene-btn" id="btn-scene-2" onclick="applyPreset('online', '🔥 Двойной опыт включён! Куб жёлтый!', 2)">
          <div>
            <span class="scene-btn-title">2️⃣ Двойной опыт (Старт урока)</span>
            <span class="scene-btn-sub">Жёлтый куб • скорость x2</span>
          </div>
          <span class="scene-badge" style="background:#ffd600; color:#111;">x2 XP</span>
        </button>

        <button class="scene-btn" id="btn-scene-5" onclick="applyPreset('event', '⚡ МЕГА-ИВЕНТ! Красный турбо-режим x5!', 5)">
          <div>
            <span class="scene-btn-title">3️⃣ ВАУ-ЭФФЕКТ! Мега-буст x5</span>
            <span class="scene-btn-sub">Красный куб • турбо-вращение x5!</span>
          </div>
          <span class="scene-badge" style="background:#ff3b00; color:#fff;">x5 XP</span>
        </button>
      </div>
    </div>

    <!-- BLOCK 2: EXACT FIELDS CONNECTED IN LESSON 1 -->
    <div class="card">
      <div class="card-title">
        <span>✏️ Ручная настройка (текст и числа)</span>
        <span class="tag-ok">Урок 1 ✅</span>
      </div>

      <label><span>Статус (<code>/server/status</code>)</span></label>
      <select id="f-status">
        <option value="online">🟢 online</option>
        <option value="event">🔥 event</option>
        <option value="maintenance">🛠️ maintenance</option>
      </select>

      <label><span>Заголовок игры (<code>title</code>)</span></label>
      <input type="text" id="f-title" placeholder="STARTY Battle Arena" />

      <label><span>Сообщение дня на экране у детей (<code>motd</code>)</span></label>
      <textarea id="f-motd" rows="2"></textarea>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label><span>Множитель (<code>expMultiplier</code>)</span></label>
          <input type="number" step="0.5" min="0.1" max="100" id="f-exp" />
        </div>
        <div>
          <label><span>Игроков (<code>activePlayers</code>)</span></label>
          <input type="number" min="0" max="999" id="f-players" />
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-volt" onclick="saveConfig()">💾 Применить в облаке</button>
      </div>
    </div>

    <!-- BLOCK 3: FUTURE LESSON FIELDS (COLLAPSED BY DEFAULT) -->
    <details class="card">
      <summary>
        <span>🔧 Поля для Урока 2+ (на вырост)</span>
        <span class="tag-later">Не подключены в Уроке 1</span>
      </summary>
      <div class="hint">Эти поля уже отдаются в <code>/server/config</code>, но базовые скрипты Урока 1 их ещё не читают. Откроем, когда будем делать новые механики на стриме.</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label><span>speedMultiplier</span></label>
          <input type="number" step="0.1" min="0.1" max="20" id="f-speed" />
        </div>
        <div>
          <label><span>themeColor</span></label>
          <input type="text" id="f-color" />
        </div>
      </div>

      <label><span>Свои поля (<code>customData</code>)</span></label>
      <div id="kv-list"></div>
      <div class="btn-row">
        <button class="btn btn-sm" onclick="addKvRow()">➕ Добавить поле</button>
        <button class="btn btn-sm btn-volt" onclick="saveConfig()">💾 Сохранить</button>
      </div>
    </details>

    <!-- BLOCK 4: LINKS & JSON PREVIEW -->
    <details class="card">
      <summary>
        <span>🔗 Ссылки, Swagger и живой JSON</span>
        <span class="tag-later">/api &bull; JSON</span>
      </summary>
      <div class="btn-row">
        <button class="btn btn-orange" onclick="copyUrl()">📋 Копировать URL для Unity</button>
        <a class="btn" href="/api" target="_blank">📖 Swagger (/api)</a>
      </div>
      <div class="btn-row">
        <a class="btn btn-sm" href="/server/status" target="_blank">/server/status</a>
        <a class="btn btn-sm" href="/server/motd" target="_blank">/server/motd</a>
        <a class="btn btn-sm" href="/server/config" target="_blank">/server/config</a>
      </div>
      <pre class="json-preview" id="json-preview"></pre>
    </details>
  </div>

  <div class="toast" id="toast">✅ Обновлено! Ребята могут жать R в Unity</div>

  <script>
    const INITIAL = ${initial};
    let customKv = Object.entries(INITIAL.config.customData || {});

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2200);
    }

    function applyToUI(data) {
      const c = data.config || data;
      const s = data.stats || {};
      document.getElementById('f-status').value = c.status || 'online';
      document.getElementById('f-title').value = c.title || '';
      document.getElementById('f-motd').value = c.motd || '';
      document.getElementById('f-exp').value = c.expMultiplier ?? 2;
      document.getElementById('f-speed').value = c.speedMultiplier ?? 1;
      document.getElementById('f-players').value = c.activePlayers ?? 1;
      document.getElementById('f-color').value = c.themeColor || '#FFD600';

      const exp = Number(c.expMultiplier ?? 2);
      document.getElementById('live-status-pill').textContent = (c.status || 'online').toUpperCase();
      document.getElementById('stat-exp').textContent = 'x' + exp.toFixed(1);
      if (s.totalRequests !== undefined) document.getElementById('stat-pings').textContent = s.totalRequests;
      if (s.uptimeSeconds !== undefined) document.getElementById('stat-uptime').textContent = s.uptimeSeconds + 's';

      document.getElementById('btn-scene-1').classList.toggle('active', exp === 1);
      document.getElementById('btn-scene-2').classList.toggle('active', exp === 2);
      document.getElementById('btn-scene-5').classList.toggle('active', exp >= 5);

      document.getElementById('json-preview').textContent = JSON.stringify(c, null, 2);
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function renderKv() {
      const box = document.getElementById('kv-list');
      box.innerHTML = '';
      customKv.forEach(([k, v], idx) => {
        const row = document.createElement('div');
        row.className = 'kv-row';
        row.innerHTML =
          '<input type="text" placeholder="ключ" value="' + escapeHtml(k) + '" oninput="customKv[' + idx + '][0]=this.value" />' +
          '<input type="text" placeholder="значение" value="' + escapeHtml(v) + '" oninput="customKv[' + idx + '][1]=this.value" />' +
          '<button class="btn btn-sm" onclick="removeKvRow(' + idx + ')">✕</button>';
        box.appendChild(row);
      });
    }

    function addKvRow() {
      customKv.push(['newKey', '100']);
      renderKv();
    }

    function removeKvRow(idx) {
      customKv.splice(idx, 1);
      renderKv();
    }

    function applyPreset(status, motd, exp) {
      document.getElementById('f-status').value = status;
      document.getElementById('f-motd').value = motd;
      document.getElementById('f-exp').value = exp;
      saveConfig();
    }

    async function saveConfig() {
      const kvObj = {};
      customKv.forEach(([k, v]) => {
        if (String(k).trim()) kvObj[String(k).trim()] = String(v);
      });

      const payload = {
        status: document.getElementById('f-status').value,
        title: document.getElementById('f-title').value,
        motd: document.getElementById('f-motd').value,
        expMultiplier: Number(document.getElementById('f-exp').value),
        speedMultiplier: Number(document.getElementById('f-speed').value),
        activePlayers: Number(document.getElementById('f-players').value),
        themeColor: document.getElementById('f-color').value,
        customData: kvObj,
      };

      const res = await fetch('/server/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      applyToUI({ config: json.config, stats: json.stats });
      showToast('✅ Обновлено! Ребята могут жать R в Unity');
    }

    function copyUrl() {
      const url = window.location.origin;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
      }
      showToast('📋 Скопировано: ' + url);
    }

    async function pollStats() {
      try {
        const res = await fetch('/admin/state');
        const json = await res.json();
        if (json.stats) {
          document.getElementById('stat-pings').textContent = json.stats.totalRequests;
          document.getElementById('stat-uptime').textContent = json.stats.uptimeSeconds + 's';
        }
      } catch (_) {}
    }

    applyToUI(INITIAL);
    renderKv();
    setInterval(pollStats, 3000);
  </script>
</body>
</html>`;
  }
}
