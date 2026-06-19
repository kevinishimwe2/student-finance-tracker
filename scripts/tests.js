// Import your application validation modules directly
import {
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    compileRegex
} from './scripts/validators.js';

import { searchRecords } from './scripts/search.js';

// ── Tiny Assertion Framework ─────────────────────────────
const suites = [];
let currentSuite = null;

function describe(name, fn) {
    currentSuite = { name, tests: [] };
    suites.push(currentSuite);
    fn();
}

function it(name, assertFn) {
    try {
        assertFn();
        currentSuite.tests.push({ name, passed: true });
    } catch (err) {
        currentSuite.tests.push({ name, passed: false, error: err.message });
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'} (Expected: "${expected}", Got: "${actual}")`);
    }
}

function assertNotNull(value, message = '') {
    if (value === null || value === undefined) {
        throw new Error(`${message || 'Assertion failed'} (Value is null/undefined)`);
    }
}

function assertNull(value, message = '') {
    if (value !== null && value !== undefined) {
        throw new Error(`${message || 'Assertion failed'} (Expected null, Got: ${JSON.stringify(value)})`);
    }
}

// ── Run Tests ─────────────────────────────────────────────

// 1. Description Validation Suite
describe('validateDescription() Regex Tests', () => {
    it('should accept a clean description', () => {
        assertNull(validateDescription('Lunch at cafeteria'));
    });

    it('should fail on empty strings', () => {
        assertEqual(validateDescription(''), 'Description is required.');
    });

    it('should fail on leading spaces', () => {
        assertEqual(validateDescription('   Lunch'), 'No leading/trailing spaces allowed.');
    });

    it('should fail on trailing spaces', () => {
        assertEqual(validateDescription('Lunch   '), 'No leading/trailing spaces allowed.');
    });

    it('should fail on duplicate consecutive words (using advanced regex back-reference rule)', () => {
        assertEqual(validateDescription('Lunch Lunch at cafe'), 'Duplicate consecutive words detected.');
    });
});

// 2. Amount Validation Suite
describe('validateAmount() Regex Tests', () => {
    it('should accept typical integer amounts', () => {
        assertNull(validateAmount('45'));
    });

    it('should accept typical decimal amounts', () => {
        assertNull(validateAmount('12.50'));
    });

    it('should fail on empty inputs', () => {
        assertEqual(validateAmount(''), 'Amount is required.');
    });

    it('should fail on zero values (using advanced regex lookahead rule)', () => {
        assertEqual(validateAmount('0'), 'Amount must be greater than zero.');
    });

    it('should fail on negative amounts', () => {
        assertEqual(validateAmount('-5.00'), 'Enter a valid amount (e.g. 12 or 12.50).');
    });

    it('should fail on amounts with more than two decimal points', () => {
        assertEqual(validateAmount('12.555'), 'Enter a valid amount (e.g. 12 or 12.50).');
    });
});

// 3. Date Validation Suite
describe('validateDate() Regex Tests', () => {
    it('should accept valid YYYY-MM-DD strings', () => {
        assertNull(validateDate('2025-09-25'));
    });

    it('should fail on blank values', () => {
        assertEqual(validateDate(''), 'Date is required.');
    });

    it('should fail on wrong formats like DD-MM-YYYY', () => {
        assertEqual(validateDate('25-09-2025'), 'Use YYYY-MM-DD format.');
    });

    it('should fail on completely invalid dates', () => {
        assertEqual(validateDate('2025-99-99'), 'Use YYYY-MM-DD format.');
    });
});

// 4. Category Validation Suite
describe('validateCategory() Regex Tests', () => {
    it('should accept simple categories', () => {
        assertNull(validateCategory('Entertainment'));
    });

    it('should accept hyphenated or spaced categories', () => {
        assertNull(validateCategory('Self-Care'));
    });

    it('should fail on category inputs with numbers', () => {
        assertEqual(validateCategory('Food123'), 'Category must contain only letters, spaces, or hyphens.');
    });
});

// 5. Safe Regex Compiler & Live Search Suite
describe('compileRegex() & Live Search Tests', () => {
    it('should compile valid regex patterns safely', () => {
        const regex = compileRegex('coffee', 'i');
        assertNotNull(regex);
        assertEqual(regex instanceof RegExp, true);
    });

    it('should return null gracefully on broken regex strings instead of throwing an error', () => {
        const regex = compileRegex('[', 'i');
        assertEqual(regex, null);
    });

    it('should execute a successful live record search with matches', () => {
        const records = [
            { description: "Coffee with friends", category: "Entertainment", amount: 8.75 },
            { description: "Bus pass", category: "Transport", amount: 45.00 }
        ];
        const { results } = searchRecords(records, 'coffee', false);
        assertEqual(results.length, 1);
        assertEqual(results[0].description, "Coffee with friends");
    });
});

// ── DOM Renderer ──────────────────────────────────────────
const renderSuites = () => {
    const container = document.getElementById('test-suites');
    let total = 0;
    let passed = 0;
    let failed = 0;

    container.innerHTML = suites.map(suite => {
        const listItemsHtml = suite.tests.map(t => {
            total++;
            if (t.passed) passed++; else failed++;

            const statusClass = t.passed ? 'status-pass' : 'status-fail';
            const statusText = t.passed ? 'Pass' : 'Fail';

            return `
                        <li class="test-item">
                            <div class="error-details">
                                <span class="test-name">${t.name}</span>
                                ${!t.passed ? `<span class="${statusClass}">${t.error}</span>` : ''}
                            </div>
                            ${t.passed ? `<span class="test-status ${statusClass}">${statusText}</span>` : ''}
                        </li>
                    `;
        }).join('');

        return `
                    <div class="suite">
                        <div class="suite-header">${suite.name}</div>
                        <ul class="test-list">${listItemsHtml}</ul>
                    </div>
                `;
    }).join('');

    document.getElementById('total-run').textContent = total;
    document.getElementById('total-passed').textContent = passed;
    document.getElementById('total-failed').textContent = failed;
};

renderSuites();