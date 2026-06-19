import { getRecords, addRecord, updateRecord, deleteRecord, setRecords, generateId, idExists, getSettings, updateSettings } from './state.js';
import { validateDescription, validateAmount, validateDate } from './validators.js';
import { searchRecords } from './search.js';
import { renderTable, renderDashboard, showFormMsg } from './ui.js';
import { exportJSON, validateImport } from './storage.js';

// ── Element refs ─────────────────────────────────────────
const form = document.getElementById('expense-form');
const idInput = document.getElementById('id_nbr');
const descInput = document.getElementById('descript');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('expense-category');
const searchInput = document.getElementById('search');
const caseToggle = document.getElementById('case-toggle');
const settingsBtn = document.getElementById('save-settings');
const currencySelect = document.getElementById('currency');
const capInput = document.getElementById('cap');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const sortButtons = document.querySelectorAll('.sort-btn');

// ── Local state ─────────────────────────────────────────
let searchPattern = '';
let caseSensitive = false;
let editingId = null;
let sortField = 'date';
let sortDir = -1; // newest first by default

// ── Render ──────────────────────────────────────────────
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

// ── Add / Edit submit ───────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const typedId = idInput.value.trim();
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
    // Use the typed ID if given and not already taken; otherwise auto-generate.
    let id = typedId || generateId();
    if (typedId && idExists(typedId)) {
      idInput.classList.add('error');
      showFormMsg(`ID "${typedId}" is already in use. Choose another or leave blank.`, 'error');
      return;
    }
    idInput.classList.remove('error');

    addRecord({
      id,
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
  idInput.value = record.id;
  idInput.disabled = true; // IDs aren't editable once a record exists
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

// Re-enable the ID field after a reset (covers both normal save and edit-cancel-by-reload cases)
form.addEventListener('reset', () => {
  idInput.disabled = false;
});

// ── Search ──────────────────────────────────────────────
searchInput.addEventListener('input', (e) => {
  searchPattern = e.target.value.trim();
  refresh();
});

caseToggle.addEventListener('change', (e) => {
  caseSensitive = e.target.checked;
  refresh();
});

// ── Sort ────────────────────────────────────────────────
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

// ── Export / Import ─────────────────────────────────────
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

// ── Settings ────────────────────────────────────────────
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

// ── Init ────────────────────────────────────────────────
loadSettingsUI();
refresh();
