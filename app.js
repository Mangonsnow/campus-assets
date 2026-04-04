// app.js — main application logic

const CHECKLIST_ITEMS = [
  'Visual — no visible damage or corrosion',
  'No unusual sounds or odours',
  'Operational controls respond correctly',
  'Safety labels and signage in place',
  'Surrounding area clean and accessible',
  'Maintenance log up to date',
];

const FREQUENCY_DAYS = {
  'Weekly': 7,
  'Monthly': 30,
  'Quarterly': 91,
  'Semi-annual': 182,
  'Annual': 365,
};

function calcNextDue(frequency, fromDate) {
  if (!frequency || !FREQUENCY_DAYS[frequency]) return '';
  const d = fromDate ? new Date(fromDate) : new Date();
  d.setDate(d.getDate() + FREQUENCY_DAYS[frequency]);
  return d.toISOString().split('T')[0];
}

const App = {
  _assets: [],
  _filteredAssets: [],
  _workOrders: [],
  _inventory: [],
  _activeFilter: '',
  _activeWOFilter: '',
  _selectedCondition: 'Good',
  _selectedPriority: 'Routine',
  _detailAsset: null,
  _detailWO: null,
  _detailInvItem: null,

  // ── Init ──
  async init() {
    const cfg = Store.getConfig();
    if (!cfg) {
      this.showScreen('setup');
      return;
    }
    Notion.init(cfg.token, cfg.assetsDb, cfg.inspectionsDb, cfg.workOrdersDb, cfg.inventoryDb, cfg.movementsDb);
    this.showScreen('app');
    this.renderQueue();
    this.buildChecklist();
    this.setInspectorName();

    // Load from cache first for instant display
    const cached = Store.getAssets();
    if (cached.length) {
      this._assets = cached;
      this._workOrders = Store.getWorkOrders();
      this._inventory = Store.getInventory();
      this.renderAll();
    }
    // Then fetch fresh from Notion
    await this.loadData();
  },

  // ── Setup ──
  async saveSetup() {
    const token = document.getElementById('setup-token').value.trim();
    const assetsDb = document.getElementById('setup-assets-db').value.trim().replace(/-/g, '');
    const inspDb = document.getElementById('setup-inspections-db').value.trim().replace(/-/g, '');
    const woDb = document.getElementById('setup-wo-db').value.trim().replace(/-/g, '');
    const invDb = document.getElementById('setup-inv-db').value.trim().replace(/-/g, '');
    const movDb = document.getElementById('setup-mov-db')?.value.trim().replace(/-/g, '') || '';
    const errEl = document.getElementById('setup-error');
    errEl.classList.add('hidden');

    if (!token || !assetsDb || !inspDb || !woDb || !invDb) {
      errEl.textContent = 'Please fill in all required fields.';
      errEl.classList.remove('hidden');
      return;
    }

    this.showLoading('Testing connection…');
    try {
      Notion.init(token, assetsDb, inspDb, woDb, invDb, movDb);
      await Notion.testConnection();
      Store.saveConfig({ token, assetsDb, inspectionsDb: inspDb, workOrdersDb: woDb, inventoryDb: invDb, movementsDb: movDb });
      this.hideLoading();
      this.showScreen('app');
      this.buildChecklist();
      this.setInspectorName();
      await this.loadData();
    } catch (e) {
      this.hideLoading();
      let msg = e.message || 'Unknown error';
      if (msg.includes('401')) msg = 'Invalid token — check your Notion integration secret.';
      else if (msg.includes('404')) msg = 'Database not found — check your database IDs and make sure you shared each database with your integration.';
      else if (msg.includes('fetch') || msg.includes('proxy') || msg.includes('network') || msg.includes('Failed')) msg = 'Could not reach Notion — check your internet connection and try again.';
      errEl.textContent = `Connection failed: ${msg}`;
      errEl.classList.remove('hidden');
    }
  },

  showHelp() { this.showScreen('help'); },
  showSetup() { this.showScreen('setup'); },
  resetSetup() {
    if (confirm('Reset connection settings?')) {
      Store.clearConfig();
      location.reload();
    }
  },

  // ── Load data from Notion ──
  async loadData(silent = false) {
    if (!silent) this.showLoading('Syncing with Notion…');
    try {
      const [assets, inspections, workOrders, inventory] = await Promise.all([
        Notion.getAssets(),
        Notion.getRecentInspections(),
        Notion.getWorkOrders(),
        Notion.getInventory(),
      ]);
      this._assets = assets;
      this._workOrders = workOrders;
      this._inventory = inventory;
      Store.saveAssets(assets);
      Store.saveInspections(inspections);
      Store.saveWorkOrders(workOrders);
      Store.saveInventory(inventory);
      this.renderAll();
      if (!silent) this.hideLoading();
    } catch (e) {
      if (!silent) this.hideLoading();
      this._assets = Store.getAssets();
      this._workOrders = Store.getWorkOrders();
      this._inventory = Store.getInventory();
      if (!silent) this.toast(`Offline — showing cached data`);
      this.renderAll();
    }
  },

  async reload() {
    await this.loadData();
    this.toast('Refreshed');
  },

  // ── Render everything ──
  renderAll() {
    this.renderStats();
    this.renderBuildingBars();
    this.renderAttention();
    this.renderWODashboard();
    this.renderRecent();
    this.renderAssets();
    this.renderWorkOrders();
    this.renderInventory();
    this.renderConsumption();
    this.renderPrint();
    this.populateBuildingSelects();
    this.updateSyncBadge();
  },

  // ── Stats (3 cards: Urgent, Due soon, Open orders) ──
  renderStats() {
    const a = this._assets;
    const openOrders = this._workOrders.filter(w => w.status !== 'Done').length;
    if (document.getElementById('st-urgent')) document.getElementById('st-urgent').textContent = a.filter(x => x.status === 'Urgent').length;
    if (document.getElementById('st-due')) document.getElementById('st-due').textContent = a.filter(x => x.status === 'Due soon').length;
    if (document.getElementById('st-ok')) document.getElementById('st-ok').textContent = openOrders;
  },

  // ── Building bars ──
  renderBuildingBars() {
    const buildings = [...new Set(this._assets.map(a => a.building).filter(Boolean))].sort();
    const el = document.getElementById('building-bars');
    if (!el) return;
    if (!buildings.length) { el.innerHTML = '<div class="empty-state">No data yet</div>'; return; }
    el.innerHTML = buildings.map(b => {
      const sub = this._assets.filter(a => a.building === b);
      const ok = sub.filter(a => a.status === 'OK').length;
      const pct = sub.length ? Math.round(ok / sub.length * 100) : 0;
      const color = pct === 100 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171';
      return `<div class="bbar-row">
        <div class="bbar-meta"><span class="bbar-name">${b}</span><span class="bbar-count">${ok}/${sub.length} OK</span></div>
        <div class="bbar-track"><div class="bbar-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>`;
    }).join('');
  },

  // ── Attention list ──
  renderAttention() {
    const urgent = this._assets.filter(a => ['Urgent','Due soon','Monitor'].includes(a.status));
    const el = document.getElementById('attention-list');
    if (!el) return;
    if (!urgent.length) { el.innerHTML = '<div class="empty-state">All assets OK</div>'; return; }
    el.innerHTML = urgent.slice(0,5).map(a => this._assetCard(a)).join('');
  },

  // ── Open WOs on dashboard ──
  renderWODashboard() {
    const el = document.getElementById('wo-dashboard-list');
    if (!el) return;
    const open = this._workOrders.filter(w => w.status !== 'Done').slice(0,4);
    if (!open.length) { el.innerHTML = '<div class="empty-state">No open orders</div>'; return; }
    const bc = s => ({Open:'badge-pending',Assigned:'badge-pending',Estimate:'badge-warn','Pending approval':'badge-warn','In progress':'badge-pending',Done:'badge-ok'}[s]||'badge-pending');
    el.innerHTML = open.map(w => `<div class="asset-card">
      <div class="ac-info"><div class="ac-name">${w.title}</div><div class="ac-meta">${w.created||''}${w.assignedTo?' · '+w.assignedTo:''}</div></div>
      <div class="ac-badge"><span class="badge ${bc(w.status)}">${w.status}</span></div>
    </div>`).join('');
  },

  // ── Recent inspections ──
  renderRecent() {
    const list = Store.getInspections().slice(0, 5);
    const el = document.getElementById('recent-list');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty-state">No inspections yet</div>'; return; }
    el.innerHTML = list.map(i => {
      const bc = i.condition === 'Urgent' ? 'badge-urgent' : i.condition === 'Monitor' ? 'badge-warn' : 'badge-ok';
      return `<div class="asset-card">
        <div class="ac-info"><div class="ac-name">${i.name}</div><div class="ac-meta">${i.date}${i.inspector?' · '+i.inspector:''}</div></div>
        <div class="ac-badge"><span class="badge ${bc}">${i.condition||'Good'}</span></div>
      </div>`;
    }).join('');
  },

  // ── Consumption ──
  renderConsumption() {
    const readings = Store.getMeterReadings();
    ['electricity','water'].forEach(type => {
      const rs = readings.filter(r => r.type === type).slice(-7);
      const isElec = type === 'electricity';
      const valId = isElec ? 'elec-val' : 'water-val';
      const deltaId = isElec ? 'elec-delta' : 'water-delta';
      const sparkId = isElec ? 'elec-spark' : 'water-spark';
      const color = isElec ? '#fbbf24' : '#38bdf8';
      const fill = isElec ? 'rgba(251,191,36,0.07)' : 'rgba(56,189,248,0.07)';
      if (rs.length >= 2) {
        const consumption = rs[rs.length-1].value - rs[rs.length-2].value;
        const el = document.getElementById(valId);
        if (el) el.textContent = consumption.toLocaleString();
        if (rs.length >= 3) {
          const prev = rs[rs.length-2].value - rs[rs.length-3].value;
          const pct = Math.round((consumption - prev) / prev * 100);
          const d = document.getElementById(deltaId);
          if (d) d.innerHTML = pct > 0
            ? `<span class="delta-up">↑ ${pct}%</span> <span style="font-size:9px;color:var(--text3)">vs prev</span>`
            : `<span class="delta-down">↓ ${Math.abs(pct)}%</span> <span style="font-size:9px;color:var(--text3)">vs prev</span>`;
        }
        const vals = rs.slice(1).map((r,i) => r.value - rs[i].value);
        this._drawSparkline(sparkId, vals, color, fill);
      }
    });
  },

  _drawSparkline(id, data, color, fill) {
    const canvas = document.getElementById(id);
    if (!canvas || !data.length) return;
    const w = canvas.offsetWidth||110, h = canvas.offsetHeight||26, dpr = window.devicePixelRatio||1;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const min = Math.min(...data), max = Math.max(...data), range = max-min||1;
    const pts = data.map((v,i) => ({ x: (i/(data.length-1))*w, y: h-((v-min)/range)*(h-4)-2 }));
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.lineCap='round'; ctx.stroke();
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    ctx.fillStyle=fill; ctx.fill();
  },

  // ── Meter reading ──
  showMeterReading() {
    const readings = Store.getMeterReadings().filter(r => r.type === 'electricity');
    const last = readings[readings.length-1];
    const hint = document.getElementById('meter-prev-hint');
    if (hint) hint.textContent = last ? `Last reading: ${last.value.toLocaleString()} kWh on ${last.date}` : 'No previous reading — enter the current meter value';
    document.getElementById('meter-date').value = new Date().toISOString().split('T')[0];
    const name = localStorage.getItem('ca_inspector_name');
    if (name) document.getElementById('meter-by').value = name;
    document.getElementById('meter-reading').value = '';
    document.getElementById('meter-overlay').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = 'Electricity reading';
  },
  closeMeterReading() {
    document.getElementById('meter-overlay').classList.add('hidden');
    document.getElementById('topbar-title').textContent = 'Dashboard';
  },
  saveMeterReading() {
    const val = parseFloat(document.getElementById('meter-reading').value);
    const date = document.getElementById('meter-date').value;
    const by = document.getElementById('meter-by').value.trim();
    const fb = document.getElementById('meter-feedback');
    if (!val||isNaN(val)) { fb.textContent='Please enter a valid reading.'; fb.className='form-feedback error'; fb.classList.remove('hidden'); return; }
    Store.addMeterReading({ type:'electricity', value:val, date, by });
    this.renderConsumption();
    fb.textContent='Reading saved ✓'; fb.className='form-feedback success'; fb.classList.remove('hidden');
    setTimeout(() => this.closeMeterReading(), 1200);
  },

  // ── Asset filter drawer ──
  _assetDrawerPending: {status:'',infra:'',type:''},
  _assetDrawerActive: {status:'',infra:'',type:''},
  openAssetDrawer() {
    this._assetDrawerPending = {...this._assetDrawerActive};
    this._syncDrawerUI();
    document.getElementById('asset-drawer').classList.add('open');
    document.getElementById('asset-drawer-overlay').classList.add('open');
  },
  closeAssetDrawer() {
    document.getElementById('asset-drawer').classList.remove('open');
    document.getElementById('asset-drawer-overlay').classList.remove('open');
  },
  drawerPick(btn) {
    const k=btn.dataset.key, v=btn.dataset.val;
    this._assetDrawerPending[k] = (this._assetDrawerPending[k]===v&&v!=='') ? '' : v;
    this._syncDrawerUI();
  },
  _syncDrawerUI() {
    document.querySelectorAll('#asset-drawer .dpill').forEach(p => {
      p.className = 'dpill' + (p.dataset.val===this._assetDrawerPending[p.dataset.key] ? ' selected' : '');
    });
  },
  applyAssetDrawer() {
    this._assetDrawerActive = {...this._assetDrawerPending};
    this.closeAssetDrawer();
    this.renderAssets();
    this._updateAssetChips();
  },
  resetAssetDrawer() {
    this._assetDrawerPending = {status:'',infra:'',type:''};
    this._syncDrawerUI();
  },
  _updateAssetChips() {
    const a = this._assetDrawerActive;
    const has = a.status||a.infra||a.type;
    const btn = document.getElementById('asset-filter-btn');
    const dot = document.getElementById('asset-filter-dot');
    if (btn) btn.className='filter-drawer-btn'+(has?' active':'');
    if (dot) dot.className='filter-dot'+(has?' show':'');
    const chips = document.getElementById('asset-chips');
    if (!chips) return;
    const arr=[];
    if (a.status) arr.push({k:'status',l:a.status});
    if (a.infra) arr.push({k:'infra',l:a.infra});
    if (a.type) arr.push({k:'type',l:a.type});
    chips.innerHTML = arr.map(c=>`<div class="chip" onclick="App._removeChip('${c.k}')"><span>${c.l}</span><span style="margin-left:2px;opacity:.6">×</span></div>`).join('');
    const mini = document.getElementById('asset-results-mini');
    if (mini) mini.textContent = has ? `${this._filteredAssets.length} of ${this._assets.length} assets` : '';
  },
  _removeChip(key) {
    this._assetDrawerActive[key]=''; this._assetDrawerPending[key]='';
    this._syncDrawerUI(); this.renderAssets(); this._updateAssetChips();
  },

  // ── Asset list tab ──
  renderAssets() {
    const q = (document.getElementById('asset-search')?.value || '').toLowerCase();
    const af = this._assetDrawerActive || {};
    this._filteredAssets = this._assets.filter(a => {
      const matchFilter = !af.status || a.status === af.status;
      const matchInfra = !af.infra || a.building === af.infra;
      const matchType = !af.type || a.category === af.type;
      const matchQ = !q || a.name.toLowerCase().includes(q) || (a.building||'').toLowerCase().includes(q);
      return matchFilter && matchInfra && matchType && matchQ;
    });
    const el = document.getElementById('asset-list');
    if (!this._filteredAssets.length) { el.innerHTML = '<div class="empty-state" style="padding:2rem 1rem">No assets found</div>'; return; }
    el.innerHTML = this._filteredAssets.map(a => this._assetCard(a, true)).join('');
  },

  _assetCard(a, clickable = true) {
    const statusClass = { OK: 'status-ok', Monitor: 'status-monitor', Urgent: 'status-urgent', 'Due soon': 'status-due' }[a.status] || '';
    const badgeClass = { OK: 'badge-ok', Monitor: 'badge-warn', Urgent: 'badge-urgent', 'Due soon': 'badge-due' }[a.status] || 'badge-ok';
    const onclick = clickable ? `onclick="App.openDetail('${a.id}')"` : '';
    return `<div class="asset-card ${statusClass}" ${onclick}>
      <div class="ac-info">
        <div class="ac-name">${a.name}</div>
        <div class="ac-meta">${[a.building, a.category].filter(Boolean).join(' · ')}${a.nextDue ? ' · Due: ' + a.nextDue : ''}</div>
      </div>
      <div class="ac-badge"><span class="badge ${badgeClass}">${a.status}</span></div>
    </div>`;
  },

  filterAssets() { this.renderAssets(); },
  setFilter(f, el) {
    this._activeFilter = f;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    this.renderAssets();
  },

  // ── Asset detail ──
  openDetail(id) {
    const a = this._assets.find(x => x.id === id);
    if (!a) return;
    this._detailAsset = a;
    const badgeClass = { OK: 'badge-ok', Monitor: 'badge-warn', Urgent: 'badge-urgent', 'Due soon': 'badge-due' }[a.status] || 'badge-ok';
    document.getElementById('detail-content').innerHTML = `
      <div class="detail-name">${a.name}</div>
      <div class="detail-building">${[a.building, a.category].filter(Boolean).join(' · ')}</div>
      <table class="detail-table">
        <tr><td>Status</td><td><span class="badge ${badgeClass}">${a.status}</span></td></tr>
        <tr><td>Frequency</td><td>${a.frequency || '—'}</td></tr>
        <tr><td>Last inspected</td><td>${a.lastInspected || '—'}</td></tr>
        <tr><td>Next due</td><td>${a.nextDue || '—'}</td></tr>
        <tr><td>Notes</td><td>${a.notes || '—'}</td></tr>
      </table>`;
    document.getElementById('asset-detail').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = a.name;
  },

  closeDetail() {
    this._detailAsset = null;
    document.getElementById('asset-detail').classList.add('hidden');
    document.getElementById('topbar-title').textContent = this._currentTab === 'assets' ? 'Assets' : 'Dashboard';
  },

  inspectFromDetail() {
    const a = this._detailAsset;
    if (!a) return;
    this.closeDetail();
    this.tab('inspect', document.querySelector('[data-tab=inspect]'));
    setTimeout(() => {
      const bSel = document.getElementById('f-building');
      bSel.value = a.building || '';
      this.filterFormAssets();
      setTimeout(() => {
        document.getElementById('f-asset').value = a.id;
        this._onAssetSelect();
      }, 50);
    }, 50);
  },

  // ── Inspection form ──
  buildChecklist() {
    document.getElementById('form-checklist').innerHTML = CHECKLIST_ITEMS.map((item, i) => `
      <div class="check-item" onclick="App.toggleCheck(this)">
        <div class="check-circle" id="chk-${i}"></div>
        <span class="check-text">${item}</span>
      </div>`).join('');
  },

  toggleCheck(el) {
    el.querySelector('.check-circle').classList.toggle('checked');
  },

  selectCondition(val, el) {
    this._selectedCondition = val;
    document.querySelectorAll('.cond-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  },

  setInspectorName() {
    const saved = localStorage.getItem('ca_inspector_name');
    if (saved) document.getElementById('f-inspector').value = saved;
    document.getElementById('f-inspector').addEventListener('change', e => {
      localStorage.setItem('ca_inspector_name', e.target.value);
    });
  },

  populateBuildingSelects() {
    const buildings = [...new Set(this._assets.map(a => a.building).filter(Boolean))].sort();
    ['f-building', 'print-filter'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      const first = sel.options[0];
      sel.innerHTML = '';
      sel.appendChild(first);
      buildings.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b; opt.textContent = b;
        sel.appendChild(opt);
      });
    });
  },

  filterFormAssets() {
    const building = document.getElementById('f-building').value;
    const sel = document.getElementById('f-asset');
    const first = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(first);
    const filtered = building ? this._assets.filter(a => a.building === building) : this._assets;
    filtered.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.name;
      opt.dataset.frequency = a.frequency || '';
      sel.appendChild(opt);
    });
    // Re-attach change handler
    sel.onchange = () => this._onAssetSelect();
  },

  _onAssetSelect() {
    const sel = document.getElementById('f-asset');
    const opt = sel.options[sel.selectedIndex];
    const frequency = opt?.dataset?.frequency || '';
    const today = new Date().toISOString().split('T')[0];
    const nextDueEl = document.getElementById('f-next-due');
    const hintEl = document.getElementById('f-next-due-hint');

    if (frequency && FREQUENCY_DAYS[frequency]) {
      const auto = calcNextDue(frequency, today);
      nextDueEl.value = auto;
      if (hintEl) hintEl.textContent = `Auto-calculated from ${frequency} frequency — override if needed`;
    } else {
      nextDueEl.value = '';
      if (hintEl) hintEl.textContent = 'No frequency set on this asset — enter manually';
    }
  },

  async submitInspection() {
    const assetId = document.getElementById('f-asset').value;
    const inspector = document.getElementById('f-inspector').value.trim();
    const notes = document.getElementById('f-notes').value.trim();
    const nextDue = document.getElementById('f-next-due').value;
    const fb = document.getElementById('form-feedback');

    if (!assetId) { this._feedback('Please select an asset.', 'error'); return; }

    const asset = this._assets.find(a => a.id === assetId);
    const assetName = asset?.name || 'Unknown asset';
    const today = new Date().toISOString().split('T')[0];

    // Collect checklist
    const checkResults = CHECKLIST_ITEMS.map((item, i) => {
      const checked = document.getElementById(`chk-${i}`)?.classList.contains('checked');
      return `${checked ? '✓' : '○'} ${item}`;
    }).join('\n');

    const inspectionData = {
      assetId,
      assetName,
      inspector,
      date: today,
      condition: this._selectedCondition,
      checklist: checkResults,
      notes,
      nextDue,
    };

    // Apply locally immediately (optimistic)
    Store.applyLocalInspection(inspectionData);
    this._assets = Store.getAssets();
    this.renderAll();

    // If urgent, offer to create work order
    const offerWO = this._selectedCondition === 'Urgent';

    // Try to sync to Notion
    this.showLoading('Saving inspection…');
    try {
      await Notion.createInspection(inspectionData);
      this.hideLoading();
      this._feedback('Inspection saved to Notion ✓', 'success');
      this._resetForm();
      // Reload fresh data
      await this.loadData(true);
      // Offer work order if urgent
      if (offerWO && confirm(`Condition marked Urgent for ${assetName}.\n\nCreate a repair work order now?`)) {
        this.tab('workorders', document.querySelector('[data-tab=workorders]'));
        this.showNewWO();
        document.getElementById('wo-title').value = `Urgent repair — ${assetName}`;
        document.getElementById('wo-description').value = notes;
        document.getElementById('wo-reporter').value = inspector;
        setTimeout(() => {
          document.querySelector('.pri-urgent').click();
        }, 100);
      }
    } catch (e) {
      this.hideLoading();
      // Queue for later sync
      Store.addToQueue(inspectionData);
      this.updateSyncBadge();
      this._feedback('Saved offline — will sync when connected', 'success');
      this._resetForm();
    }
    this.renderQueue();
  },

  _feedback(msg, type) {
    const fb = document.getElementById('form-feedback');
    fb.textContent = msg;
    fb.className = `form-feedback ${type}`;
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 4000);
  },

  _resetForm() {
    document.getElementById('f-building').value = '';
    document.getElementById('f-asset').value = '';
    document.getElementById('f-notes').value = '';
    document.getElementById('f-next-due').value = '';
    const hint = document.getElementById('f-next-due-hint');
    if (hint) hint.textContent = 'Select an asset to auto-calculate';
    this.filterFormAssets();
    document.querySelectorAll('.check-circle').forEach(c => c.classList.remove('checked'));
    document.querySelectorAll('.cond-opt').forEach(o => o.classList.remove('selected'));
    document.querySelector('.cond-ok').classList.add('selected');
    this._selectedCondition = 'Good';
  },

  // ── Offline queue ──
  renderQueue() {
    const q = Store.getQueue();
    const el = document.getElementById('queue-list');
    const empty = document.getElementById('queue-empty');
    if (!q.length) {
      el.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    el.innerHTML = q.map(item => `
      <div class="queue-card">
        <div class="queue-card-top">
          <span class="queue-asset">${item.assetName}</span>
          <span class="badge ${item.condition === 'Urgent' ? 'badge-urgent' : item.condition === 'Monitor' ? 'badge-warn' : 'badge-ok'}">${item.condition}</span>
        </div>
        <div class="queue-meta">${item.date} · ${item.inspector || 'No name'} · queued ${new Date(item._queuedAt).toLocaleTimeString()}</div>
      </div>`).join('');
  },

  async syncQueue() {
    const q = Store.getQueue();
    if (!q.length) { this.toast('Nothing to sync'); return; }
    this.showLoading(`Syncing ${q.length} inspection${q.length > 1 ? 's' : ''}…`);
    let synced = 0;
    for (const item of q) {
      try {
        await Notion.createInspection(item);
        Store.removeFromQueue(item._queueId);
        synced++;
      } catch (e) {
        // Leave in queue, try next time
      }
    }
    this.hideLoading();
    this.updateSyncBadge();
    this.renderQueue();
    if (synced) {
      this.toast(`Synced ${synced} inspection${synced > 1 ? 's' : ''} ✓`);
      await this.loadData(true);
    } else {
      this.toast('Still offline — try again later');
    }
  },

  updateSyncBadge() {
    const q = Store.getQueue();
    const badge = document.getElementById('sync-badge');
    if (q.length) {
      badge.textContent = `${q.length} pending`;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  },

  // ── Print ──
  renderPrint() {
    const building = document.getElementById('print-filter')?.value || '';
    const list = building ? this._assets.filter(a => a.building === building) : this._assets;
    const el = document.getElementById('print-preview');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty-state">No assets to show</div>'; return; }
    el.innerHTML = list.map(a => {
      const badgeClass = { OK: 'badge-ok', Monitor: 'badge-warn', Urgent: 'badge-urgent', 'Due soon': 'badge-due' }[a.status] || 'badge-ok';
      return `<div class="print-row">
        <div class="pr-left">
          <div class="pr-name">${a.name}</div>
          <div class="pr-meta">${a.building || ''}${a.category ? ' · ' + a.category : ''}</div>
        </div>
        <div class="pr-right">
          <span class="badge ${badgeClass}">${a.status}</span>
          <div class="pr-next">Due: ${a.nextDue || '—'}</div>
        </div>
      </div>`;
    }).join('');
  },

  doPrint() {
    const building = document.getElementById('print-filter').value;
    const list = building ? this._assets.filter(a => a.building === building) : this._assets;
    const today = new Date().toLocaleDateString();
    const rows = list.map(a => `
      <tr>
        <td>${a.name}</td>
        <td>${a.building || ''}</td>
        <td>${a.lastInspected || '—'}</td>
        <td><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:${a.status==='Urgent'?'#fee2e2':a.status==='Monitor'?'#fef3c7':a.status==='Due soon'?'#ede9fe':'#dcfce7'};color:${a.status==='Urgent'?'#991b1b':a.status==='Monitor'?'#92400e':a.status==='Due soon'?'#5b21b6':'#166534'}">${a.status}</span></td>
        <td>☐ OK &nbsp; ☐ Issue</td>
        <td style="color:#aaa;font-size:11px">_________________</td>
        <td style="color:#aaa;font-size:11px">______</td>
      </tr>`).join('');

    const w = window.open('', '_blank', 'width=960,height=700');
    w.document.write(`<!DOCTYPE html><html><head><title>Campus asset worksheet</title>
    <style>
      body{font-family:'Helvetica Neue',Arial,sans-serif;padding:2rem;color:#111;font-size:12px}
      h2{font-size:18px;font-weight:700;margin-bottom:2px}
      .sub{color:#666;margin-bottom:1.5rem;font-size:12px}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;padding:8px;border-bottom:2px solid #000;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      td{padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
      .checklist{margin-top:1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:6px 2rem}
      .chk{font-size:12px;color:#333}
      .footer{margin-top:1.5rem;display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;border-top:1px solid #ddd;padding-top:1rem}
      .sig-line{font-size:11px;color:#666;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:1rem}
      @media print{body{padding:1rem}}
    </style></head><body>
    <h2>Campus asset inspection worksheet</h2>
    <div class="sub">${building || 'All buildings'} &nbsp;·&nbsp; ${today} &nbsp;·&nbsp; Inspector: _______________________</div>
    <table>
      <thead><tr><th>Asset</th><th>Building</th><th>Last checked</th><th>Status</th><th>Site check</th><th>Notes</th><th>Sign</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="checklist">
      <b style="grid-column:1/-1;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin-top:.5rem">Checklist reminder</b>
      ${CHECKLIST_ITEMS.map(c => `<div class="chk">☐ ${c}</div>`).join('')}
    </div>
    <div class="footer">
      <div><div class="sig-line">Completed by</div></div>
      <div><div class="sig-line">Supervisor</div></div>
      <div><div class="sig-line">Date</div></div>
    </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  },

  // ── Work orders ──
  _woStatusFlow: ['Open','Assigned','Estimate','Pending approval','In progress','Done'],

  _woBadgeClass(status) {
    const m = { Open:'badge-open', Assigned:'badge-assigned', Estimate:'badge-estimate', 'Pending approval':'badge-approval', 'In progress':'badge-inprogress', Done:'badge-done' };
    return m[status] || 'badge-open';
  },
  _priClass(p) {
    return { Emergency:'pri-emergency', Urgent:'pri-urgent', Routine:'pri-routine' }[p] || 'pri-routine';
  },
  _priBadgeClass(p) {
    return { Emergency:'badge-emergency', Urgent:'badge-urgent-pri', Routine:'badge-routine' }[p] || 'badge-routine';
  },

  renderWorkOrders() {
    const list = this._workOrders.filter(w => !this._activeWOFilter || w.status === this._activeWOFilter);
    const el = document.getElementById('wo-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state" style="padding:2rem 1rem">No work orders found</div>'; return; }
    el.innerHTML = list.map(w => `
      <div class="wo-card ${this._priClass(w.priority)}" onclick="App.openWODetail('${w.id}')">
        <div class="wo-card-top">
          <div class="wo-title">${w.title}</div>
          <span class="badge ${this._priBadgeClass(w.priority)}">${w.priority}</span>
        </div>
        <div class="wo-meta">${w.created || ''}${w.reportedBy ? ' · ' + w.reportedBy : ''}${w.handlerType ? ' · ' + w.handlerType : ''}</div>
        <div class="wo-footer">
          <span class="badge ${this._woBadgeClass(w.status)}">${w.status}</span>
          ${w.assignedTo ? `<span style="font-size:11px;color:var(--text3)">${w.assignedTo}</span>` : ''}
        </div>
      </div>`).join('');
  },

  setWOFilter(f, el) {
    this._activeWOFilter = f;
    document.querySelectorAll('#wo-filter-pills .pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    this.renderWorkOrders();
  },

  openWODetail(id) {
    const w = this._workOrders.find(x => x.id === id);
    if (!w) return;
    this._detailWO = w;
    const stepIdx = this._woStatusFlow.indexOf(w.status);
    const steps = this._woStatusFlow.map((s, i) => {
      const isDone = i < stepIdx;
      const isCurrent = i === stepIdx;
      return `
        ${i > 0 ? `<div class="step-connector ${isDone ? 'done' : ''}"></div>` : ''}
        <div class="step-node">
          <div class="step-circle ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">${isDone ? '✓' : i + 1}</div>
          <div class="step-label ${isCurrent ? 'current' : ''}">${s}</div>
        </div>`;
    }).join('');

    const nextStatus = this._woStatusFlow[stepIdx + 1];
    const isExternal = w.handlerType === 'External';

    // Build action buttons based on current status
    let actions = '';
    if (w.status !== 'Done') {
      if (w.status === 'Open') {
        actions += `<button class="btn-secondary" onclick="App.advanceWO('${w.id}','Assigned')">Mark as assigned</button>`;
      }
      if (w.status === 'Assigned' && isExternal) {
        actions += `<button class="btn-secondary" onclick="App.promptEstimate('${w.id}')">Add estimate → send for approval</button>`;
      }
      if (w.status === 'Assigned' && !isExternal) {
        actions += `<button class="btn-secondary" onclick="App.advanceWO('${w.id}','In progress')">Start work</button>`;
      }
      if (w.status === 'Estimate') {
        actions += `<button class="btn-secondary" onclick="App.advanceWO('${w.id}','Pending approval')">Submit for approval</button>`;
      }
      if (w.status === 'Pending approval') {
        actions += `<button class="btn-secondary" onclick="App.advanceWO('${w.id}','In progress')">Approve → start work</button>`;
      }
      if (w.status === 'In progress') {
        actions += `<button class="btn-primary" onclick="App.advanceWO('${w.id}','Done')">Mark complete ✓</button>`;
      }
    }

    document.getElementById('wo-detail-content').innerHTML = `
      <div class="detail-name">${w.title}</div>
      <div class="detail-building" style="margin-bottom:.75rem">${w.handlerType || ''} · ${w.priority} priority</div>
      <div class="status-stepper">${steps}</div>
      <table class="detail-table">
        <tr><td>Status</td><td><span class="badge ${this._woBadgeClass(w.status)}">${w.status}</span></td></tr>
        <tr><td>Reported by</td><td>${w.reportedBy || '—'}</td></tr>
        <tr><td>Assigned to</td><td>${w.assignedTo || '—'}</td></tr>
        <tr><td>Created</td><td>${w.created || '—'}</td></tr>
        <tr><td>Estimate</td><td>${w.estimate || '—'}</td></tr>
        <tr><td>Completed</td><td>${w.completed || '—'}</td></tr>
        <tr><td>Description</td><td style="white-space:pre-wrap">${w.description || '—'}</td></tr>
      </table>
      <div class="wo-actions">${actions}</div>`;

    document.getElementById('wo-detail-overlay').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = 'Work order';
  },

  closeWODetail() {
    this._detailWO = null;
    document.getElementById('wo-detail-overlay').classList.add('hidden');
    document.getElementById('topbar-title').textContent = 'Work orders';
  },

  async advanceWO(id, newStatus) {
    const w = this._workOrders.find(x => x.id === id);
    if (!w) return;
    const extra = {};
    if (newStatus === 'Done') extra.completedDate = new Date().toISOString().split('T')[0];
    this.showLoading('Updating…');
    try {
      await Notion.updateWorkOrderStatus(id, newStatus, extra);
      w.status = newStatus;
      if (extra.completedDate) w.completed = extra.completedDate;
      Store.saveWorkOrders(this._workOrders);
      this.hideLoading();
      this.closeWODetail();
      this.renderWorkOrders();
      this.renderStats();
      this.toast(`Status updated: ${newStatus}`);
    } catch (e) {
      this.hideLoading();
      this.toast('Offline — update queued');
      w.status = newStatus;
      Store.saveWorkOrders(this._workOrders);
      this.closeWODetail();
      this.renderWorkOrders();
    }
  },

  promptEstimate(id) {
    const val = prompt('Enter estimate (e.g. $450 — 2 days labour):');
    if (!val) return;
    const w = this._workOrders.find(x => x.id === id);
    if (w) w.estimate = val;
    this.showLoading('Saving estimate…');
    Notion.updateWorkOrderStatus(id, 'Estimate', { estimate: val })
      .then(() => { this.hideLoading(); this.closeWODetail(); this.renderWorkOrders(); this.toast('Estimate saved'); })
      .catch(() => { this.hideLoading(); this.toast('Saved offline'); this.closeWODetail(); });
  },

  showNewWO() {
    this.populateWOBuildingSelect();
    document.getElementById('wo-form-overlay').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = 'New request';
    // Pre-fill reporter
    const name = localStorage.getItem('ca_inspector_name');
    if (name) document.getElementById('wo-reporter').value = name;
  },

  closeNewWO() {
    document.getElementById('wo-form-overlay').classList.add('hidden');
    document.getElementById('topbar-title').textContent = 'Work orders';
  },

  populateWOBuildingSelect() {
    const buildings = [...new Set(this._assets.map(a => a.building).filter(Boolean))].sort();
    const sel = document.getElementById('wo-building');
    const first = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(first);
    buildings.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; sel.appendChild(o); });
  },

  filterWOAssets() {
    const building = document.getElementById('wo-building').value;
    const sel = document.getElementById('wo-asset');
    const first = sel.options[0];
    sel.innerHTML = '';
    sel.appendChild(first);
    const filtered = building ? this._assets.filter(a => a.building === building) : this._assets;
    filtered.forEach(a => { const o = document.createElement('option'); o.value = a.id; o.textContent = a.name; sel.appendChild(o); });
  },

  selectPriority(val, el) {
    this._selectedPriority = val;
    document.querySelectorAll('.pri-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  },

  async submitWorkOrder() {
    const title = document.getElementById('wo-title').value.trim();
    const assetId = document.getElementById('wo-asset').value;
    const description = document.getElementById('wo-description').value.trim();
    const reportedBy = document.getElementById('wo-reporter').value.trim();
    const handlerType = document.getElementById('wo-handler').value;
    const assignedTo = document.getElementById('wo-assigned').value.trim();

    if (!title) { this._woFeedback('Please enter a title for the request.', 'error'); return; }

    const data = {
      title,
      assetId: assetId || null,
      description,
      reportedBy,
      handlerType,
      assignedTo,
      priority: this._selectedPriority,
      date: new Date().toISOString().split('T')[0],
    };

    Store.applyLocalWorkOrder(data);
    this._workOrders = Store.getWorkOrders();
    this.renderWorkOrders();
    this.renderStats();

    this.showLoading('Submitting request…');
    try {
      await Notion.createWorkOrder(data);
      this.hideLoading();
      this._woFeedback('Request submitted ✓', 'success');
      this._resetWOForm();
      await this.loadData(true);
    } catch (e) {
      this.hideLoading();
      Store.addToWOQueue(data);
      this.updateSyncBadge();
      this._woFeedback('Saved offline — will sync when connected', 'success');
      this._resetWOForm();
    }
  },

  _woFeedback(msg, type) {
    const fb = document.getElementById('wo-feedback');
    fb.textContent = msg;
    fb.className = `form-feedback ${type}`;
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 4000);
  },

  _resetWOForm() {
    document.getElementById('wo-title').value = '';
    document.getElementById('wo-building').value = '';
    document.getElementById('wo-description').value = '';
    document.getElementById('wo-assigned').value = '';
    document.getElementById('wo-asset').value = '';
    document.querySelectorAll('.pri-opt').forEach(o => o.classList.remove('selected'));
    document.querySelector('.pri-routine').classList.add('selected');
    this._selectedPriority = 'Routine';
  },

  _activeInvFilter: '',

  setInvFilter(f, el) {
    this._activeInvFilter = f;
    document.querySelectorAll('#inv-filter-pills .pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    this.renderInventory();
  },

  // ── Inventory ──
  renderInventory() {
    const q = (document.getElementById('inv-search')?.value || '').toLowerCase();
    const f = this._activeInvFilter;
    const list = this._inventory.filter(i => {
      const matchQ = !q || i.name.toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q);
      const isLow = i.minStock > 0 && i.qty <= i.minStock;
      const matchF = !f || (f === 'low' ? isLow : i.category === f);
      return matchQ && matchF;
    });

    // Low stock banner
    const lowItems = this._inventory.filter(i => i.minStock > 0 && i.qty <= i.minStock);
    const banner = document.getElementById('inv-low-stock-banner');
    if (lowItems.length) {
      banner.textContent = `⚠ ${lowItems.length} item${lowItems.length > 1 ? 's' : ''} at or below minimum stock: ${lowItems.map(i => i.name).join(', ')}`;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }

    const el = document.getElementById('inv-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state" style="padding:2rem 1rem">No items found</div>'; return; }

    // Group by category
    const cats = [...new Set(list.map(i => i.category || 'Uncategorised'))].sort();
    el.innerHTML = cats.map(cat => {
      const items = list.filter(i => (i.category || 'Uncategorised') === cat);
      return `<div class="section-head" style="padding:0 1rem">${cat}</div>` +
        items.map(i => this._invCard(i)).join('');
    }).join('');
  },

  _invCard(i) {
    const isLow = i.minStock > 0 && i.qty <= i.minStock;
    return `<div class="inv-card ${isLow ? 'low-stock' : 'ok-stock'}" onclick="App.openInvDetail('${i.id}')">
      <div class="inv-card-top">
        <div>
          <div class="inv-name">${i.name}</div>
          <div class="inv-meta">${[i.location, i.supplier].filter(Boolean).join(' · ') || '—'}</div>
        </div>
        <div class="inv-qty">
          <div class="inv-qty-num ${isLow ? 'low' : 'ok'}">${i.qty}</div>
          <div class="inv-qty-unit">${i.unit || 'units'}</div>
        </div>
      </div>
      ${i.minStock > 0 ? `<div class="inv-min">Min stock: ${i.minStock} ${i.unit || 'units'}${isLow ? ' — RESTOCK NEEDED' : ''}</div>` : ''}
    </div>`;
  },

  filterInventory() { this.renderInventory(); },

  openInvDetail(id) {
    const i = this._inventory.find(x => x.id === id);
    if (!i) return;
    this._detailInvItem = i;
    const isLow = i.minStock > 0 && i.qty <= i.minStock;
    document.getElementById('inv-detail-content').innerHTML = `
      <div class="detail-name">${i.name}</div>
      <div class="detail-building">${i.category || ''}${i.unit ? ' · ' + i.unit : ''}</div>
      <table class="detail-table" style="margin-top:1rem">
        <tr><td>In stock</td><td style="font-size:20px;font-weight:600;font-family:var(--mono);color:${isLow ? 'var(--urgent)' : 'var(--ok)'}">${i.qty} ${i.unit || ''}</td></tr>
        <tr><td>Min stock</td><td>${i.minStock || '—'} ${i.unit || ''}</td></tr>
        <tr><td>Location</td><td>${i.location || '—'}</td></tr>
        <tr><td>Supplier</td><td>${i.supplier || '—'}</td></tr>
      </table>
      ${i.log ? `<div class="section-head" style="margin-top:1rem">Movement log</div><div class="log-box">${i.log}</div>` : ''}`;
    document.getElementById('inv-detail-overlay').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = i.name;
  },

  closeInvDetail() {
    this._detailInvItem = null;
    document.getElementById('inv-detail-overlay').classList.add('hidden');
    document.getElementById('topbar-title').textContent = 'Inventory';
  },

  showWithdraw(preselectedId = null) {
    // Populate item select
    const sel = document.getElementById('w-item');
    sel.innerHTML = '<option value="">Select item…</option>';
    this._inventory.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = `${i.name} (${i.qty} ${i.unit || 'units'})`;
      opt.dataset.qty = i.qty;
      opt.dataset.min = i.minStock;
      opt.dataset.unit = i.unit || 'units';
      sel.appendChild(opt);
    });
    if (preselectedId) {
      sel.value = preselectedId;
      this.onWithdrawItemChange();
    }
    // Populate work order select
    const woSel = document.getElementById('w-workorder');
    woSel.innerHTML = '<option value="">None</option>';
    this._workOrders.filter(w => w.status !== 'Done').forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.title;
      woSel.appendChild(opt);
    });
    // Pre-fill staff name
    const name = localStorage.getItem('ca_inspector_name');
    if (name) document.getElementById('w-staff').value = name;
    document.getElementById('w-stock-info').classList.add('hidden');
    document.getElementById('withdraw-overlay').classList.remove('hidden');
    document.getElementById('topbar-title').textContent = 'Withdraw parts';
  },

  showWithdrawFor() {
    const i = this._detailInvItem;
    this.closeInvDetail();
    this.showWithdraw(i?.id);
  },

  closeWithdraw() {
    document.getElementById('withdraw-overlay').classList.add('hidden');
    document.getElementById('topbar-title').textContent = 'Inventory';
  },

  onWithdrawItemChange() {
    const sel = document.getElementById('w-item');
    const opt = sel.options[sel.selectedIndex];
    const info = document.getElementById('w-stock-info');
    if (!opt || !opt.value) { info.classList.add('hidden'); return; }
    const qty = parseInt(opt.dataset.qty) || 0;
    const min = parseInt(opt.dataset.min) || 0;
    const unit = opt.dataset.unit || 'units';
    const isLow = min > 0 && qty <= min;
    info.textContent = `Current stock: ${qty} ${unit}${min > 0 ? ` (min: ${min})` : ''}${isLow ? ' — LOW STOCK' : ''}`;
    info.className = `stock-info ${isLow ? 'low' : 'ok'}`;
    info.classList.remove('hidden');
  },

  async submitWithdrawal() {
    const itemId = document.getElementById('w-item').value;
    const qty = parseInt(document.getElementById('w-qty').value) || 0;
    const reason = document.getElementById('w-reason').value;
    const workOrderId = document.getElementById('w-workorder').value;
    const staff = document.getElementById('w-staff').value.trim();

    if (!itemId) { this._wFeedback('Please select an item.', 'error'); return; }
    if (qty < 1) { this._wFeedback('Quantity must be at least 1.', 'error'); return; }

    const item = this._inventory.find(i => i.id === itemId);
    if (item && qty > item.qty) {
      this._wFeedback(`Only ${item.qty} ${item.unit || 'units'} in stock.`, 'error'); return;
    }

    // Optimistic local update
    Store.applyLocalWithdrawal(itemId, qty);
    this._inventory = Store.getInventory();
    this.renderInventory();
    this.renderStats();

    this.showLoading('Logging withdrawal…');
    try {
      await Notion.withdrawInventory(itemId, qty, reason, workOrderId || null, staff);
      this.hideLoading();
      this._wFeedback(`Withdrawal logged — ${qty} ${item?.unit || 'units'} of ${item?.name} taken`, 'success');
      setTimeout(() => this.closeWithdraw(), 1800);
      await this.loadData(true);
    } catch (e) {
      this.hideLoading();
      this.toast('Saved offline — will sync when connected');
      setTimeout(() => this.closeWithdraw(), 1200);
    }
  },

  async showRestockFor() {
    const i = this._detailInvItem;
    if (!i) return;
    const val = prompt(`Restock "${i.name}"\nCurrent stock: ${i.qty} ${i.unit || 'units'}\n\nEnter quantity to add:`);
    if (!val || isNaN(parseInt(val))) return;
    const qty = parseInt(val);
    const staff = localStorage.getItem('ca_inspector_name') || '';
    this.closeInvDetail();
    this.showLoading('Restocking…');
    try {
      Store.applyLocalRestock(i.id, qty);
      this._inventory = Store.getInventory();
      await Notion.restockInventory(i.id, qty, staff);
      this.hideLoading();
      this.toast(`+${qty} ${i.unit || 'units'} added to ${i.name}`);
      await this.loadData(true);
    } catch (e) {
      this.hideLoading();
      this.renderInventory();
      this.toast('Saved offline — will sync when connected');
    }
  },

  _wFeedback(msg, type) {
    const fb = document.getElementById('w-feedback');
    fb.textContent = msg;
    fb.className = `form-feedback ${type}`;
    fb.classList.remove('hidden');
    setTimeout(() => fb.classList.add('hidden'), 4000);
  },

  // ── Navigation ──
  _currentTab: 'dashboard',
  tab(name, el) {
    this._currentTab = name;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${name}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    const titles = { dashboard: 'Dashboard', assets: 'Assets', inspect: 'New inspection', workorders: 'Work orders', inventory: 'Inventory', print: 'Print worksheet' };
    document.getElementById('topbar-title').textContent = titles[name] || '';
    if (name === 'queue') this.renderQueue();
    if (name === 'inventory') this.renderInventory();
    if (name === 'print') this.renderPrint();
  },

  // ── Screens ──
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${id}`).classList.add('active');
  },

  // ── Loading ──
  showLoading(msg = 'Loading…') {
    document.getElementById('loading-msg').textContent = msg;
    document.getElementById('loading').classList.remove('hidden');
  },
  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  },

  // ── Toast ──
  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    el.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  },
};

// Start
window.addEventListener('DOMContentLoaded', () => App.init());

// Auto-sync queue when coming back online
window.addEventListener('online', () => {
  const q = Store.getQueue();
  if (q.length) App.syncQueue();
});
