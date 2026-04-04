/* ── Reset & base ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

:root {
  --bg: #0f172a;
  --bg2: #1e293b;
  --bg3: #273348;
  --border: rgba(255,255,255,0.08);
  --border2: rgba(255,255,255,0.14);
  --text: #f1f5f9;
  --text2: #94a3b8;
  --text3: #64748b;
  --accent: #38bdf8;
  --accent2: #0ea5e9;
  --ok: #4ade80;
  --warn: #fbbf24;
  --urgent: #f87171;
  --due: #a78bfa;
  --radius: 12px;
  --radius-sm: 8px;
  --nav-h: 68px;
  --top-h: 52px;
  --font: 'DM Sans', system-ui, sans-serif;
  --mono: 'DM Mono', monospace;
}

html, body {
  height: 100%;
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  line-height: 1.5;
  overflow: hidden;
}

/* ── Screens ── */
.screen { display: none; width: 100%; height: 100vh; overflow: hidden; }
.screen.active { display: flex; flex-direction: column; }

/* ── Setup ── */
.setup-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}
.setup-logo { text-align: center; padding: 1rem 0; }
.logo-mark {
  width: 60px; height: 60px;
  background: var(--accent2);
  color: #fff;
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 500;
  border-radius: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
  letter-spacing: -1px;
}
.setup-logo h1 { font-size: 22px; font-weight: 600; color: var(--text); }
.setup-logo p { font-size: 14px; color: var(--text2); margin-top: 4px; }
.setup-card {
  background: var(--bg2);
  border: 0.5px solid var(--border2);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.setup-help { font-size: 13px; color: var(--accent); text-align: center; text-decoration: none; }
.setup-error { background: rgba(248,113,113,0.12); border: 0.5px solid rgba(248,113,113,0.3); border-radius: var(--radius-sm); padding: .75rem 1rem; font-size: 13px; color: var(--urgent); }

/* ── Help ── */
.help-wrap {
  flex: 1; overflow-y: auto; padding: 1.25rem;
  max-width: 520px; margin: 0 auto; width: 100%;
  display: flex; flex-direction: column; gap: 1rem;
}
.help-wrap h2 { font-size: 18px; font-weight: 600; margin-top: .5rem; }
.back-btn { background: none; border: none; color: var(--accent); font-size: 14px; cursor: pointer; padding: 0; font-family: var(--font); }
.help-step { display: flex; gap: 12px; }
.step-n {
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--bg3); border: 0.5px solid var(--border2);
  font-size: 12px; font-weight: 500; color: var(--text2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.help-step strong { font-size: 14px; font-weight: 500; display: block; margin-bottom: 4px; }
.help-step p { font-size: 13px; color: var(--text2); line-height: 1.5; }
code { font-family: var(--mono); font-size: 12px; background: var(--bg3); padding: 1px 5px; border-radius: 4px; color: var(--accent); }
.schema-box { background: var(--bg2); border: 0.5px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.schema-title { padding: .6rem 1rem; font-size: 12px; font-weight: 500; color: var(--text2); text-transform: uppercase; letter-spacing: .05em; border-bottom: 0.5px solid var(--border); }
.schema-row { display: flex; justify-content: space-between; align-items: center; padding: .5rem 1rem; border-bottom: 0.5px solid var(--border); font-size: 13px; }
.schema-row:last-child { border-bottom: none; }
.schema-row code { font-size: 12px; }
.schema-row span { color: var(--text3); font-size: 12px; }

/* ── Topbar ── */
.topbar {
  height: var(--top-h);
  background: var(--bg2);
  border-bottom: 0.5px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1rem;
  flex-shrink: 0;
  position: relative; z-index: 10;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.logo-sm {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--accent2); color: #fff;
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: -0.5px; flex-shrink: 0;
}
.topbar-title { font-size: 16px; font-weight: 500; }
.topbar-right { display: flex; align-items: center; gap: 4px; }
.icon-btn {
  width: 34px; height: 34px; border-radius: 8px;
  background: none; border: 0.5px solid var(--border);
  color: var(--text2); font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.icon-btn:active { background: var(--bg3); }
.sync-badge {
  background: var(--warn);
  color: #0f172a;
  font-size: 11px; font-weight: 600;
  padding: 2px 7px; border-radius: 20px;
}

/* ── Bottom nav ── */
.bottom-nav {
  height: var(--nav-h);
  background: var(--bg2);
  border-top: 0.5px solid var(--border);
  display: flex; align-items: center;
  flex-shrink: 0;
  order: 99;
  position: relative; z-index: 10;
}
.nav-item {
  flex: 1; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; background: none; border: none;
  color: var(--text3); cursor: pointer;
  font-family: var(--font); transition: color .15s;
}
.nav-item.active { color: var(--accent); }
.nav-icon { font-size: 18px; line-height: 1; }
.nav-label { font-size: 10px; font-weight: 500; }
.nav-center {
  width: 52px; height: 52px; flex: none;
  background: var(--accent2);
  border-radius: 50%; color: #fff;
  font-size: 24px; font-weight: 300;
  margin: 0 4px;
  border: none; box-shadow: 0 4px 12px rgba(14,165,233,0.35);
}
.nav-center.active { color: #fff; }

/* ── Tabs ── */
.tab { display: none; flex: 1; overflow: hidden; flex-direction: column; min-height: 0; }
.tab.active { display: flex; }
.scroll-body { flex: 1; overflow-y: auto; padding: 1rem 1rem 1.5rem; -webkit-overflow-scrolling: touch; }
.scroll-body--search { padding-top: 0; }

/* ── Stats grid ── */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 1.25rem; }
.stat-card {
  background: var(--bg2); border: 0.5px solid var(--border);
  border-radius: var(--radius); padding: 1rem;
}
.stat-card.urgent { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.06); }
.stat-card.warn { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.06); }
.stat-card.ok { border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.06); }
.stat-n { font-size: 28px; font-weight: 600; font-family: var(--mono); letter-spacing: -1px; }
.stat-l { font-size: 12px; color: var(--text2); margin-top: 2px; font-weight: 500; }
.stat-card.urgent .stat-n { color: var(--urgent); }
.stat-card.warn .stat-n { color: var(--warn); }
.stat-card.ok .stat-n { color: var(--ok); }

/* ── Section heads ── */
.section-head {
  font-size: 11px; font-weight: 500; text-transform: uppercase;
  letter-spacing: .07em; color: var(--text3);
  margin: 1.25rem 0 .6rem;
}

/* ── Building bars ── */
.building-bars { display: flex; flex-direction: column; gap: 10px; margin-bottom: .5rem; }
.bbar-row {}
.bbar-meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
.bbar-name { color: var(--text2); }
.bbar-count { color: var(--text3); }
.bbar-track { height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
.bbar-fill { height: 100%; border-radius: 3px; transition: width .4s; }

/* ── Asset cards ── */
.card-list { display: flex; flex-direction: column; gap: 8px; }
.asset-card {
  background: var(--bg2); border: 0.5px solid var(--border);
  border-radius: var(--radius); padding: .9rem 1rem;
  cursor: pointer; transition: border-color .15s, background .15s;
  display: flex; align-items: center; gap: 12px;
}
.asset-card:active { background: var(--bg3); }
.asset-card.status-urgent { border-left: 3px solid var(--urgent); }
.asset-card.status-monitor { border-left: 3px solid var(--warn); }
.asset-card.status-due { border-left: 3px solid var(--due); }
.asset-card.status-ok { border-left: 3px solid var(--ok); }
.ac-info { flex: 1; min-width: 0; }
.ac-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac-meta { font-size: 12px; color: var(--text2); margin-top: 2px; }
.ac-badge { flex-shrink: 0; }

/* ── Badges ── */
.badge {
  display: inline-block; font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 20px;
}
.badge-ok { background: rgba(74,222,128,0.12); color: #4ade80; }
.badge-warn { background: rgba(251,191,36,0.12); color: #fbbf24; }
.badge-urgent { background: rgba(248,113,113,0.12); color: #f87171; }
.badge-due { background: rgba(167,139,250,0.12); color: #a78bfa; }

/* ── Search + filter ── */
.search-bar-wrap { padding: .75rem 1rem .5rem; background: var(--bg); position: sticky; top: 0; z-index: 5; }
.search-input {
  width: 100%; padding: 10px 14px;
  background: var(--bg2); border: 0.5px solid var(--border2);
  border-radius: var(--radius-sm); color: var(--text);
  font-family: var(--font); font-size: 15px;
  margin-bottom: .5rem;
}
.search-input::placeholder { color: var(--text3); }
.search-input:focus { outline: none; border-color: var(--accent); }
.filter-pills { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
.filter-pills::-webkit-scrollbar { display: none; }
.pill {
  padding: 5px 14px; border-radius: 20px;
  border: 0.5px solid var(--border2);
  background: none; color: var(--text2);
  font-size: 12px; font-weight: 500; cursor: pointer;
  font-family: var(--font); white-space: nowrap;
  transition: all .15s;
}
.pill.active { background: var(--accent2); color: #fff; border-color: var(--accent2); }

/* ── Form ── */
.form-card { background: var(--bg2); border: 0.5px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
.form-section-title {
  font-size: 11px; font-weight: 500; text-transform: uppercase;
  letter-spacing: .07em; color: var(--text3);
  margin: 1.25rem 0 .75rem;
}
.form-section-title:first-child { margin-top: 0; }
.field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: .75rem; }
.field-group label { font-size: 12px; color: var(--text2); font-weight: 500; }
.field-group input, .field-group select, .field-group textarea {
  background: var(--bg3); border: 0.5px solid var(--border2);
  border-radius: var(--radius-sm); color: var(--text);
  font-family: var(--font); font-size: 15px; padding: 10px 12px;
  width: 100%; appearance: none; -webkit-appearance: none;
}
.field-group select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
.field-group textarea { height: 90px; resize: none; line-height: 1.5; }
.field-group input:focus, .field-group select:focus, .field-group textarea:focus { outline: none; border-color: var(--accent); }
.field-group input[type=date] { color-scheme: dark; }
.field-hint { font-size: 11px; color: var(--text3); }

/* ── Checklist ── */
.checklist-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: .5rem; }
.check-item {
  display: flex; align-items: center; gap: 12px;
  background: var(--bg3); border: 0.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 12px 14px; cursor: pointer;
  transition: border-color .15s;
}
.check-item:active { border-color: var(--border2); }
.check-circle {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid var(--border2); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.check-circle.checked { background: var(--accent2); border-color: var(--accent2); }
.check-circle.checked::after {
  content: ''; width: 5px; height: 9px;
  border: 2px solid #fff; border-top: none; border-left: none;
  transform: rotate(45deg) translate(-1px,-1px); display: block;
}
.check-text { font-size: 13px; color: var(--text); flex: 1; line-height: 1.4; }

/* ── Condition options ── */
.condition-options { display: flex; flex-direction: column; gap: 6px; }
.cond-opt {
  display: flex; align-items: center; gap: 12px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 12px 14px; cursor: pointer; transition: all .15s;
}
.cond-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.cond-ok .cond-dot { background: var(--ok); }
.cond-warn .cond-dot { background: var(--warn); }
.cond-urgent .cond-dot { background: var(--urgent); }
.cond-label { font-size: 14px; font-weight: 500; }
.cond-sub { font-size: 12px; color: var(--text2); }
.cond-opt.selected.cond-ok { border-color: var(--ok); background: rgba(74,222,128,0.06); }
.cond-opt.selected.cond-warn { border-color: var(--warn); background: rgba(251,191,36,0.06); }
.cond-opt.selected.cond-urgent { border-color: var(--urgent); background: rgba(248,113,113,0.06); }

/* ── Buttons ── */
.btn-primary {
  width: 100%; padding: 14px; border-radius: var(--radius);
  background: var(--accent2); color: #fff;
  font-family: var(--font); font-size: 15px; font-weight: 500;
  border: none; cursor: pointer; transition: opacity .15s;
}
.btn-primary:active { opacity: .85; }

/* ── Form feedback ── */
.form-feedback {
  margin-top: .75rem; padding: .75rem 1rem;
  border-radius: var(--radius-sm); font-size: 13px;
}
.form-feedback.success { background: rgba(74,222,128,0.1); color: var(--ok); }
.form-feedback.error { background: rgba(248,113,113,0.1); color: var(--urgent); }

/* ── Queue ── */
.queue-header { margin-bottom: 1rem; }
.queue-header p { font-size: 13px; color: var(--text2); margin-bottom: .75rem; line-height: 1.5; }
.queue-card {
  background: var(--bg2); border: 0.5px solid var(--border);
  border-radius: var(--radius); padding: .9rem 1rem; margin-bottom: 8px;
}
.queue-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.queue-asset { font-size: 14px; font-weight: 500; }
.queue-meta { font-size: 12px; color: var(--text2); }
.empty-state { text-align: center; padding: 2rem 1rem; color: var(--text3); font-size: 14px; }

/* ── Print preview ── */
.print-preview { margin-top: 1rem; }
.print-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: .7rem 0; border-bottom: 0.5px solid var(--border);
}
.print-row:last-child { border-bottom: none; }
.pr-name { font-size: 13px; font-weight: 500; }
.pr-meta { font-size: 11px; color: var(--text2); margin-top: 2px; }
.pr-right { text-align: right; }
.pr-next { font-size: 11px; color: var(--text3); margin-top: 3px; }

/* ── Detail overlay ── */
.detail-overlay {
  position: absolute; inset: 0;
  background: var(--bg); z-index: 20;
  display: flex; flex-direction: column; overflow: hidden;
}
.detail-inner { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
.detail-back { background: none; border: none; color: var(--accent); font-size: 14px; cursor: pointer; font-family: var(--font); padding: 0; margin-bottom: 1rem; display: block; }
.detail-name { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
.detail-building { font-size: 13px; color: var(--text2); margin-bottom: 1rem; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.detail-table td { padding: 8px 0; border-bottom: 0.5px solid var(--border); }
.detail-table td:first-child { color: var(--text2); width: 130px; }
.detail-table tr:last-child td { border-bottom: none; }

/* ── Loading ── */
.loading-overlay {
  position: absolute; inset: 0; background: rgba(15,23,42,0.8);
  z-index: 30; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
}
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2.5px solid var(--bg3);
  border-top-color: var(--accent);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-msg { font-size: 13px; color: var(--text2); }

/* ── Toast ── */
.toast {
  position: absolute; bottom: calc(var(--nav-h) + 12px); left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: var(--bg3); border: 0.5px solid var(--border2);
  color: var(--text); padding: 10px 20px; border-radius: 20px;
  font-size: 13px; white-space: nowrap; z-index: 40;
  opacity: 0; transition: all .2s; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── Inventory ── */
.inv-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding: .75rem 1rem .5rem; background: var(--bg);
  position: sticky; top: 0; z-index: 5;
}
.low-stock-banner {
  margin: 0 1rem .5rem;
  background: rgba(248,113,113,0.1);
  border: 0.5px solid rgba(248,113,113,0.3);
  border-radius: var(--radius-sm);
  padding: .6rem 1rem;
  font-size: 13px; color: var(--urgent);
}
.inv-card {
  background: var(--bg2); border: 0.5px solid var(--border);
  border-radius: var(--radius); padding: .9rem 1rem;
  margin-bottom: 8px; cursor: pointer; transition: background .15s;
}
.inv-card:active { background: var(--bg3); }
.inv-card.low-stock { border-left: 3px solid var(--urgent); }
.inv-card.ok-stock { border-left: 3px solid var(--ok); }
.inv-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.inv-name { font-size: 14px; font-weight: 500; }
.inv-meta { font-size: 12px; color: var(--text2); margin-top: 2px; }
.inv-qty {
  text-align: right; flex-shrink: 0;
}
.inv-qty-num { font-size: 22px; font-weight: 600; font-family: var(--mono); line-height: 1; }
.inv-qty-unit { font-size: 11px; color: var(--text2); }
.inv-qty-num.low { color: var(--urgent); }
.inv-qty-num.ok { color: var(--ok); }
.inv-min { font-size: 11px; color: var(--text3); margin-top: 4px; }

.stock-info {
  background: var(--bg3); border-radius: var(--radius-sm);
  padding: .6rem 1rem; margin-bottom: .75rem;
  font-size: 13px;
}
.stock-info.low { color: var(--urgent); border: 0.5px solid rgba(248,113,113,0.3); }
.stock-info.ok { color: var(--ok); border: 0.5px solid rgba(74,222,128,0.2); }

.log-box {
  background: var(--bg3); border-radius: var(--radius-sm);
  padding: .75rem 1rem; font-size: 11px; font-family: var(--mono);
  color: var(--text2); line-height: 1.8; white-space: pre-wrap;
  max-height: 160px; overflow-y: auto; margin-top: .5rem;
}

/* ── Work orders ── */
.wo-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding: .75rem 1rem .5rem; background: var(--bg);
  position: sticky; top: 0; z-index: 5;
}
.btn-new-wo {
  background: var(--accent2); color: #fff;
  border: none; border-radius: var(--radius-sm);
  padding: 7px 14px; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: var(--font); white-space: nowrap;
  flex-shrink: 0;
}
.wo-card {
  background: var(--bg2); border: 0.5px solid var(--border);
  border-radius: var(--radius); padding: .9rem 1rem;
  margin-bottom: 8px; cursor: pointer; transition: background .15s;
}
.wo-card:active { background: var(--bg3); }
.wo-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.wo-title { font-size: 14px; font-weight: 500; flex: 1; }
.wo-meta { font-size: 12px; color: var(--text2); }
.wo-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.wo-card.pri-emergency { border-left: 3px solid var(--urgent); }
.wo-card.pri-urgent { border-left: 3px solid var(--warn); }
.wo-card.pri-routine { border-left: 3px solid var(--text3); }

/* priority badge */
.badge-emergency { background: rgba(248,113,113,0.12); color: #f87171; }
.badge-urgent-pri { background: rgba(251,191,36,0.12); color: #fbbf24; }
.badge-routine { background: rgba(100,116,139,0.15); color: #94a3b8; }

/* status badge */
.badge-open { background: rgba(56,189,248,0.12); color: #38bdf8; }
.badge-assigned { background: rgba(167,139,250,0.12); color: #a78bfa; }
.badge-estimate { background: rgba(251,191,36,0.12); color: #fbbf24; }
.badge-approval { background: rgba(251,146,60,0.12); color: #fb923c; }
.badge-inprogress { background: rgba(56,189,248,0.12); color: #38bdf8; }
.badge-done { background: rgba(74,222,128,0.12); color: #4ade80; }

/* priority selector */
.priority-options { display: flex; flex-direction: column; gap: 6px; }
.pri-opt {
  display: flex; align-items: center; gap: 12px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 11px 14px; cursor: pointer; transition: all .15s;
}
.pri-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.pri-routine .pri-dot { background: var(--text3); }
.pri-urgent .pri-dot { background: var(--warn); }
.pri-emergency .pri-dot { background: var(--urgent); }
.pri-label { font-size: 14px; font-weight: 500; }
.pri-sub { font-size: 12px; color: var(--text2); }
.pri-opt.selected.pri-routine { border-color: var(--text3); background: rgba(100,116,139,0.08); }
.pri-opt.selected.pri-urgent { border-color: var(--warn); background: rgba(251,191,36,0.06); }
.pri-opt.selected.pri-emergency { border-color: var(--urgent); background: rgba(248,113,113,0.06); }

/* WO status stepper */
.status-stepper { display: flex; align-items: center; gap: 0; margin: 1rem 0; overflow-x: auto; padding-bottom: 4px; }
.step-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 60px;
}
.step-circle {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--border2);
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 500; color: var(--text3);
  flex-shrink: 0;
}
.step-circle.done { background: var(--accent2); border-color: var(--accent2); color: #fff; }
.step-circle.current { border-color: var(--accent); color: var(--accent); }
.step-label { font-size: 10px; color: var(--text3); text-align: center; line-height: 1.2; }
.step-label.current { color: var(--accent); }
.step-connector { flex: 1; height: 1.5px; background: var(--border2); min-width: 12px; flex-shrink: 0; margin-bottom: 16px; }
.step-connector.done { background: var(--accent2); }

/* WO detail action buttons */
.wo-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
.btn-secondary {
  width: 100%; padding: 12px; border-radius: var(--radius);
  background: var(--bg3); color: var(--text);
  font-family: var(--font); font-size: 14px; font-weight: 500;
  border: 0.5px solid var(--border2); cursor: pointer;
}

/* ── Dashboard blocks ── */
.dash-block{background:var(--bg2);border:0.5px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:.75rem}
.dash-block-title{font-size:13px;font-weight:500;color:var(--text);margin-bottom:.75rem;display:flex;align-items:center;gap:8px}
.dash-block-sub{font-size:11px;color:var(--text3);font-weight:400;margin-left:auto}
.stats-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:.5rem}

/* Resource cards */
.res-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:.75rem}
.rcard{border-radius:10px;padding:10px 10px 8px;overflow:hidden}
.rcard-elec{background:rgba(251,191,36,.05);border:0.5px solid rgba(251,191,36,.2)}
.rcard-water{background:rgba(56,189,248,.05);border:0.5px solid rgba(56,189,248,.2)}
.rc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.rc-lbl{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.rc-lbl-elec{color:#fbbf24}.rc-lbl-water{color:#38bdf8}
.rc-badge{font-size:8px;padding:1px 5px;border-radius:8px;font-weight:500}
.rc-auto{background:rgba(74,222,128,.1);border:0.5px solid rgba(74,222,128,.2);color:#4ade80}
.rc-manual{background:rgba(100,116,139,.1);border:0.5px solid rgba(100,116,139,.2);color:#64748b}
.rc-val{font-size:20px;font-weight:600;font-family:var(--font-mono);letter-spacing:-0.5px;line-height:1}
.rc-val-elec{color:#fbbf24}.rc-val-water{color:#38bdf8}
.rc-unit{font-size:8px;color:var(--text3);margin-top:1px}
.rc-delta{font-size:9px;margin-top:3px}
.delta-up{color:#f87171}.delta-down{color:#4ade80}
.spark{display:block;width:100%;height:26px;margin-top:5px}
.log-reading-btn{width:100%;padding:8px;border-radius:8px;background:rgba(14,165,233,.08);border:0.5px solid rgba(14,165,233,.2);color:#38bdf8;font-size:12px;font-weight:500;font-family:var(--font);cursor:pointer;text-align:center}

/* ── Filter drawer ── */
.filter-drawer-btn{background:var(--bg2);border:0.5px solid var(--border2);border-radius:var(--radius-sm);padding:8px 12px;font-size:13px;color:var(--text2);display:flex;align-items:center;gap:6px;cursor:pointer;font-family:var(--font);flex-shrink:0;white-space:nowrap}
.filter-drawer-btn.active{border-color:#38bdf8;color:#38bdf8;background:rgba(56,189,248,.06)}
.filter-dot{width:6px;height:6px;border-radius:50%;background:#38bdf8;display:none;flex-shrink:0}
.filter-dot.show{display:block}
.chips-row{display:flex;gap:5px;overflow-x:auto;padding:5px 0 2px;min-height:0}
.chips-row::-webkit-scrollbar{display:none}
.chip{display:flex;align-items:center;gap:4px;background:rgba(56,189,248,.1);border:0.5px solid rgba(56,189,248,.25);border-radius:12px;padding:3px 8px;font-size:11px;color:#38bdf8;white-space:nowrap;cursor:pointer;flex-shrink:0}
.results-mini{font-size:11px;color:var(--text3);padding:2px 0 4px}
.drawer-overlay{position:absolute;inset:0;bottom:68px;background:rgba(0,0,0,0);pointer-events:none;transition:background .25s;z-index:20}
.drawer-overlay.open{background:rgba(0,0,0,.6);pointer-events:all}
.drawer{position:absolute;left:0;right:0;bottom:0;background:var(--bg2);border-radius:16px 16px 0 0;transform:translateY(100%);transition:transform .28s cubic-bezier(.32,1,.56,1);z-index:21;display:flex;flex-direction:column;max-height:80%}
.drawer.open{transform:translateY(0)}
.drawer-handle-bar{width:32px;height:3px;background:var(--bg3);border-radius:2px;margin:10px auto 6px}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding:4px 16px 8px;flex-shrink:0;border-bottom:0.5px solid var(--border)}
.drawer-title{font-size:14px;font-weight:500;color:var(--text)}
.drawer-reset{font-size:13px;color:#38bdf8;cursor:pointer}
.drawer-body{overflow-y:auto;padding:10px 16px 8px;-webkit-overflow-scrolling:touch}
.drawer-body::-webkit-scrollbar{display:none}
.drawer-group{margin-bottom:14px}
.drawer-group-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;color:var(--text3)}
.drawer-label-building{color:#38bdf8}
.drawer-label-landscape{color:#4ade80}
.drawer-label-engineering{color:#fbbf24}
.drawer-label-type{color:#a78bfa}
.drawer-pills{display:flex;flex-wrap:wrap;gap:5px}
.dpill{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;background:var(--bg);border:0.5px solid var(--border2);color:var(--text2);cursor:pointer;font-family:var(--font);transition:all .12s}
.dpill.dpill-active,.dpill.selected{background:#38bdf8;color:#fff;border-color:#38bdf8}
.drawer-footer{padding:10px 16px 14px;border-top:0.5px solid var(--border);flex-shrink:0}

/* ── Utilities ── */
.hidden { display: none !important; }
#screen-app { position: relative; }
