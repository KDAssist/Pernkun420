const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
});

// ── STATE ──
let currentTab = 'indoor';
let searchQuery = '';
let filterMode = 'all'; // all | low | out

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  updateStats();
  renderAll();
  setupEvents();
});

function updateDate() {
  const now = new Date();
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('dateDisplay').textContent =
    now.toLocaleDateString('th-TH', opts);
}

// ── STATS ──
function updateStats() {
  const all = getAllItems();
  const outItems = all.filter(i => i.rem <= 0);
  const lowItems = all.filter(i => i.rem > 0 && i.rem < 10);
  const okItems  = all.filter(i => i.rem >= 10);

  document.getElementById('statTotal').textContent = all.length;
  document.getElementById('statOk').textContent    = okItems.length;
  document.getElementById('statLow').textContent   = lowItems.length;
  document.getElementById('statOut').textContent   = outItems.length;
}

function getAllItems() {
  return [
    ...STOCK_DATA.indoor,
    ...STOCK_DATA.outdoor,
    ...STOCK_DATA.trim,
    ...STOCK_DATA.accessories,
  ];
}

// ── EVENTS ──
function setupEvents() {
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    renderAll();
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('sec-' + currentTab).classList.add('active');
      renderAll();
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterMode = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAll();
    });
  });
}

// ── RENDER ──
function renderAll() {
  renderGram('indoor',      STOCK_DATA.indoor,       'indoorBody');
  renderGram('outdoor',     STOCK_DATA.outdoor,      'outdoorBody');
  renderGram('trim',        STOCK_DATA.trim,         'trimBody');
  renderAcc('accessories',  STOCK_DATA.accessories,  'accBody');
  updateTabCounts();
}

function applyFilters(data) {
  let d = [...data];
  if (searchQuery) {
    d = d.filter(i => i.name.toLowerCase().includes(searchQuery));
  }
  if (filterMode === 'low') d = d.filter(i => i.rem > 0 && i.rem < 10);
  if (filterMode === 'out') d = d.filter(i => i.rem <= 0);
  d.sort((a, b) => b.rem - a.rem);
  return d;
}

function badge(rem) {
  if (rem <= 0)  return '<span class="badge out">หมด</span>';
  if (rem < 5)   return '<span class="badge low">เหลือน้อย</span>';
  if (rem < 10)  return '<span class="badge low">เหลือน้อย</span>';
  return             '<span class="badge ok">ปกติ</span>';
}

function fmtNum(val) {
  const n = parseFloat(val);
  const cls = n < 0 ? 'neg' : 'pos';
  const display = Number.isInteger(n) ? n : n;
  return `<span class="${cls}">${display}</span>`;
}

function renderGram(tab, data, bodyId) {
  const tbody = document.getElementById(bodyId);
  if (!tbody) return;
  const filtered = applyFilters(data);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty">
        <div class="empty-icon">🌿</div>
        <div class="empty-text">ไม่พบสินค้า</div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td class="name-cell">${r.name}</td>
      <td class="r">${r.start}</td>
      <td class="r">${r.out}</td>
      <td class="r">${fmtNum(r.rem)}</td>
      <td class="r">${r.price}</td>
      <td><span class="pack-tag">${r.pack}</span></td>
      <td>${badge(r.rem)}</td>
    </tr>
  `).join('');
}

function renderAcc(tab, data, bodyId) {
  const tbody = document.getElementById(bodyId);
  if (!tbody) return;
  const filtered = applyFilters(data);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty">
        <div class="empty-icon">📦</div>
        <div class="empty-text">ไม่พบสินค้า</div>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td class="name-cell">${r.name}</td>
      <td class="r">${r.start}</td>
      <td class="r">${r.out}</td>
      <td class="r">${fmtNum(r.rem)}</td>
      <td>${r.note || '-'}</td>
      <td>${badge(r.rem)}</td>
    </tr>
  `).join('');
}

function updateTabCounts() {
  const tabs = ['indoor','outdoor','trim','accessories'];
  tabs.forEach(tab => {
    const data = STOCK_DATA[tab];
    const count = applyFilters(data).length;
    const el = document.getElementById('count-' + tab);
    if (el) el.textContent = count;
  });
}

