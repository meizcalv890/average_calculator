# NEO / AVG — Average Calculator

A lightweight, browser-based average calculator designed to make score calculations, record management, and data analysis easier.

**NEO / AVG** is a personal calculation tool built with HTML, CSS, and JavaScript. It combines a practical scoring calculator with a dashboard for reviewing saved calculations and tracking score statistics.

> **Current Version:** 2.2 — In Development

---

## Overview

NEO / AVG is designed to provide a simple yet structured environment for calculating averages and managing calculation records.

Instead of relying on a basic calculator, users can organize scores into calculation records, review previous results, and observe their data through a visual dashboard.

The application runs directly in the browser and uses local browser storage to keep saved records.

## Features

### 1. Dashboard

A central overview of saved calculation data.

- Overall average statistics.
- Total saved records.
- Total scores.
- Highest and lowest score.
- Average comparison visualization.
- Score distribution visualization.
- Recent calculation records.

### 2. Average Calculator

A dedicated workspace for performing average calculations.

- Enter multiple numerical scores.
- Calculate average results.
- View calculation statistics.
- Save calculation records for later access.

### 3. Records Management

Manage previously saved calculations.

- View saved calculation records.
- Search and organize calculation history.
- Open existing records.
- Delete records.
- Export records as CSV.
- Backup and restore application data using JSON.

### 4. Excel Processor — v2.2

An ongoing feature designed to extend the application into a spreadsheet-based average processing tool.

Planned capabilities:

- Import Excel files (`.xlsx` and `.xls`).
- Select worksheets.
- Configure header and data rows.
- Detect and select numerical columns.
- Preview spreadsheet contents.
- Calculate averages per row and per column.
- Export processed results into a new Excel workbook.

**Development status:** Excel import, worksheet selection, column detection, and data preview are being implemented. Calculation and workbook export are still in development.

---

## Technology Stack

| Technology   | Purpose                            |
| ------------ | ---------------------------------- |
| HTML5        | Application structure              |
| CSS3         | Styling and responsive layout      |
| JavaScript   | Application logic and calculations |
| LocalStorage | Local data persistence             |
| SheetJS      | Excel workbook processing (v2.2)   |

The application does not require a dedicated backend server for its core functionality.

## Design Direction

NEO / AVG uses a Neo-Brutalist inspired visual direction.

Design characteristics:

- Warm off-white background.
- Strong black borders.
- Yellow as the primary accent color.
- Blue supporting accents.
- Bold typography and clear hierarchy.
- Structured dashboard layouts.
- Responsive interface for different screen sizes.

The interface is designed to feel like a personal productivity tool rather than a generic calculator template.

## Getting Started

### Requirements

- A modern web browser.
- A code editor such as Visual Studio Code.
- Internet connection when loading external libraries such as SheetJS from its CDN.

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/meizcalv890/average_calculator.git
```

**2. Open the project folder**

```bash
cd average_calculator
```

**3. Open the project**

Open the folder in Visual Studio Code.

**4. Run the application**

Use the Live Server extension in Visual Studio Code and open `index.html`.

Alternatively, open `index.html` directly in a modern browser for basic usage.

---

## Project Structure

```text
average_calculator/
│
├── index.html
├── style.css
├── script.js
├── excel-processor.js
│
└── README.md
```

| File                 | Description                               |
| -------------------- | ----------------------------------------- |
| `index.html`         | Main application interface                |
| `style.css`          | Application styling and responsive layout |
| `script.js`          | Main application logic                    |
| `excel-processor.js` | Excel import and processing module        |
| `README.md`          | Project documentation                     |

---

## Data Storage

NEO / AVG uses browser LocalStorage for saving application data.

This means:

- Data is stored locally in the browser.
- No user account is required for core functionality.
- Clearing browser storage may remove saved application records.
- Data is not automatically synchronized between different devices or browsers.

Users should periodically create a JSON backup to protect their saved records.

## Development Roadmap

| Version | Development Focus                         | Status         |
| ------- | ----------------------------------------- | -------------- |
| v1.0    | Core average calculator                   | Completed      |
| v2.0    | Extended calculator and record management | Completed      |
| v2.1    | Dashboard and interface refinement        | Completed      |
| v2.2    | Excel Import & Average Processor          | In Development |

### v2.2 Goals

- [x] Excel Reader foundation
- [x] Worksheet selection interface
- [x] Spreadsheet preview interface
- [x] Excel calculation engine
- [x] Row average calculation
- [x] Column average calculation
- [x] Export processed workbook
- [x] Final testing and refinement

---

## Project Goals

This project is part of a personal development journey focused on building practical web applications.

The main goals are:

- Improve JavaScript programming skills.
- Understand application structure and state management.
- Practice handling and processing structured data.
- Build a useful tool with a clear user interface.
- Learn how to develop and maintain a project through multiple versions.

## Author

**NEO / AVG**
Personal Calculation Tool · 2026

GitHub: [@meizcalv890](https://github.com/meizcalv890)

---

## License

No license has been specified for this repository yet. Please contact the author before redistributing or reusing the project.
