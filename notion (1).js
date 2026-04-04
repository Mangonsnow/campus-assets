// notion.js — Notion API via corsproxy.io
const Notion = {
  _token: null,
  _assetsDb: null,
  _inspectionsDb: null,
  _workOrdersDb: null,
  _inventoryDb: null,
  _movementsDb: null,

  init(token, assetsDb, inspectionsDb, workOrdersDb, inventoryDb, movementsDb) {
    this._token = token;
    this._assetsDb = assetsDb;
    this._inspectionsDb = inspectionsDb;
    this._workOrdersDb = workOrdersDb || null;
    this._inventoryDb = inventoryDb || null;
    this._movementsDb = movementsDb || null;
  },

  async _call(path, method, body) {
    const res = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        method: method || 'GET',
        token: this._token,
        body: body || null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('401');
      if (res.status === 404) throw new Error('404');
      throw new Error(err.error || 'HTTP ' + res.status);
    }
    return res.json();
  },

  async _get(path) { return this._call(path, 'GET'); },
  async _post(path, body) { return this._call(path, 'POST', body); },
  async _patch(path, body) { return this._call(path, 'PATCH', body); },

  async queryAll(dbId, filter, sorts) {
    let results = [], cursor;
    do {
      const body = { page_size: 100 };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;
      if (cursor) body.start_cursor = cursor;
      const data = await this._post('/databases/' + dbId + '/query', body);
      results = results.concat(data.results || []);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    return results;
  },

  async getAssets() {
    const rows = await this.queryAll(this._assetsDb, null, [
      { property: 'Building', direction: 'ascending' },
      { property: 'Name', direction: 'ascending' },
    ]);
    return rows.map(r => this._parseAsset(r));
  },

  async getRecentInspections(limit) {
    const rows = await this.queryAll(this._inspectionsDb, null, [
      { property: 'Date', direction: 'descending' },
    ]);
    return rows.slice(0, limit || 20).map(r => this._parseInspection(r));
  },

  async createInspection(data) {
    const statusMap = { Good: 'OK', Monitor: 'Monitor', Urgent: 'Urgent' };
    const props = {
      Name: { title: [{ text: { content: data.assetName + ' — ' + data.date } }] },
      Inspector: { rich_text: [{ text: { content: data.inspector || '' } }] },
      Date: { date: { start: data.date } },
      Condition: { select: { name: data.condition } },
      Checklist: { rich_text: [{ text: { content: data.checklist } }] },
      Notes: { rich_text: [{ text: { content: data.notes || '' } }] },
    };
    if (data.assetId) props.Asset = { relation: [{ id: data.assetId }] };
    await this._post('/pages', { parent: { database_id: this._inspectionsDb }, properties: props });
    if (data.assetId) {
      const ap = {
        Status: { select: { name: statusMap[data.condition] || 'OK' } },
        'Last inspected': { date: { start: data.date } },
      };
      if (data.nextDue) ap['Next due'] = { date: { start: data.nextDue } };
      await this._patch('/pages/' + data.assetId, { properties: ap });
    }
  },

  async getWorkOrders() {
    if (!this._workOrdersDb) return [];
    const rows = await this.queryAll(this._workOrdersDb, null, [
      { property: 'Created', direction: 'descending' },
    ]);
    return rows.map(r => this._parseWorkOrder(r));
  },

  async createWorkOrder(data) {
    if (!this._workOrdersDb) throw new Error('Work orders DB not configured');
    const props = {
      Name: { title: [{ text: { content: data.title } }] },
      Priority: { select: { name: data.priority } },
      Status: { select: { name: 'Open' } },
      Description: { rich_text: [{ text: { content: data.description || '' } }] },
      'Reported by': { rich_text: [{ text: { content: data.reportedBy || '' } }] },
      'Handler type': { select: { name: data.handlerType || 'Internal' } },
      Created: { date: { start: data.date } },
    };
    if (data.assetId) props.Asset = { relation: [{ id: data.assetId }] };
    if (data.assignedTo) props['Assigned to'] = { rich_text: [{ text: { content: data.assignedTo } }] };
    return this._post('/pages', { parent: { database_id: this._workOrdersDb }, properties: props });
  },

  async updateWorkOrderStatus(pageId, status, extra) {
    extra = extra || {};
    const props = { Status: { select: { name: status } } };
    if (extra.estimate) props['Estimate'] = { rich_text: [{ text: { content: extra.estimate } }] };
    if (extra.assignedTo) props['Assigned to'] = { rich_text: [{ text: { content: extra.assignedTo } }] };
    if (extra.completedDate) props['Completed'] = { date: { start: extra.completedDate } };
    return this._patch('/pages/' + pageId, { properties: props });
  },

  async getInventory() {
    if (!this._inventoryDb) return [];
    const rows = await this.queryAll(this._inventoryDb, null, [
      { property: 'Category', direction: 'ascending' },
      { property: 'Name', direction: 'ascending' },
    ]);
    return rows.map(r => this._parseInventoryItem(r));
  },

  async updateStock(pageId, newQty, lastRestocked) {
    const props = { 'Quantity in stock': { number: newQty } };
    if (lastRestocked) props['Last restocked'] = { date: { start: lastRestocked } };
    return this._patch('/pages/' + pageId, { properties: props });
  },

  async withdrawInventory(itemId, qty, reason, workOrderId, takenBy) {
    const today = new Date().toISOString().split('T')[0];
    if (this._movementsDb) {
      const mp = {
        Name: { title: [{ text: { content: 'Withdrawal — ' + today } }] },
        Quantity: { number: qty },
        'Movement type': { select: { name: 'Withdrawal' } },
        'Taken by': { rich_text: [{ text: { content: takenBy || '' } }] },
        Date: { date: { start: today } },
        Notes: { rich_text: [{ text: { content: reason || '' } }] },
      };
      if (itemId) mp.Item = { relation: [{ id: itemId }] };
      if (workOrderId) mp['Work order'] = { relation: [{ id: workOrderId }] };
      await this._post('/pages', { parent: { database_id: this._movementsDb }, properties: mp });
    }
    const page = await this._get('/pages/' + itemId);
    const cur = (page.properties['Quantity in stock'] || {}).number || 0;
    return this.updateStock(itemId, Math.max(0, cur - qty));
  },

  async restockInventory(itemId, qty, staffName) {
    const today = new Date().toISOString().split('T')[0];
    if (this._movementsDb) {
      const mp = {
        Name: { title: [{ text: { content: 'Restock — ' + today } }] },
        Quantity: { number: qty },
        'Movement type': { select: { name: 'Restock' } },
        'Taken by': { rich_text: [{ text: { content: staffName || '' } }] },
        Date: { date: { start: today } },
      };
      if (itemId) mp.Item = { relation: [{ id: itemId }] };
      await this._post('/pages', { parent: { database_id: this._movementsDb }, properties: mp });
    }
    const page = await this._get('/pages/' + itemId);
    const cur = (page.properties['Quantity in stock'] || {}).number || 0;
    return this.updateStock(itemId, cur + qty, today);
  },

  async testConnection() {
    await this._post('/databases/' + this._assetsDb + '/query', { page_size: 1 });
    await this._post('/databases/' + this._inspectionsDb + '/query', { page_size: 1 });
    return true;
  },

  _g(p, key, type) {
    const prop = p[key];
    if (!prop) return type === 'number' ? 0 : '';
    if (type === 'title') return (prop.title && prop.title[0] && prop.title[0].plain_text) || '';
    if (type === 'select') return (prop.select && prop.select.name) || '';
    if (type === 'number') return prop.number != null ? prop.number : 0;
    if (type === 'date') return (prop.date && prop.date.start) || '';
    if (type === 'text') return (prop.rich_text && prop.rich_text[0] && prop.rich_text[0].plain_text) || '';
    return '';
  },

  _parseAsset(row) {
    const g = (k, t) => this._g(row.properties, k, t);
    return {
      id: row.id,
      name: g('Name', 'title'),
      building: g('Building', 'select'),
      category: g('Category', 'select'),
      status: g('Status', 'select') || 'OK',
      frequency: g('Frequency', 'select') || '',
      lastInspected: g('Last inspected', 'date'),
      nextDue: g('Next due', 'date'),
      notes: g('Notes', 'text'),
    };
  },

  _parseInspection(row) {
    const g = (k, t) => this._g(row.properties, k, t);
    return {
      id: row.id,
      name: g('Name', 'title'),
      date: g('Date', 'date'),
      condition: g('Condition', 'select'),
      inspector: g('Inspector', 'text'),
      notes: g('Notes', 'text'),
    };
  },

  _parseWorkOrder(row) {
    const g = (k, t) => this._g(row.properties, k, t);
    const p = row.properties;
    return {
      id: row.id,
      title: g('Name', 'title'),
      priority: g('Priority', 'select'),
      status: g('Status', 'select'),
      description: g('Description', 'text'),
      reportedBy: g('Reported by', 'text'),
      handlerType: g('Handler type', 'select'),
      assignedTo: g('Assigned to', 'text'),
      estimate: g('Estimate', 'text'),
      created: g('Created', 'date'),
      completed: g('Completed', 'date'),
      assetId: (p.Asset && p.Asset.relation && p.Asset.relation[0] && p.Asset.relation[0].id) || '',
    };
  },

  _parseInventoryItem(row) {
    const g = (k, t) => this._g(row.properties, k, t);
    const qty = g('Quantity in stock', 'number');
    const min = g('Minimum stock', 'number');
    return {
      id: row.id,
      name: g('Name', 'title'),
      category: g('Category', 'select'),
      qty, minStock: min,
      unit: g('Unit', 'select') || 'each',
      location: g('Location', 'select'),
      lastRestocked: g('Last restocked', 'date'),
      notes: g('Notes', 'text'),
      lowStock: min > 0 && qty <= min,
    };
  },
};
