// store.js — local persistence & offline queue

const Store = {
  KEYS: {
    config: 'ca_config',
    assets: 'ca_assets',
    inspections: 'ca_inspections',
    workOrders: 'ca_work_orders',
    inventory: 'ca_inventory',
    queue: 'ca_queue',
    woQueue: 'ca_wo_queue',
    stockQueue: 'ca_stock_queue',
    lastSync: 'ca_last_sync',
  },

  // ── Config ──
  getConfig() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.config)) || null; }
    catch { return null; }
  },
  saveConfig(cfg) {
    localStorage.setItem(this.KEYS.config, JSON.stringify(cfg));
  },
  clearConfig() {
    localStorage.removeItem(this.KEYS.config);
  },

  // ── Assets cache ──
  getAssets() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.assets)) || []; }
    catch { return []; }
  },
  saveAssets(assets) {
    localStorage.setItem(this.KEYS.assets, JSON.stringify(assets));
    localStorage.setItem(this.KEYS.lastSync, new Date().toISOString());
  },

  // ── Recent inspections cache ──
  getInspections() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.inspections)) || []; }
    catch { return []; }
  },
  saveInspections(list) {
    localStorage.setItem(this.KEYS.inspections, JSON.stringify(list));
  },

  // ── Work orders cache ──
  getWorkOrders() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.workOrders)) || []; }
    catch { return []; }
  },
  saveWorkOrders(list) {
    localStorage.setItem(this.KEYS.workOrders, JSON.stringify(list));
  },


  // ── Meter readings ──
  getMeterReadings() {
    try { return JSON.parse(localStorage.getItem('ca_meter_readings')) || []; }
    catch { return []; }
  },
  addMeterReading(entry) {
    const readings = this.getMeterReadings();
    readings.push({ ...entry, _savedAt: new Date().toISOString() });
    localStorage.setItem('ca_meter_readings', JSON.stringify(readings));
  },

  // ── Inventory cache ──
  getInventory() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.inventory)) || []; }
    catch { return []; }
  },
  saveInventory(list) {
    localStorage.setItem(this.KEYS.inventory, JSON.stringify(list));
  },
  // Apply withdrawal locally (optimistic)
  applyLocalWithdrawal(itemId, qty) {
    const inv = this.getInventory();
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      inv[idx].quantity = Math.max(0, inv[idx].quantity - qty);
      this.saveInventory(inv);
    }
  },
  applyLocalRestock(itemId, qty) {
    const inv = this.getInventory();
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      inv[idx].quantity = inv[idx].quantity + qty;
      this.saveInventory(inv);
    }
  },

  // ── Work order offline queue ──
  getWOQueue() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.woQueue)) || []; }
    catch { return []; }
  },
  addToWOQueue(item) {
    const q = this.getWOQueue();
    const entry = { ...item, _queueId: Date.now(), _queuedAt: new Date().toISOString() };
    q.push(entry);
    localStorage.setItem(this.KEYS.woQueue, JSON.stringify(q));
    return entry;
  },
  removeFromWOQueue(queueId) {
    const q = this.getWOQueue().filter(i => i._queueId !== queueId);
    localStorage.setItem(this.KEYS.woQueue, JSON.stringify(q));
  },

  // ── Apply work order locally ──
  applyLocalWorkOrder(data) {
    const orders = this.getWorkOrders();
    orders.unshift({
      id: `local_${Date.now()}`,
      title: data.title,
      priority: data.priority,
      status: 'Open',
      description: data.description,
      reportedBy: data.reportedBy,
      handlerType: data.handlerType,
      assignedTo: data.assignedTo,
      created: data.date,
      completed: '',
      estimate: '',
    });
    this.saveWorkOrders(orders);
  },

  // ── Offline queue ──
  getQueue() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.queue)) || []; }
    catch { return []; }
  },
  addToQueue(item) {
    const q = this.getQueue();
    const entry = { ...item, _queueId: Date.now(), _queuedAt: new Date().toISOString() };
    q.push(entry);
    localStorage.setItem(this.KEYS.queue, JSON.stringify(q));
    return entry;
  },
  removeFromQueue(queueId) {
    const q = this.getQueue().filter(i => i._queueId !== queueId);
    localStorage.setItem(this.KEYS.queue, JSON.stringify(q));
  },
  clearQueue() {
    localStorage.removeItem(this.KEYS.queue);
  },

  // ── Last sync time ──
  getLastSync() {
    return localStorage.getItem(this.KEYS.lastSync) || null;
  },

  // ── Apply queued inspection locally (optimistic update) ──
  applyLocalInspection(data) {
    const assets = this.getAssets();
    const idx = assets.findIndex(a => a.id === data.assetId);
    if (idx >= 0) {
      const statusMap = { Good: 'OK', Monitor: 'Monitor', Urgent: 'Urgent' };
      assets[idx].status = statusMap[data.condition] || 'OK';
      assets[idx].lastInspected = data.date;
      if (data.nextDue) assets[idx].nextDue = data.nextDue;
      this.saveAssets(assets);
    }
    const inspections = this.getInspections();
    inspections.unshift({
      id: `local_${Date.now()}`,
      name: `${data.assetName} — ${data.date}`,
      date: data.date,
      condition: data.condition,
      inspector: data.inspector,
      notes: data.notes,
    });
    this.saveInspections(inspections.slice(0, 20));
  },

  // ── Inventory cache ──
  getInventory() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.inventory)) || []; }
    catch { return []; }
  },
  saveInventory(list) {
    localStorage.setItem(this.KEYS.inventory, JSON.stringify(list));
  },

  // Apply stock withdrawal locally
  applyLocalWithdrawal(itemId, qty) {
    const inv = this.getInventory();
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      inv[idx].qty = Math.max(0, inv[idx].qty - qty);
      inv[idx].lowStock = inv[idx].minStock > 0 && inv[idx].qty <= inv[idx].minStock;
      this.saveInventory(inv);
    }
  },

  // Apply restock locally
  applyLocalRestock(itemId, qty) {
    const inv = this.getInventory();
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx >= 0) {
      inv[idx].qty = inv[idx].qty + qty;
      inv[idx].lowStock = inv[idx].minStock > 0 && inv[idx].qty <= inv[idx].minStock;
      this.saveInventory(inv);
    }
  },

  // ── Stock movement offline queue ──
  getStockQueue() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.stockQueue)) || []; }
    catch { return []; }
  },
  addToStockQueue(item) {
    const q = this.getStockQueue();
    const entry = { ...item, _queueId: Date.now(), _queuedAt: new Date().toISOString() };
    q.push(entry);
    localStorage.setItem(this.KEYS.stockQueue, JSON.stringify(q));
    return entry;
  },
  removeFromStockQueue(queueId) {
    const q = this.getStockQueue().filter(i => i._queueId !== queueId);
    localStorage.setItem(this.KEYS.stockQueue, JSON.stringify(q));
  },
};
