/* =====================================
   NEO AVG - AVERAGE CALCULATOR
===================================== */

/* ELEMENTS */

const inputList = document.getElementById("inputList");
const addButton = document.getElementById("addButton");
const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");

const inputCounter = document.getElementById("inputCounter");
const errorMessage = document.getElementById("errorMessage");

const resultSection = document.getElementById("resultSection");
const averageResult = document.getElementById("averageResult");
const totalCount = document.getElementById("totalCount");
const totalSum = document.getElementById("totalSum");
const formulaText = document.getElementById("formulaText");

const copyButton = document.getElementById("copyButton");
const copyButtonText = document.getElementById("copyButtonText");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistoryButton = document.getElementById("clearHistoryButton");

const currentYear = document.getElementById("currentYear");

/* CONFIGURATION */

const HISTORY_KEY = "neo_avg_history";
const MAX_HISTORY = 5;

let lastCalculatedAverage = null;

/* INITIALIZATION */

document.addEventListener("DOMContentLoaded", () => {
  currentYear.textContent = new Date().getFullYear();

  updateInputCounter();
  updateInputIndexes();
  loadHistory();
});

/* NUMBER FORMATTING */

function formatNumber(number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 10,
  }).format(number);
}

/* INPUT MANAGEMENT */

function createInputRow(value = "") {
  const row = document.createElement("div");

  row.className = "number-row";

  const index = document.createElement("span");

  index.className = "number-index";

  const input = document.createElement("input");

  input.type = "text";
  input.inputMode = "decimal";
  input.className = "number-input";
  input.placeholder = "Masukkan angka";
  input.autocomplete = "off";
  input.value = value;

  const removeButton = document.createElement("button");

  removeButton.type = "button";
  removeButton.className = "remove-button";
  removeButton.setAttribute("aria-label", "Hapus input");
  removeButton.innerHTML = "&times;";

  row.appendChild(index);
  row.appendChild(input);
  row.appendChild(removeButton);

  return row;
}

function addInput() {
  const row = createInputRow();

  inputList.appendChild(row);

  updateInputIndexes();
  updateInputCounter();

  clearError();

  hideResult();

  const inputs = getInputs();

  inputs[inputs.length - 1].focus();
}

function removeInput(button) {
  const rows = inputList.querySelectorAll(".number-row");

  if (rows.length <= 1) {
    return;
  }

  const row = button.closest(".number-row");

  row.remove();

  updateInputIndexes();
  updateInputCounter();

  clearError();
  hideResult();
}

function getInputs() {
  return Array.from(inputList.querySelectorAll(".number-input"));
}

function updateInputIndexes() {
  const rows = inputList.querySelectorAll(".number-row");

  rows.forEach((row, index) => {
    const number = String(index + 1).padStart(2, "0");

    const indexElement = row.querySelector(".number-index");
    const input = row.querySelector(".number-input");
    const removeButton = row.querySelector(".remove-button");

    indexElement.textContent = number;

    input.setAttribute("aria-label", `Angka ${index + 1}`);

    removeButton.disabled = rows.length === 1;
  });
}

function updateInputCounter() {
  const count = getInputs().length;

  inputCounter.textContent = `${count} ${count === 1 ? "INPUT" : "INPUTS"}`;
}

/* INPUT EVENTS */

addButton.addEventListener("click", addInput);

inputList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-button");

  if (!removeButton) {
    return;
  }

  removeInput(removeButton);
});

inputList.addEventListener("input", (event) => {
  if (!event.target.classList.contains("number-input")) {
    return;
  }

  event.target.classList.remove("invalid");

  clearError();
  hideResult();
});

inputList.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    event.target.classList.contains("number-input")
  ) {
    event.preventDefault();

    calculateAverage();
  }
});

/* VALIDATION */

function parseNumber(value) {
  const cleanedValue = value.trim();

  if (cleanedValue === "") {
    return null;
  }

  // Mendukung desimal dengan titik maupun koma.
  const normalizedValue = cleanedValue.replace(",", ".");

  // Hanya menerima format angka sederhana.
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalizedValue)) {
    return null;
  }

  const number = Number(normalizedValue);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function validateInputs() {
  const inputs = getInputs();

  const numbers = [];

  clearError();

  let firstInvalidInput = null;

  inputs.forEach((input) => {
    const number = parseNumber(input.value);

    if (number === null) {
      input.classList.add("invalid");

      if (!firstInvalidInput) {
        firstInvalidInput = input;
      }
    } else {
      input.classList.remove("invalid");

      numbers.push(number);
    }
  });

  if (firstInvalidInput) {
    showError("Pastikan semua kolom telah diisi dengan angka yang valid.");

    firstInvalidInput.focus();

    return null;
  }

  if (numbers.length === 0) {
    showError("Masukkan minimal satu angka.");

    return null;
  }

  return numbers;
}

