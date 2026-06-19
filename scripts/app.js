
import { getRecords, addRecord, updateRecord, deleteRecord, setRecords, generateId, getSettings, updateSettings } from './state.js';
import { validateDescription, validateAmount, validateDate } from './validators.js';
import { searchRecords } from './search.js';
import { renderTable, renderDashboard, showFormMsg } from './ui.js';
import { exportJSON, validateImport } from './storage.js';

// ── Step 1.Element refs (matching the corrected IDs) ──────────
const form = document.getElementById('expense-form');
const descInput = document.getElementById('descript');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('expense-category'); // no more collision
const searchInput = document.getElementById('search');
const caseToggle = document.getElementById('case-toggle');
const settingsBtn = document.getElementById('save-settings');
const currencySelect = document.getElementById('currency');
const capInput = document.getElementById('cap');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const sortButtons = document.querySelectorAll('.sort-btn');

// ──Step 2. Local state ─────────────────────────────────────────
let searchPattern = '';
let caseSensitive = false;
let editingId = null;
let sortField = 'date';
let sortDir = -1; // newest first by default

// ──Step 3. Render ──────────────────────────────────────────────
const refresh = () => {
  let all = getRecords();

  all.sort((a, b) => {
    let av = a[sortField];
    let bv = b[sortField];
    if (sortField === 'amount') { av = Number(av); bv = Number(bv); }
    if (av < bv) return -sortDir;
    if (av > bv) return sortDir;
    return 0;
  });

  const { results, regex, error } = searchRecords(all, searchPattern, caseSensitive);

  if (error) {
    showFormMsg(error, 'error');
  }

  renderTable(results, regex, handleEdit, handleDelete);
  renderDashboard(getRecords());
};

// ──4. Add / Edit submit ───────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const desc = descInput.value;
  const amount = amountInput.value;
  const date = dateInput.value;
  const category = categorySelect.value;

  const descErr   = validateDescription(desc);
  const amountErr = validateAmount(amount);
  const dateErr   = validateDate(date);

  descInput.classList.toggle('error', !!descErr);
  amountInput.classList.toggle('error', !!amountErr);
  dateInput.classList.toggle('error', !!dateErr);

  if (descErr || amountErr || dateErr) {
    showFormMsg(descErr || amountErr || dateErr, 'error');
    return;
  }

  const now = new Date().toISOString();

  if (editingId) {
    updateRecord(editingId, { description: desc, amount: parseFloat(amount), category, date });
    showFormMsg('Transaction updated.', 'success');
    editingId = null;
    form.querySelector('button[type="submit"]').textContent = 'Save';
  } else {
    addRecord({
      id: generateId(),
      description: desc,
      amount: parseFloat(amount),
      category,
      date,
      createdAt: now,
      updatedAt: now,
    });
    showFormMsg('Expense saved.', 'success');
  }

  form.reset();
  refresh();
});

const handleEdit = (id) => {
  const record = getRecords().find((r) => r.id === id);
  if (!record) return;

  editingId = id;
  descInput.value = record.description;
  amountInput.value = record.amount;
  categorySelect.value = record.category;
  dateInput.value = record.date;

  form.querySelector('button[type="submit"]').textContent = 'Update';
  document.getElementById('add').scrollIntoView({ behavior: 'smooth' });
  descInput.focus();
};

const handleDelete = (id) => {
  deleteRecord(id);
  showFormMsg('Transaction deleted.', 'error');
  refresh();
};

// ── 5.Search ──────────────────────────────────────────────
searchInput.addEventListener('input', (e) => {
  searchPattern = e.target.value.trim();
  refresh();
});

caseToggle.addEventListener('change', (e) => {
  caseSensitive = e.target.checked;
  refresh();
});

// ── 6.Sort ────────────────────────────────────────────────
sortButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const field = btn.dataset.sort;
    if (sortField === field) {
      sortDir *= -1;
    } else {
      sortField = field;
      sortDir = 1;
    }
    sortButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    refresh();
  });
});

// ── 7.Export / Import ─────────────────────────────────────
exportBtn.addEventListener('click', () => {
  exportJSON(getRecords());
});

importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const raw = await file.text();
    const records = validateImport(raw);
    setRecords(records);
    refresh();
    showFormMsg(`Imported ${records.length} records.`, 'success');
  } catch (err) {
    showFormMsg(`Import failed: ${err.message}`, 'error');
  }
  e.target.value = '';
});

// ──8. Settings ────────────────────────────────────────────
const loadSettingsUI = () => {
  const s = getSettings();
  currencySelect.value = s.currency || 'USD';
  capInput.value = s.cap || '';
};

settingsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const cap = capInput.value;
  updateSettings({
    currency: currencySelect.value,
    cap: cap ? parseFloat(cap) : null,
  });
  showFormMsg('Settings saved.', 'success');
  refresh();
});

// ── 9.Init ────────────────────────────────────────────────
loadSettingsUI();
refresh();
