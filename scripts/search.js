import { compileRegex } from './validators.js';

export const searchRecords = (records, pattern, caseSensitive = false) => {
  if (!pattern) return { results: records, regex: null, error: null };

  const flags = caseSensitive ? '' : 'i';
  const regex = compileRegex(pattern, flags);

  if (!regex) {
    return { results: [], regex: null, error: `Invalid regex: "${pattern}"` };
  }

  const results = records.filter(
    (r) => regex.test(r.description) || regex.test(r.category) || regex.test(String(r.amount))
  );

  return { results, regex, error: null };
};