/* CALCULATION */

function calculateAverage() {
  const numbers = validateInputs();

  if (!numbers) {
    return;
  }

  const sum = numbers.reduce((total, number) => total + number, 0);

  const average = sum / numbers.length;

  if (!Number.isFinite(sum) || !Number.isFinite(average)) {
    showError("Angka terlalu besar untuk dihitung.");

    return;
  }

  displayResult(numbers, sum, average);

  saveCalculation(numbers, sum, average);
}

calculateButton.addEventListener("click", calculateAverage);

/* RESULT DISPLAY */

function displayResult(numbers, sum, average) {
  lastCalculatedAverage = average;

  averageResult.textContent = formatNumber(average);

  totalCount.textContent = numbers.length;

  totalSum.textContent = formatNumber(sum);

  formulaText.textContent = `${formatNumber(sum)} ÷ ${numbers.length} = ${formatNumber(average)}`;

  copyButtonText.textContent = "Copy result";

  resultSection.hidden = false;

  clearError();
}

function hideResult() {
  resultSection.hidden = true;

  lastCalculatedAverage = null;
}

/* RESET */

function resetCalculator() {
  inputList.innerHTML = "";

  inputList.appendChild(createInputRow());

  updateInputIndexes();
  updateInputCounter();

  clearError();

  hideResult();
}

resetButton.addEventListener("click", resetCalculator);

/* ERROR HANDLING */

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";

  getInputs().forEach((input) => {
    input.classList.remove("invalid");
  });
}

/* COPY RESULT */

async function copyResult() {
  if (lastCalculatedAverage === null) {
    return;
  }

  const value = String(lastCalculatedAverage);

  try {
    await navigator.clipboard.writeText(value);

    copyButtonText.textContent = "Copied!";
  } catch (error) {
    // Fallback untuk browser yang tidak mendukung Clipboard API.
    const temporaryInput = document.createElement("textarea");

    temporaryInput.value = value;

    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";

    document.body.appendChild(temporaryInput);

    temporaryInput.select();

    const copied = document.execCommand("copy");

    temporaryInput.remove();

    copyButtonText.textContent = copied ? "Copied!" : "Copy failed";
  }
}

copyButton.addEventListener("click", copyResult);

/* HISTORY STORAGE */

function getHistory() {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);

    if (!storedHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(storedHistory);

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory;
  } catch (error) {
    console.error("Failed to load history:", error);

    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history:", error);

    showError("Penyimpanan riwayat tidak tersedia di browser ini.");
  }
}

/* SAVE CALCULATION */

function saveCalculation(numbers, sum, average) {
  const history = getHistory();

  const calculation = {
    id: Date.now(),

    numbers: numbers,

    sum: sum,

    average: average,

    date: new Date().toISOString(),
  };

  history.unshift(calculation);

  const limitedHistory = history.slice(0, MAX_HISTORY);

  saveHistory(limitedHistory);

  renderHistory(limitedHistory);
}

/* LOAD HISTORY */

function loadHistory() {
  const history = getHistory();

  renderHistory(history);
}

/* HISTORY DISPLAY */

function renderHistory(history) {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.appendChild(historyEmpty);

    return;
  }

  history.forEach((item) => {
    const historyItem = document.createElement("div");

    historyItem.className = "history-item";

    // LEFT INFORMATION

    const info = document.createElement("div");

    info.className = "history-info";

    const numbersText = document.createElement("p");

    numbersText.textContent = item.numbers
      .map((number) => formatNumber(number))
      .join(", ");

    const dateText = document.createElement("span");

    const date = new Date(item.date);

    dateText.textContent = Number.isNaN(date.getTime())
      ? "Tanggal tidak tersedia"
      : date.toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    info.appendChild(numbersText);
    info.appendChild(dateText);

    // RIGHT RESULT

    const result = document.createElement("div");

    result.className = "history-result";

    const resultLabel = document.createElement("span");

    resultLabel.textContent = "AVERAGE";

    const resultValue = document.createElement("strong");

    resultValue.textContent = formatNumber(item.average);

    result.appendChild(resultLabel);
    result.appendChild(resultValue);

    historyItem.appendChild(info);
    historyItem.appendChild(result);

    historyList.appendChild(historyItem);
  });
}

/* CLEAR HISTORY */

function clearHistory() {
  const history = getHistory();

  if (history.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    "Apakah kamu yakin ingin menghapus seluruh riwayat perhitungan?",
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(HISTORY_KEY);

  renderHistory([]);
}

clearHistoryButton.addEventListener("click", clearHistory);
