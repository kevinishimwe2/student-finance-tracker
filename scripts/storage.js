const KEY = 'sft:transactions';
const SETTINGS_KEY = 'sft:settings';

export const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const save = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const validateImport = (raw) => {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  if (!Array.isArray(parsed)) throw new Error('JSON must be an array of transactions.');

  const required = ['id', 'description', 'amount', 'category', 'date'];
  for (const item of parsed) {
    for (const field of required) {
      if (!(field in item)) throw new Error(`Record missing field: "${field}"`);
    }
    if (typeof item.amount !== 'number') throw new Error('Field "amount" must be a number.');
  }

  return parsed;
};
