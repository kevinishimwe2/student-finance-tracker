import { load, save, loadSettings, saveSettings } from './storage.js';

let _records = load();
let _settings = {
  currency: 'USD',
  cap: null,
  rateRWF: 1380,
  rateEUR: 0.92,
  ...loadSettings(),
};

export const getRecords = () => [..._records];

export const addRecord = (record) => {
  _records.push(record);
  save(_records);
};

export const updateRecord = (id, updates) => {
  const idx = _records.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  _records[idx] = { ..._records[idx], ...updates, updatedAt: new Date().toISOString() };
  save(_records);
  return true;
};

export const deleteRecord = (id) => {
  _records = _records.filter((r) => r.id !== id);
  save(_records);
};

export const setRecords = (records) => {
  _records = records;
  save(_records);
};

export const getSettings = () => ({ ..._settings });

export const updateSettings = (updates) => {
  _settings = { ..._settings, ...updates };
  saveSettings(_settings);
};

export const generateId = () => `txn_${Date.now()}`;
