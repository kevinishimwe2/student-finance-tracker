// 1. Description: no leading/trailing spaces, no double spaces
const RE_DESCRIPTION = /^\S(?:.*\S)?$/;

// 2. Amount: positive number, max 2 decimal places
const RE_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// 3. Date: YYYY-MM-DD with basic range checks
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// 4. Category / tag: letters, spaces, hyphens
const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// 5. ADVANCED — lookahead: amount must not be zero
const RE_AMOUNT_NONZERO = /^(?!0+(\.0+)?$)(0|[1-9]\d*)(\.\d{1,2})?$/;

// 6. ADVANCED — back-reference: detect duplicate consecutive words
const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

export const validateDescription = (val) => {
  if (!val || val.trim() === '') return 'Description is required.';
  if (!RE_DESCRIPTION.test(val)) return 'No leading/trailing spaces allowed.';
  if (RE_DUPLICATE_WORD.test(val)) return 'Duplicate consecutive words detected.';
  return null;
};

export const validateAmount = (val) => {
  if (val === '' || val === null || val === undefined) return 'Amount is required.';
  const str = String(val).trim();
  if (!RE_AMOUNT.test(str)) return 'Enter a valid amount (e.g. 12 or 12.50).';
  if (!RE_AMOUNT_NONZERO.test(str)) return 'Amount must be greater than zero.';
  return null;
};

export const validateDate = (val) => {
  if (!val) return 'Date is required.';
  if (!RE_DATE.test(val)) return 'Use YYYY-MM-DD format.';
  return null;
};

export const validateCategory = (val) => {
  if (!val) return 'Category is required.';
  if (!RE_CATEGORY.test(val)) return 'Category must contain only letters, spaces, or hyphens.';
  return null;
};

// Safe regex compiler for search
export const compileRegex = (input, flags = 'i') => {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
};

const escapeHtml = (str) =>
  String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export const highlight = (text, re) => {
  if (!re) return escapeHtml(text);
  return escapeHtml(text).replace(re, (m) => `<mark>${m}</mark>`);
};
