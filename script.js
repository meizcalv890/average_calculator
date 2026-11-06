// ==========================================
// AVERAGE CALCULATOR v2.0
// ==========================================

// STORAGE
const HISTORY_KEY = "averageCalculatorHistories";
const DRAFT_KEY = "averageCalculatorDraft";

// DOM ELEMENTS
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("pageTitle");

const historyName = document.getElementById("historyName");
const scoreInput = document.getElementById("scoreInput");
const addScoreBtn = document.getElementById("addScoreBtn");
const scoreList = document.getElementById("scoreList");
const scoreCount = document.getElementById("scoreCount");

const averageResult = document.getElementById("averageResult");
const resultCaption = document.getElementById("resultCaption");
const resultCount = document.getElementById("resultCount");
const resultTotal = document.getElementById("resultTotal");
const resultHighest = document.getElementById("resultHighest");
const resultLowest = document.getElementById("resultLowest");

const saveCalculationBtn = document.getElementById("saveCalculationBtn");
const saveStatus = document.getElementById("saveStatus");
const inputMessage = document.getElementById("inputMessage");

const searchHistory = document.getElementById("searchHistory");
const sortHistory = document.getElementById("sortHistory");
const historyList = document.getElementById("historyList");

const managementStatus = document.getElementById("managementStatus");
const restoreInput = document.getElementById("restoreInput");

// ==========================================
// APPLICATION DATA
// ==========================================

let histories = loadHistories();
let activeCalculation = loadDraft();

let selectedHistoryId = null;

// ==========================================
// GENERAL FUNCTIONS
// ==========================================

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function formatNumber(number) {
  if (!Number.isFinite(Number(number))) return "0";

  return Number(number).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function getScoreValue(score) {
  if (typeof score === "number") {
    return score;
  }

  if (typeof score === "object" && score !== null) {
    return Number(score.value ?? score.score ?? 0);
  }

  return Number(score);
}

function getScores(data) {
  if (!data || !Array.isArray(data.scores)) {
    return [];
  }

  return data.scores
    .map(getScoreValue)
    .filter((value) => Number.isFinite(value));
}

function getStatistics(scores) {
  if (!scores.length) {
    return {
      count: 0,
      total: 0,
      average: 0,
      highest: null,
      lowest: null,
    };
  }

  const total = scores.reduce((sum, value) => sum + value, 0);

  return {
    count: scores.length,
    total,
    average: total / scores.length,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  };
}

function getHistoryName(history) {
  return history.name || history.title || "Tanpa nama";
}

function getHistoryAverage(history) {
  const scores = getScores(history);
  return getStatistics(scores).average;
}

function getDateValue(date) {
  const result = new Date(date).getTime();
  return Number.isFinite(result) ? result : 0;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = "message " + type;
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function loadHistories() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) => item && typeof item === "object" && Array.isArray(item.scores),
    );
  } catch (error) {
    console.error("Gagal membaca riwayat:", error);
    return [];
  }
}

function saveHistories() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(histories));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan riwayat:", error);
    alert("Penyimpanan gagal. Ruang penyimpanan browser mungkin penuh.");
    return false;
  }
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);

    if (!saved) {
      return {
        name: "",
        scores: [],
      };
    }

    const parsed = JSON.parse(saved);

    return {
      name: parsed.name || "",
      scores: Array.isArray(parsed.scores)
        ? parsed.scores.map(getScoreValue).filter(Number.isFinite)
        : [],
    };
  } catch (error) {
    console.error("Gagal membaca draft:", error);

    return {
      name: "",
      scores: [],
    };
  }
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(activeCalculation));

    document.getElementById("draftStatus").textContent =
      "Draft tersimpan otomatis";

    return true;
  } catch (error) {
    console.error("Gagal menyimpan draft:", error);

    document.getElementById("draftStatus").textContent =
      "Gagal menyimpan draft";

    return false;
  }
}

// ==========================================
// NAVIGATION
// ==========================================

function openPage(pageName) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageName + "Page");
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });

  const titles = {
    dashboard: "Dashboard",
    calculator: "Kalkulator",
    history: "Riwayat",
    excel: "Excel Processor",
  };

  pageTitle.textContent = titles[pageName] || "Dashboard";

  if (pageName === "dashboard") {
    renderDashboard();
  }

  if (pageName === "calculator") {
    renderCalculator();
  }

  if (pageName === "history") {
    renderHistories();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    openPage(link.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.go);
  });
});

