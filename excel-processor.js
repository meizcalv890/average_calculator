/* ==========================================
   AVERAGE CALCULATOR v2.2
   EXCEL READER ENGINE
========================================== */

(() => {
  "use strict";

  const elements = {
    fileInput: document.getElementById("excelFileInput"),
    fileInfo: document.getElementById("excelFileInfo"),
    fileName: document.getElementById("excelFileName"),
    fileSize: document.getElementById("excelFileSize"),
    removeButton: document.getElementById("removeExcelBtn"),
    importStatus: document.getElementById("excelImportStatus"),

    sheetSelect: document.getElementById("excelSheetSelect"),
    headerRow: document.getElementById("excelHeaderRow"),
    startRow: document.getElementById("excelStartRow"),

    rowMode: document.getElementById("excelRowMode"),
    columnMode: document.getElementById("excelColumnMode"),
    numericColumns: document.getElementById("excelNumericColumns"),
    processButton: document.getElementById("processExcelBtn"),
    processStatus: document.getElementById("excelProcessStatus"),

    previewCount: document.getElementById("excelPreviewCount"),
    previewHead: document.getElementById("excelPreviewHead"),
    previewBody: document.getElementById("excelPreviewBody"),

    processedRows: document.getElementById("excelProcessedRows"),
    validNumbers: document.getElementById("excelValidNumbers"),
    skippedCells: document.getElementById("excelSkippedCells"),
    resultPreview: document.getElementById("excelResultPreview"),
    exportButton: document.getElementById("exportExcelBtn"),
    exportStatus: document.getElementById("excelExportStatus"),

    dropzone: document.querySelector(".excel-dropzone"),
  };

  const state = {
    file: null,
    workbook: null,
    worksheet: null,
    sheetName: "",
    previewRows: [],
    resultWorkbook: null,
    resultFileName: "",
  };

  const requiredElements = [
    "fileInput",
    "sheetSelect",
    "headerRow",
    "startRow",
    "rowMode",
    "columnMode",
    "numericColumns",
    "processButton",
    "previewHead",
    "previewBody",
    "exportButton",
  ];

  const missingElements = requiredElements.filter((key) => !elements[key]);

  if (missingElements.length) {
    console.error(
      "Excel Processor: elemen HTML tidak ditemukan:",
      missingElements,
    );
    return;
  }

  /* ==========================================
     GENERAL HELPERS
  ========================================== */

  function setMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.className = "message";

    if (type) {
      element.classList.add(type);
    }
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "—";

    return value.toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    });
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getWorksheetRange(worksheet) {
    if (!worksheet || !worksheet["!ref"]) {
      return null;
    }

    return XLSX.utils.decode_range(worksheet["!ref"]);
  }

  function getCell(worksheet, row, column) {
    const address = XLSX.utils.encode_cell({
      r: row,
      c: column,
    });

    return worksheet[address] || null;
  }

  function getCellValue(worksheet, row, column) {
    const cell = getCell(worksheet, row, column);

    if (!cell || cell.v === undefined || cell.v === null) {
      return "";
    }

    return cell.v;
  }

  function getColumnName(columnIndex) {
    return XLSX.utils.encode_col(columnIndex);
  }

  function getHeaderLabel(worksheet, rowIndex, columnIndex) {
    const value = getCellValue(worksheet, rowIndex, columnIndex);

    const label = String(value ?? "").trim();

    return label || `Kolom ${getColumnName(columnIndex)}`;
  }

  function isDateCell(cell) {
    if (!cell) return false;

    return cell.t === "d" || cell.v instanceof Date;
  }

  function parseNumericCell(cell) {
    if (!cell || cell.v === undefined || cell.v === null) {
      return null;
    }

    if (isDateCell(cell)) {
      return null;
    }

    if (typeof cell.v === "number") {
      return Number.isFinite(cell.v) ? cell.v : null;
    }

    if (typeof cell.v === "string") {
      const value = cell.v.trim();

      if (!value) return null;

      // Hanya menerima format angka standar.
      // Contoh: 80, -12, 3.5, 1250.75
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    }

    return null;
  }

  function getSelectedColumns() {
    return Array.from(elements.numericColumns.selectedOptions)
      .map((option) => Number(option.value))
      .filter(Number.isInteger);
  }

  function getSelectedSheet() {
    if (!state.workbook) return null;

    const sheetName = elements.sheetSelect.value;

    return state.workbook.Sheets[sheetName] || null;
  }

  function resetResults() {
    state.resultWorkbook = null;
    state.resultFileName = "";

    if (elements.processedRows) {
      elements.processedRows.textContent = "0";
    }

    if (elements.validNumbers) {
      elements.validNumbers.textContent = "0";
    }

    if (elements.skippedCells) {
      elements.skippedCells.textContent = "0";
    }

    if (elements.resultPreview) {
      elements.resultPreview.innerHTML =
        '<div class="empty-state">Hasil perhitungan akan muncul di sini.</div>';
    }

    elements.exportButton.disabled = true;

    setMessage(elements.processStatus, "");
    setMessage(elements.exportStatus, "");
  }

  function setControlsEnabled(enabled) {
    elements.sheetSelect.disabled = !enabled;
    elements.headerRow.disabled = !enabled;
    elements.startRow.disabled = !enabled;
    elements.rowMode.disabled = !enabled;
    elements.columnMode.disabled = !enabled;
    elements.numericColumns.disabled = !enabled;
    elements.processButton.disabled = !enabled;
  }

  function resetPreview() {
    elements.previewHead.innerHTML = `
      <tr>
        <th>IMPORT DATA TO BEGIN</th>
      </tr>
    `;

    elements.previewBody.innerHTML = `
      <tr>
        <td class="empty-state">
          Belum ada spreadsheet yang diimpor.
        </td>
      </tr>
    `;

    if (elements.previewCount) {
      elements.previewCount.textContent = "0 ROWS";
    }
  }

  /* ==========================================
     FILE IMPORT
  ========================================== */

  async function handleFileImport(file) {
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      setMessage(
        elements.importStatus,
        "Format file tidak didukung. Gunakan XLSX atau XLS.",
        "error",
      );
      return;
    }

    if (typeof XLSX === "undefined") {
      setMessage(
        elements.importStatus,
        "Library Excel belum berhasil dimuat. Periksa koneksi internet dan muat ulang halaman.",
        "error",
      );
      return;
    }

    try {
      setMessage(elements.importStatus, "Sedang membaca spreadsheet...");

      setControlsEnabled(false);
      resetResults();

      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("Workbook tidak memiliki worksheet.");
      }

      state.file = file;
      state.workbook = workbook;
      state.sheetName = workbook.SheetNames[0];

      if (elements.fileName) {
        elements.fileName.textContent = file.name;
      }

      if (elements.fileSize) {
        elements.fileSize.textContent = formatFileSize(file.size);
      }

      if (elements.fileInfo) {
        elements.fileInfo.hidden = false;
      }

      populateSheetOptions();
      loadSelectedWorksheet();

      setControlsEnabled(true);

      setMessage(
        elements.importStatus,
        `Berhasil membaca ${workbook.SheetNames.length} worksheet.`,
        "success",
      );
    } catch (error) {
      console.error("Excel import error:", error);

      resetImportedFile();

      setMessage(
        elements.importStatus,
        error.message || "Gagal membaca file Excel.",
        "error",
      );
    }
  }

  function populateSheetOptions() {
    elements.sheetSelect.innerHTML = "";

    state.workbook.SheetNames.forEach((sheetName) => {
      const option = document.createElement("option");

      option.value = sheetName;
      option.textContent = sheetName;

      elements.sheetSelect.appendChild(option);
    });

    elements.sheetSelect.value = state.sheetName;
  }

  function loadSelectedWorksheet() {
    const sheetName = elements.sheetSelect.value;

    const worksheet = state.workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error("Worksheet tidak ditemukan.");
    }

    state.sheetName = sheetName;
    state.worksheet = worksheet;

    const range = getWorksheetRange(worksheet);

    if (!range) {
      resetPreview();
      elements.numericColumns.innerHTML = "";
      elements.numericColumns.disabled = true;
      elements.processButton.disabled = true;

      setMessage(
        elements.importStatus,
        "Worksheet ini kosong. Pilih worksheet lain atau gunakan file berbeda.",
        "error",
      );

      return;
    }

    elements.headerRow.value = String(range.s.r + 1);
    elements.startRow.value = String(range.s.r + 2);

    updateColumnOptions();
    renderPreview();
    resetResults();

    elements.numericColumns.disabled = false;
    elements.processButton.disabled = false;

    setMessage(elements.processStatus, "");
  }

  function resetImportedFile() {
    state.file = null;
    state.workbook = null;
    state.worksheet = null;
    state.sheetName = "";
    state.previewRows = [];

    elements.fileInput.value = "";

    if (elements.fileInfo) {
      elements.fileInfo.hidden = true;
    }

    elements.sheetSelect.innerHTML =
      '<option value="">Import a file first</option>';

    elements.numericColumns.innerHTML = "";

    setControlsEnabled(false);
    resetPreview();
    resetResults();
  }

  /* ==========================================
     COLUMN DETECTION
  ========================================== */

  function updateColumnOptions() {
    const worksheet = getSelectedSheet();
    const range = getWorksheetRange(worksheet);

    elements.numericColumns.innerHTML = "";

    if (!range) return;

    const headerRow = Math.max(1, Number(elements.headerRow.value) || 1) - 1;

    const startRow =
      Math.max(1, Number(elements.startRow.value) || headerRow + 2) - 1;

    const sampleEnd = Math.min(range.e.r, startRow + 29);

    for (let column = range.s.c; column <= range.e.c; column += 1) {
      let numericCount = 0;

      for (let row = startRow; row <= sampleEnd; row += 1) {
        const cell = getCell(worksheet, row, column);

        if (parseNumericCell(cell) !== null) {
          numericCount += 1;
        }
      }

      const option = document.createElement("option");

      option.value = String(column);
      option.textContent = `${getHeaderLabel(worksheet, headerRow, column)} (${getColumnName(column)})`;

      // Rekomendasi otomatis berdasarkan sampel data.
      option.selected = numericCount > 0;

      elements.numericColumns.appendChild(option);
    }

    elements.numericColumns.disabled = false;
  }

  /* ==========================================
     PREVIEW
  ========================================== */

  function renderPreview() {
    const worksheet = getSelectedSheet();
    const range = getWorksheetRange(worksheet);

    if (!range) {
      resetPreview();
      return;
    }

    const headerRow = Math.max(1, Number(elements.headerRow.value) || 1) - 1;

    const startRow =
      Math.max(1, Number(elements.startRow.value) || headerRow + 2) - 1;

    if (
      headerRow < range.s.r ||
      headerRow > range.e.r ||
      startRow <= headerRow ||
      startRow > range.e.r + 1
    ) {
      resetPreview();

      setMessage(
        elements.processStatus,
        "Periksa kembali nomor header dan baris awal data.",
        "error",
      );

      return;
    }

    const headers = [];

    for (let column = range.s.c; column <= range.e.c; column += 1) {
      headers.push(getHeaderLabel(worksheet, headerRow, column));
    }

    const rows = [];
    const previewEnd = Math.min(range.e.r, startRow + 9);

    for (let row = startRow; row <= previewEnd; row += 1) {
      const values = [];

      for (let column = range.s.c; column <= range.e.c; column += 1) {
        const value = getCellValue(worksheet, row, column);

        values.push(value);
      }

      rows.push({
        rowNumber: row + 1,
        values,
      });
    }

    state.previewRows = rows;

    elements.previewHead.innerHTML = "";
    elements.previewBody.innerHTML = "";

    const headerTr = document.createElement("tr");

    const numberHeader = document.createElement("th");
    numberHeader.textContent = "ROW";
    headerTr.appendChild(numberHeader);

    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerTr.appendChild(th);
    });

    elements.previewHead.appendChild(headerTr);

    if (!rows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");

      td.colSpan = headers.length + 1;
      td.className = "empty-state";
      td.textContent = "Tidak ada baris data untuk ditampilkan.";

      tr.appendChild(td);
      elements.previewBody.appendChild(tr);
    } else {
      rows.forEach((row) => {
        const tr = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = String(row.rowNumber);
        tr.appendChild(numberCell);

        row.values.forEach((value) => {
          const td = document.createElement("td");

          td.textContent =
            value instanceof Date
              ? value.toLocaleDateString("id-ID")
              : String(value ?? "");

          tr.appendChild(td);
        });

        elements.previewBody.appendChild(tr);
      });
    }

    if (elements.previewCount) {
      elements.previewCount.textContent = `${rows.length} / ${Math.max(0, range.e.r - startRow + 1)} ROWS`;
    }

    setMessage(elements.processStatus, "");
  }

  /* ==========================================
     EVENT LISTENERS
  ========================================== */

  elements.fileInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    handleFileImport(file);
  });

  if (elements.removeButton) {
    elements.removeButton.addEventListener("click", () => {
      resetImportedFile();

      setMessage(elements.importStatus, "File telah dilepas.");
    });
  }

  elements.sheetSelect.addEventListener("change", () => {
    if (!state.workbook) return;

    try {
      loadSelectedWorksheet();
    } catch (error) {
      console.error(error);

      setMessage(elements.importStatus, error.message, "error");
    }
  });

  elements.headerRow.addEventListener("change", () => {
    if (!state.worksheet) return;

    updateColumnOptions();
    renderPreview();
    resetResults();
  });

  elements.startRow.addEventListener("change", () => {
    if (!state.worksheet) return;

    updateColumnOptions();
    renderPreview();
    resetResults();
  });

  elements.numericColumns.addEventListener("change", () => {
    resetResults();
  });

  elements.rowMode.addEventListener("change", resetResults);
  elements.columnMode.addEventListener("change", resetResults);

  if (elements.dropzone) {
    elements.dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      elements.dropzone.classList.add("drag-over");
    });

    elements.dropzone.addEventListener("dragleave", () => {
      elements.dropzone.classList.remove("drag-over");
    });

    elements.dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove("drag-over");

      const file = event.dataTransfer?.files?.[0];

      if (!file) return;

      elements.fileInput.files = event.dataTransfer.files;
      handleFileImport(file);
    });
  }

  /* ==========================================
     TEMPORARY PROCESS / EXPORT PLACEHOLDERS
     Will be implemented in the next stage.
  ========================================== */

  elements.processButton.addEventListener("click", () => {
    if (!state.worksheet) return;

    const selectedColumns = getSelectedColumns();

    if (!selectedColumns.length) {
      setMessage(
        elements.processStatus,
        "Pilih minimal satu kolom numerik terlebih dahulu.",
        "error",
      );
      return;
    }

    if (!elements.rowMode.checked && !elements.columnMode.checked) {
      setMessage(
        elements.processStatus,
        "Pilih minimal satu mode perhitungan.",
        "error",
      );
      return;
    }

    setMessage(
      elements.processStatus,
      "Reader Engine siap. Mesin perhitungan akan diaktifkan pada tahap berikutnya.",
      "success",
    );
  });

  elements.exportButton.addEventListener("click", () => {
    setMessage(
      elements.exportStatus,
      "Fitur ekspor akan diaktifkan pada tahap berikutnya.",
    );
  });

  /* ==========================================
     INITIAL STATE
  ========================================== */

  setControlsEnabled(false);
  resetPreview();
  resetResults();

  console.info("Average Calculator v2.2 — Excel Reader Engine ready.");
})();
