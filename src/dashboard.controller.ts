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
  <title>STARTY // ПУЛЬТ БЭКЕНДА UNITY</title>
  <style>
    :root {
      --bg: #111115;
      --card: #1a1b23;
      --elev: #232530;
      --border: #323546;
      --volt: #c6ff00;
      --orange: #ff3b00;
      --amber: #ffd600;
      --cyan: #38bdf8;
      --text: #f4f4f5;
      --dim: #a1a1aa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 14px;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.4;
      padding-bottom: 48px;
    }
    .wrap {
      max-width: 640px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      background: var(--card);
      border: 2px solid var(--volt);
      padding: 14px;
      margin-bottom: 14px;
    }
    .title {
      font-weight: 900;
      font-size: 16px;
      letter-spacing: 0.02em;
      color: var(--volt);
    }
    .sub {
      font-size: 11.5px;
      color: var(--dim);
      font-family: monospace;
    }
    .pill {
      font-family: monospace;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 8px;
      background: var(--volt);
      color: #111;
      white-space: nowrap;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat-box {
      background: var(--card);
      border: 1.5px solid var(--border);
      padding: 10px 8px;
      text-align: center;
    }
    .stat-val {
      font-family: monospace;
      font-size: 18px;
      font-weight: 900;
      color: var(--amber);
    }
    .stat-lbl {
      font-size: 10.5px;
      color: var(--dim);
      text-transform: uppercase;
    }
    .card {
      background: var(--card);
      border: 1.5px solid var(--border);
      padding: 14px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 10px;
      letter-spacing: 0.04em;
    }
    label {
      display: block;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--dim);
      margin-bottom: 5px;
      margin-top: 10px;
    }
    label:first-child { margin-top: 0; }
    input[type="text"], input[type="number"], textarea, select {
      width: 100%;
      background: var(--elev);
      border: 1.5px solid var(--border);
      color: var(--text);
      padding: 11px 12px;
      font-size: 15px;
      font-family: inherit;
      outline: none;
    }
    input:focus, textarea:focus, select:focus {
      border-color: var(--volt);
    }
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .btn {
      flex: 1;
      min-width: 72px;
      border: 1.5px solid #111;
      background: var(--elev);
      color: var(--text);
      padding: 11px 10px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn:active { transform: scale(0.98); }
    .btn-volt { background: var(--volt); color: #111; }
    .btn-orange { background: var(--orange); color: #fff; }
    .btn-amber { background: var(--amber); color: #111; }
    .btn-sm { padding: 7px 9px; font-size: 12px; flex: 0 1 auto; }
    .kv-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 6px;
      margin-bottom: 8px;
      align-items: center;
    }
    .json-preview {
      background: #09090b;
      color: var(--volt);
      border: 1px solid var(--border);
      padding: 10px;
      font-family: monospace;
      font-size: 11.5px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
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
      border: 2px solid #111;
      display: none;
      z-index: 999;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <div class="title">⚡ STARTY // ПУЛЬТ БЭКЕНДА</div>
        <div class="sub" id="origin-label">Unity Cloud Control</div>
      </div>
      <div class="pill" id="live-status-pill">ONLINE</div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-val" id="stat-pings">0</div>
        <div class="stat-lbl">Запросов Unity</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="stat-uptime">0s</div>
        <div class="stat-lbl">Аптайм</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" id="stat-exp">x2.0</div>
        <div class="stat-lbl">Множитель XP</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🎮 Управление миром (применяется сразу у всех!)</div>

      <label>Статус сервера (/server/status)</label>
      <select id="f-status">
        <option value="online">🟢 online (Штатный режим)</option>
        <option value="event">🔥 event (Ивент / Бонус)</option>
        <option value="maintenance">🛠️ maintenance (Техработы)</option>
      </select>

      <label>Заголовок (/server/motd &rarr; title)</label>
      <input type="text" id="f-title" placeholder="STARTY Battle Arena" />

      <label>Сообщение дня (/server/motd &rarr; motd)</label>
      <textarea id="f-motd" rows="2"></textarea>
      <div class="btn-row">
        <button class="btn btn-sm" onclick="setMotdPreset('🔥 Двойной опыт включён! Бегите фармить!', 2)">🔥 x2 XP</button>
        <button class="btn btn-sm" onclick="setMotdPreset('⚡ МЕГА-ИВЕНТ! Множитель x5 для всех!', 5)">⚡ x5 XP</button>
        <button class="btn btn-sm" onclick="setMotdPreset('🏆 Финал урока! Показываем свои проекты!', 1)">🏆 Финал</button>
      </div>

      <label>Множитель опыта / буста (expMultiplier)</label>
      <input type="number" step="0.5" min="0.1" max="100" id="f-exp" />
      <div class="btn-row">
        <button class="btn btn-sm" onclick="quickExp(1)">x1</button>
        <button class="btn btn-sm" onclick="quickExp(2)">x2</button>
        <button class="btn btn-sm" onclick="quickExp(5)">x5</button>
        <button class="btn btn-sm" onclick="quickExp(10)">x10</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div>
          <label>Множитель скорости</label>
          <input type="number" step="0.1" min="0.1" max="20" id="f-speed" />
        </div>
        <div>
          <label>Игроков (activePlayers)</label>
          <input type="number" min="0" max="999" id="f-players" />
        </div>
      </div>

      <label>Цвет события (themeColor)</label>
      <div class="btn-row">
        <input type="text" id="f-color" style="flex:1;" />
        <button class="btn btn-sm" style="background:#FFD600;color:#111;" onclick="setColor('#FFD600')">Жёлтый</button>
        <button class="btn btn-sm" style="background:#C6FF00;color:#111;" onclick="setColor('#C6FF00')">Лайм</button>
        <button class="btn btn-sm" style="background:#FF3B00;color:#fff;" onclick="setColor('#FF3B00')">Огонь</button>
      </div>

      <div class="btn-row" style="margin-top:14px;">
        <button class="btn btn-volt" onclick="saveConfig()">💾 СОХРАНИТЬ НА СЕРВЕР</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🧩 Кастомные переменные (/server/config &rarr; customData)</div>
      <div style="font-size:12px; color:var(--dim); margin-bottom:10px;">
        Добавляй любые свои поля для новых уроков (например <code>bossHp</code>, <code>gravity</code>, <code>secretWord</code>).
      </div>
      <div id="kv-list"></div>
      <div class="btn-row">
        <button class="btn btn-sm btn-amber" onclick="addKvRow()">➕ Добавить поле</button>
        <button class="btn btn-sm btn-volt" onclick="saveConfig()">💾 Сохранить поля</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔗 Ссылки для класса и Swagger</div>
      <div class="btn-row">
        <button class="btn btn-orange" onclick="copyUrl()">📋 Копировать URL для Unity</button>
        <a class="btn" href="/api" target="_blank">📖 Swagger (/api)</a>
      </div>
      <div class="btn-row">
        <a class="btn btn-sm" href="/server/status" target="_blank">/server/status</a>
        <a class="btn btn-sm" href="/server/motd" target="_blank">/server/motd</a>
        <a class="btn btn-sm" href="/server/config" target="_blank">/server/config</a>
      </div>
      <label style="margin-top:12px;">Живой ответ /server/config:</label>
      <pre class="json-preview" id="json-preview"></pre>
    </div>
  </div>

  <div class="toast" id="toast">✅ Обновлено на сервере!</div>

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

      document.getElementById('live-status-pill').textContent = (c.status || 'online').toUpperCase();
      document.getElementById('stat-exp').textContent = 'x' + Number(c.expMultiplier ?? 2).toFixed(1);
      if (s.totalRequests !== undefined) document.getElementById('stat-pings').textContent = s.totalRequests;
      if (s.uptimeSeconds !== undefined) document.getElementById('stat-uptime').textContent = s.uptimeSeconds + 's';

      document.getElementById('json-preview').textContent = JSON.stringify(c, null, 2);
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

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function addKvRow() {
      customKv.push(['newKey', '100']);
      renderKv();
    }

    function removeKvRow(idx) {
      customKv.splice(idx, 1);
      renderKv();
    }

    function setMotdPreset(text, exp) {
      document.getElementById('f-motd').value = text;
      document.getElementById('f-exp').value = exp;
      saveConfig();
    }

    function quickExp(val) {
      document.getElementById('f-exp').value = val;
      saveConfig();
    }

    function setColor(hex) {
      document.getElementById('f-color').value = hex;
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
      showToast('✅ Сохранено! Unity уже получает новые данные');
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

    document.getElementById('origin-label').textContent = window.location.origin;
    applyToUI(INITIAL);
    renderKv();
    setInterval(pollStats, 3000);
  </script>
</body>
</html>`;
  }
}
