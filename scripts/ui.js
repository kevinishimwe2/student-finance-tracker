import { highlight } from './validators.js';
import { getSettings } from './state.js';

const CATEGORY_BADGES = {
  Food: 'badge-food',
  Books: 'badge-books',
  Transport: 'badge-transport',
  Entertainment: 'badge-entertainment',
  Other: 'badge-other',
};

export const getCurrencySymbol = () => {
  const { currency } = getSettings();
  return currency === 'RWF' ? 'RWF ' : currency === 'EUR' ? '€' : '$';
};

// Converts a raw (USD-denominated) amount into the currently selected
// display currency, using the manual rates from Settings.
export const convertAmount = (amount) => {
  const { currency, rateRWF, rateEUR } = getSettings();
  if (currency === 'RWF') return amount * (rateRWF || 1380);
  if (currency === 'EUR') return amount * (rateEUR || 0.92);
  return amount;
};

export const formatAmount = (amount) => `${getCurrencySymbol()}${convertAmount(amount).toFixed(2)}`;

const formatTimestamp = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleString('en', { dateStyle: 'short', timeStyle: 'short' });
};

export const renderTable = (records, regex, onEdit, onDelete) => {
  const tbody = document.getElementById('transaction-list');

  if (!records.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">No transactions yet. Add one below.</td></tr>`;
    return;
  }

  tbody.innerHTML = records.map((r) => {
    const descHtml = highlight(r.description, regex);
    const idHtml = highlight(r.id, regex);
    const badgeClass = CATEGORY_BADGES[r.category] || 'badge-other';

    return `
      <tr>
        <td>${idHtml}</td>
        <td>${descHtml}</td>
        <td class="amount-cell">${formatAmount(r.amount)}</td>
        <td><span class="badge ${badgeClass}">${r.category}</span></td>
        <td>${r.date}</td>
        <td>${formatTimestamp(r.createdAt)}</td>
        <td>${formatTimestamp(r.updatedAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn-edit" data-id="${r.id}" type="button" aria-label="Edit ${r.description}">Edit</button>
            <button class="btn-delete" data-id="${r.id}" type="button" aria-label="Delete ${r.description}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => onEdit(btn.dataset.id));
  });

  tbody.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rec = records.find((r) => r.id === btn.dataset.id);
      if (confirm(`Delete "${rec?.description}"?`)) onDelete(btn.dataset.id);
    });
  });
};

export const renderDashboard = (records) => {
  const { cap } = getSettings();
  const symbol = getCurrencySymbol();

  // Sum raw amounts first, THEN convert the total once — converting each
  // amount individually and summing would also work, but summing raw
  // values first avoids compounding rounding error across many rows.
  const rawTotal = records.reduce((s, r) => s + r.amount, 0);
  const displayTotal = convertAmount(rawTotal);

  document.getElementById('tot-records').textContent = records.length;
  document.getElementById('tot-amount').textContent = `${symbol}${displayTotal.toFixed(2)}`;

  const catCounts = {};
  records.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('category').textContent = topCat ? topCat[0] : 'None';

  const msgEl = document.getElementById('budget-message');

  if (cap) {
    // `cap` is entered by the user in whatever currency is currently
    // selected, so compare it against the converted (displayTotal),
    // not the raw USD total.
    const remaining = parseFloat(cap) - displayTotal;
    if (remaining >= 0) {
      msgEl.textContent = `${symbol}${remaining.toFixed(2)} remaining of your ${symbol}${parseFloat(cap).toFixed(2)} budget.`;
      msgEl.className = 'under';
      msgEl.setAttribute('aria-live', 'polite');
    } else {
      msgEl.textContent = `Budget exceeded by ${symbol}${Math.abs(remaining).toFixed(2)}!`;
      msgEl.className = 'over';
      msgEl.setAttribute('aria-live', 'assertive');
    }
  } else {
    msgEl.textContent = '';
    msgEl.className = '';
  }

  renderChart(records);
};

export const renderChart = (records) => {
  const chartEl = document.getElementById('chart');
  if (!chartEl) return;

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dayTotals = days.map((day) =>
    records.filter((r) => r.date === day).reduce((s, r) => s + convertAmount(r.amount), 0)
  );

  const max = Math.max(...dayTotals, 0.01);

  const labels = days.map((d) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en', { weekday: 'short' });
  });

  chartEl.innerHTML = days.map((_, i) => {
    const pct = (dayTotals[i] / max) * 90;
    const isEmpty = dayTotals[i] === 0;
    return `
      <div class="bar-wrap">
        <div class="bar ${isEmpty ? 'empty' : ''}"
             style="height: ${Math.max(pct, 2)}%"
             title="${labels[i]}: ${getCurrencySymbol()}${dayTotals[i].toFixed(2)}">
        </div>
        <span class="bar-label">${labels[i]}</span>
      </div>`;
  }).join('');
};

export const showFormMsg = (msg, type = 'success') => {
  const el = document.getElementById('form-message');
  el.textContent = msg;
  el.className = type;
  setTimeout(() => { el.textContent = ''; el.className = ''; }, 3500);
};
