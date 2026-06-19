# Student Finance Tracker

## Features

### Expense Management

- Add new expenses
- Edit existing expenses
- Delete transactions
- Automatically generate unique IDs
- Track created and updated timestamps

### Dashboard

- Total number of transactions
- Total amount spent
- Most used category
- Last 7 days spending overview
- Budget limit monitoring

### Search and Sorting

- Live regex search
- Case-sensitive search option
- Highlight matching results
- Sort by:

  - ID
  - Description
  - Amount
  - Date

### Data Persistence

- Save data using localStorage
- Load previous transactions after refresh
- Export data as JSON
- Import JSON files with validation

### Currency Settings

Supported currencies:

- USD
- RWF
- EUR

## File Structure

 student-finance-tracker/

│
├── index.html
├── README.md
├── seed.json
├── tests.html
│
├── styles/
│ └── style.css
│
├── scripts/
│ ├── app.js
│ ├── state.js
│ ├── storage.js
│ ├── validators.js
│ ├── search.js
│ └── ui.js
│
└── assets/

**//**Regex list:
****1. Description: no leading/trailing spaces, no double spaces
 *** `^\S(?:.*\S)?$`;

****2. Amount: positive number, max 2 decimal places
 *** `^(0|[1-9]\d*)(\.\d{1,2})?$`;

****3. Date: YYYY-MM-DD with basic range checks
 *** `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`;

****4. Category / tag: letters, spaces, hyphens
 ***    `^[A-Za-z]+(?:[ -][A-Za-z]+)*$`;

****5. ADVANCED — lookahead: amount must not be zero
 *** `^(?!0+(\.0+)?$(0|[1-9]\d*)(\.\d{1,2})?$`;

****6. ADVANCED — back-reference: detect duplicate consecutive words
 *** `\b(\w+)\s+\1\b`/i;

## Keyboard shortcuts

The application supports keyboard-only navigation.

Keys:

TAB

Move between inputs, buttons and links.

ENTER

Activate buttons and links.

SHIFT + TAB

Move backwards through elements.

## Accessibility notes

The application includes:

- Semantic HTML landmarks

  - header
  - nav
  - main
  - section
  - footer

- Skip-to-content link

- Visible keyboard focus

- ARIA live regions for messages

- Proper labels connected to inputs

- Responsive mobile-first design

- Accessible color contrast

## Responsive Design

The application supports:

Mobile: 360px+

Tablet: 768px+
Desktop: 1024px+

## How To Run the app

1. Clone repository

git clone <https://github.com/kevinishimwe2/student-finance-tracker.git>

1. Open project folder

2. Open:

index.html

in a browser.

For best results use VS Code Live Server.

## How to run tests

Open:
tests.html
in the browser.

*** The test page checks:

- Validation rules
- Data handling
- Regex functionalit

## Deployment

The project is deployed using GitHub Pages.

Live URL:

<https://kevinishimwe2.github.io/student-finance-tracker/>

## Demo Video

Demo video:

<https://youtu.be/-EEG6meH0ow/>