// ==========================================
// CALCULATOR
// ==========================================

function renderCalculator() {
  historyName.value = activeCalculation.name || "";

  const scores = activeCalculation.scores;
  const stats = getStatistics(scores);

  scoreCount.textContent = stats.count;

  if (!scores.length) {
    scoreList.innerHTML = `
      <div class="empty-state">
        Belum ada nilai. Tambahkan nilai pertama.
      </div>
    `;
  } else {
    scoreList.innerHTML = scores
      .map(
        (score, index) => `
      <div class="score-item">
        <div>
          <strong>Nilai ${index + 1}</strong>
          <small>Data ke-${index + 1}</small>
        </div>

        <div>
          <strong>${formatNumber(score)}</strong>
          <button data-delete-score="${index}">Hapus</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  averageResult.textContent = formatNumber(stats.average);
  resultCount.textContent = stats.count;
  resultTotal.textContent = formatNumber(stats.total);

  resultHighest.textContent =
    stats.highest === null ? "-" : formatNumber(stats.highest);

  resultLowest.textContent =
    stats.lowest === null ? "-" : formatNumber(stats.lowest);

  resultCaption.textContent = stats.count
    ? `Rata-rata dari ${stats.count} nilai yang dimasukkan.`
    : "Tambahkan nilai untuk memulai.";

  saveCalculationBtn.disabled = stats.count === 0;
  saveCalculationBtn.style.opacity = stats.count === 0 ? ".5" : "1";
}

function addScore() {
  const rawValue = scoreInput.value.trim();

  if (rawValue === "") {
    showMessage(inputMessage, "Masukkan nilai terlebih dahulu.", "error");
    return;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    showMessage(
      inputMessage,
      "Nilai harus berupa angka antara 0 sampai 100.",
      "error",
    );
    return;
  }

  activeCalculation.scores.push(value);

  scoreInput.value = "";

  saveDraft();
  renderCalculator();

  showMessage(inputMessage, "Nilai berhasil ditambahkan.", "success");

  scoreInput.focus();
}

addScoreBtn.addEventListener("click", addScore);

scoreInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addScore();
  }
});

scoreList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-score]");

  if (!button) return;

  const index = Number(button.dataset.deleteScore);

  activeCalculation.scores.splice(index, 1);

  saveDraft();
  renderCalculator();

  showMessage(inputMessage, "Nilai berhasil dihapus.", "success");
});

historyName.addEventListener("input", () => {
  activeCalculation.name = historyName.value;
  saveDraft();
});

document.getElementById("clearScoresBtn").addEventListener("click", () => {
  if (!activeCalculation.scores.length) {
    showMessage(inputMessage, "Tidak ada nilai untuk dibersihkan.");
    return;
  }

  const confirmed = confirm(
    "Apakah kamu yakin ingin menghapus seluruh nilai pada perhitungan aktif?",
  );

  if (!confirmed) return;

  activeCalculation.scores = [];

  saveDraft();
  renderCalculator();

  showMessage(inputMessage, "Seluruh nilai berhasil dibersihkan.", "success");
});

document.getElementById("newCalculationBtn").addEventListener("click", () => {
  const hasData =
    activeCalculation.name.trim() || activeCalculation.scores.length;

  if (hasData) {
    const confirmed = confirm(
      "Mulai perhitungan baru? Draft yang sedang dikerjakan akan diganti.",
    );

    if (!confirmed) return;
  }

  activeCalculation = {
    name: "",
    scores: [],
  };

  saveDraft();
  renderCalculator();

  showMessage(saveStatus, "Perhitungan baru siap digunakan.", "success");
  showMessage(inputMessage, "");
});

// ==========================================
// SAVE CALCULATION
// ==========================================

function saveCalculation() {
  const scores = activeCalculation.scores;

  if (!scores.length) {
    showMessage(saveStatus, "Tambahkan nilai terlebih dahulu.", "error");
    return;
  }

  const now = new Date().toISOString();

  const newHistory = {
    id: createId(),
    name: activeCalculation.name.trim() || "Perhitungan tanpa nama",
    scores: [...scores],
    average: getStatistics(scores).average,
    createdAt: now,
    updatedAt: now,
  };

  histories.unshift(newHistory);

  if (!saveHistories()) {
    histories.shift();
    return;
  }

  activeCalculation = {
    name: "",
    scores: [],
  };

  saveDraft();
  renderCalculator();
  renderDashboard();

  showMessage(saveStatus, "Perhitungan berhasil disimpan.", "success");
}

saveCalculationBtn.addEventListener("click", saveCalculation);

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderDashboard() {
  const allScores = histories.flatMap((history) => getScores(history));
  const stats = getStatistics(allScores);

  document.getElementById("historyRecordCount").textContent = formatNumber(
    histories.length,
  );

  document.getElementById("totalScores").textContent = formatNumber(
    stats.count,
  );

  document.getElementById("overallAverage").textContent = formatNumber(
    stats.average,
  );

  document.getElementById("highestScore").textContent =
    stats.highest === null ? "-" : formatNumber(stats.highest);

  document.getElementById("lowestScoreText").textContent =
    "Nilai terendah: " +
    (stats.lowest === null ? "-" : formatNumber(stats.lowest));

  renderAverageChart();
  renderDistribution();
  renderRecentHistories();
}

// ==========================================
// AVERAGE CHART
// ==========================================

function renderAverageChart() {
  const chart = document.getElementById("averageChart");

  if (!histories.length) {
    chart.innerHTML = `
      <div class="empty-state">
        Belum ada data untuk ditampilkan.
      </div>
    `;
    return;
  }

  // Tampilkan maksimal 8 riwayat terbaru.
  const recent = [...histories]
    .sort((a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt))
    .slice(0, 8)
    .reverse();

  chart.innerHTML = recent
    .map((history) => {
      const average = getHistoryAverage(history);
      const barHeight = Math.max(3, Math.min(100, average));

      return `
      <div class="chart-column">
        <span class="chart-value">${formatNumber(average)}</span>

        <div class="chart-bar-track">
          <div
            class="chart-bar"
            style="height: ${barHeight}%"
            title="${escapeHTML(getHistoryName(history))}: ${formatNumber(average)}"
          ></div>
        </div>

        <span
          class="chart-label"
          title="${escapeHTML(getHistoryName(history))}"
        >
          ${escapeHTML(getHistoryName(history))}
        </span>
      </div>
    `;
    })
    .join("");
}

// ==========================================
// SCORE DISTRIBUTION
// ==========================================

function renderDistribution() {
  const container = document.getElementById("distributionChart");

  const allScores = histories.flatMap((history) => getScores(history));

  if (!allScores.length) {
    container.innerHTML = `
      <div class="empty-state">
        Belum ada data.
      </div>
    `;
    return;
  }

  const ranges = [
    { label: "0 - 59", min: 0, max: 60 },
    { label: "60 - 69", min: 60, max: 70 },
    { label: "70 - 79", min: 70, max: 80 },
    { label: "80 - 100", min: 80, max: 101 },
  ];

  container.innerHTML = ranges
    .map((range, index) => {
      const count = allScores.filter(
        (score) => score >= range.min && score < range.max,
      ).length;

      const percentage = (count / allScores.length) * 100;

      return `
      <div class="distribution-item">
        <div class="distribution-heading">
          <span>${range.label}</span>
          <strong>${count} nilai (${formatNumber(percentage)}%)</strong>
        </div>

        <div class="distribution-track">
          <div
            class="distribution-fill range-${index + 1}"
            style="width: ${percentage}%"
          ></div>
        </div>
      </div>
    `;
    })
    .join("");
}

// ==========================================
// RECENT HISTORIES
// ==========================================

function renderRecentHistories() {
  const container = document.getElementById("recentHistories");

  const recent = [...histories]
    .sort((a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt))
    .slice(0, 5);

  if (!recent.length) {
    container.innerHTML = `
      <div class="empty-state">
        Belum ada riwayat tersimpan.
      </div>
    `;
    return;
  }

  container.innerHTML = recent
    .map((history) => {
      const scores = getScores(history);

      return `
      <div class="recent-item">
        <div class="history-info">
          <strong>${escapeHTML(getHistoryName(history))}</strong>
          <small>${scores.length} nilai · ${formatDate(history.createdAt)}</small>
        </div>

        <div class="history-average">
          ${formatNumber(getHistoryAverage(history))}
        </div>
      </div>
    `;
    })
    .join("");
}

// ==========================================
// HISTORY MANAGEMENT
// ==========================================

function formatDate(date) {
  if (!date) return "Tanggal tidak tersedia";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderHistories() {
  const keyword = searchHistory.value.toLowerCase().trim();
  const sortType = sortHistory.value;

  let filtered = histories.filter((history) =>
    getHistoryName(history).toLowerCase().includes(keyword),
  );

  if (sortType === "newest") {
    filtered.sort(
      (a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt),
    );
  }

  if (sortType === "oldest") {
    filtered.sort(
      (a, b) => getDateValue(a.createdAt) - getDateValue(b.createdAt),
    );
  }

  if (sortType === "name") {
    filtered.sort((a, b) =>
      getHistoryName(a).localeCompare(getHistoryName(b), "id"),
    );
  }

  if (sortType === "average-high") {
    filtered.sort((a, b) => getHistoryAverage(b) - getHistoryAverage(a));
  }

  if (sortType === "average-low") {
    filtered.sort((a, b) => getHistoryAverage(a) - getHistoryAverage(b));
  }

  if (!filtered.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        ${
          histories.length
            ? "Tidak ditemukan riwayat yang sesuai."
            : "Belum ada riwayat tersimpan."
        }
      </div>
    `;
    return;
  }

  historyList.innerHTML = filtered
    .map((history) => {
      const scores = getScores(history);

      return `
      <div class="history-item">
        <div class="history-info">
          <strong>${escapeHTML(getHistoryName(history))}</strong>
          <small>
            ${scores.length} nilai · ${formatDate(history.createdAt)}
          </small>
        </div>

        <div class="history-average">
          ${formatNumber(getHistoryAverage(history))}
        </div>

        <div class="history-actions">
          <button class="icon-button" data-open-history="${escapeHTML(history.id)}">
            Detail
          </button>

          <button class="icon-button danger" data-delete-history="${escapeHTML(history.id)}">
            Hapus
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

searchHistory.addEventListener("input", renderHistories);
sortHistory.addEventListener("change", renderHistories);

historyList.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-history]");
  const deleteButton = event.target.closest("[data-delete-history]");

  if (openButton) {
    openHistoryDetail(openButton.dataset.openHistory);
  }

  if (deleteButton) {
    deleteHistory(deleteButton.dataset.deleteHistory);
  }
});

// ==========================================
// HISTORY DETAIL
// ==========================================

function openHistoryDetail(id) {
  const history = histories.find((item) => item.id === id);

  if (!history) return;

  selectedHistoryId = id;

  const scores = getScores(history);
  const stats = getStatistics(scores);

  document.getElementById("detailTitle").textContent = getHistoryName(history);

  document.getElementById("detailDate").textContent =
    "Disimpan pada " + formatDate(history.createdAt);

  document.getElementById("detailStats").innerHTML = `
    <div class="detail-stat">
      <small>Rata-rata</small>
      <strong>${formatNumber(stats.average)}</strong>
    </div>

    <div class="detail-stat">
      <small>Total nilai</small>
      <strong>${formatNumber(stats.total)}</strong>
    </div>

    <div class="detail-stat">
      <small>Tertinggi</small>
      <strong>${stats.highest === null ? "-" : formatNumber(stats.highest)}</strong>
    </div>

    <div class="detail-stat">
      <small>Terendah</small>
      <strong>${stats.lowest === null ? "-" : formatNumber(stats.lowest)}</strong>
    </div>
  `;

  document.getElementById("detailScores").innerHTML = scores.length
    ? scores
        .map(
          (score, index) => `
        <span class="detail-score">
          ${index + 1}. ${formatNumber(score)}
        </span>
      `,
        )
        .join("")
    : `<div class="empty-state">Tidak ada nilai.</div>`;

  document.getElementById("historyDetail").hidden = false;

  document.getElementById("historyDetail").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

document.getElementById("closeDetailBtn").addEventListener("click", () => {
  document.getElementById("historyDetail").hidden = true;
  selectedHistoryId = null;
});

// ==========================================
// DELETE HISTORY
// ==========================================

function deleteHistory(id) {
  const history = histories.find((item) => item.id === id);

  if (!history) return;

  const confirmed = confirm(
    `Hapus riwayat "${getHistoryName(history)}"? Data ini tidak dapat dikembalikan kecuali kamu memiliki backup.`,
  );

  if (!confirmed) return;

  const oldHistories = [...histories];

  histories = histories.filter((item) => item.id !== id);

  if (!saveHistories()) {
    histories = oldHistories;
    return;
  }

  if (selectedHistoryId === id) {
    document.getElementById("historyDetail").hidden = true;
    selectedHistoryId = null;
  }

  renderHistories();
  renderDashboard();

  showMessage(managementStatus, "Riwayat berhasil dihapus.", "success");
}

// ==========================================
// DOWNLOAD HELPER
// ==========================================

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], {
    type: mimeType,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ==========================================
// CSV EXPORT
// ==========================================

function csvEscape(value) {
  let text = String(value ?? "");

  // Mencegah nilai teks tertentu dibaca sebagai formula spreadsheet.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return '"' + text.replace(/"/g, '""') + '"';
}

function exportCSV() {
  if (!histories.length) {
    showMessage(managementStatus, "Belum ada data untuk diekspor.", "error");
    return;
  }

  const rows = [
    [
      "Nama Perhitungan",
      "Tanggal",
      "Jumlah Nilai",
      "Total",
      "Rata-rata",
      "Tertinggi",
      "Terendah",
      "Daftar Nilai",
    ],
  ];

  histories.forEach((history) => {
    const scores = getScores(history);
    const stats = getStatistics(scores);

    rows.push([
      getHistoryName(history),
      formatDate(history.createdAt),
      stats.count,
      stats.total,
      stats.average,
      stats.highest ?? "",
      stats.lowest ?? "",
      scores.join(", "),
    ]);
  });

  const csvContent =
    "\uFEFF" + rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  downloadFile(
    csvContent,
    "average-calculator-data.csv",
    "text/csv;charset=utf-8;",
  );

  showMessage(managementStatus, "File CSV berhasil dibuat.", "success");
}

document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);

// ==========================================
// JSON BACKUP
// ==========================================

function backupJSON() {
  const backupData = {
    application: "Average Calculator",
    version: "2.0",
    exportedAt: new Date().toISOString(),
    histories: histories,
  };

  downloadFile(
    JSON.stringify(backupData, null, 2),
    "average-calculator-backup.json",
    "application/json",
  );

  showMessage(managementStatus, "Backup JSON berhasil dibuat.", "success");
}

document.getElementById("backupBtn").addEventListener("click", backupJSON);

// ==========================================
// JSON RESTORE
// ==========================================

document.getElementById("restoreBtn").addEventListener("click", () => {
  restoreInput.click();
});

function isValidHistory(history) {
  return (
    history &&
    typeof history === "object" &&
    typeof history.id === "string" &&
    Array.isArray(history.scores) &&
    history.scores.every((score) => {
      const value = getScoreValue(score);
      return Number.isFinite(value) && value >= 0 && value <= 100;
    })
  );
}

restoreInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);

      const importedHistories = Array.isArray(parsed)
        ? parsed
        : parsed.histories;

      if (!Array.isArray(importedHistories)) {
        throw new Error("Format backup tidak dikenali.");
      }

      if (!importedHistories.every(isValidHistory)) {
        throw new Error("Ada data riwayat yang tidak valid.");
      }

      const confirmed = confirm(
        `Restore ${importedHistories.length} riwayat? Seluruh riwayat yang sekarang tersimpan akan diganti dengan data backup ini.`,
      );

      if (!confirmed) return;

      const previousHistories = histories;

      histories = importedHistories;

      if (!saveHistories()) {
        histories = previousHistories;
        return;
      }

      renderHistories();
      renderDashboard();

      showMessage(
        managementStatus,
        "Data berhasil dipulihkan dari backup.",
        "success",
      );
    } catch (error) {
      console.error("Restore gagal:", error);

      showMessage(
        managementStatus,
        error.message || "File backup tidak dapat dibaca.",
        "error",
      );
    }

    restoreInput.value = "";
  };

  reader.onerror = () => {
    showMessage(managementStatus, "Gagal membaca file backup.", "error");

    restoreInput.value = "";
  };

  reader.readAsText(file);
});

// ==========================================
// INITIALIZATION
// ==========================================

function initializeApp() {
  renderCalculator();
  renderDashboard();
  renderHistories();

  openPage("dashboard");
}

initializeApp();
