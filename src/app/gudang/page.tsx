'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Link from 'next/link';

// Data bawaan awal gudang (default sample)
const DEFAULT_COLUMNS = [
  'Kode Barang',
  'Nama Barang',
  'Kategori',
  'No Batch',
  'Stok Fisik',
  'Satuan',
  'Tanggal Exp',
  'Lokasi Rak',
  'PBF Distributor',
  'Kondisi',
];

const DEFAULT_ROWS: Record<string, any>[] = [
  {
    'Kode Barang': 'OBT-001',
    'Nama Barang': 'Paracetamol 500mg',
    'Kategori': 'TABLET',
    'No Batch': 'PCT-2025-A1',
    'Stok Fisik': 500,
    'Satuan': 'Biji',
    'Tanggal Exp': '2027-09-07',
    'Lokasi Rak': 'Rak A-01 (Tablet)',
    'PBF Distributor': 'PT Kimia Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-002',
    'Nama Barang': 'Amoxicillin 500mg',
    'Kategori': 'TABLET',
    'No Batch': 'AMX-2025-B2',
    'Stok Fisik': 300,
    'Satuan': 'Biji',
    'Tanggal Exp': '2027-07-09',
    'Lokasi Rak': 'Rak A-02 (Tablet)',
    'PBF Distributor': 'PT Kalbe Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-003',
    'Nama Barang': 'CTM 4mg (Chlorpheniramine)',
    'Kategori': 'TABLET',
    'No Batch': 'CTM-2025-C1',
    'Stok Fisik': 1000,
    'Satuan': 'Biji',
    'Tanggal Exp': '2027-03-11',
    'Lokasi Rak': 'Rak A-03 (Tablet)',
    'PBF Distributor': 'PT Bernofarm',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-004',
    'Nama Barang': 'Sanmol Sirup 60ml',
    'Kategori': 'SIRUP',
    'No Batch': 'SNM-2025-S1',
    'Stok Fisik': 60,
    'Satuan': 'Botol',
    'Tanggal Exp': '2026-11-20',
    'Lokasi Rak': 'Rak B-01 (Sirup)',
    'PBF Distributor': 'PT Sanbe Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-005',
    'Nama Barang': 'Bioplacenton Gel 15g',
    'Kategori': 'SALEP',
    'No Batch': 'BPL-2025-G1',
    'Stok Fisik': 45,
    'Satuan': 'Tube',
    'Tanggal Exp': '2027-06-15',
    'Lokasi Rak': 'Rak C-01 (Salep & Gel)',
    'PBF Distributor': 'PT Kalbe Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-006',
    'Nama Barang': 'Betadine Antiseptik 30ml',
    'Kategori': 'TETES',
    'No Batch': 'BTD-2026-X1',
    'Stok Fisik': 80,
    'Satuan': 'Botol',
    'Tanggal Exp': '2028-01-10',
    'Lokasi Rak': 'Rak C-02 (Cairan Luar)',
    'PBF Distributor': 'PT Mahakam Beta Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-007',
    'Nama Barang': 'Amoxsan Dry Sirup 125mg/5ml',
    'Kategori': 'SIRUP',
    'No Batch': 'AMX-DRY-99',
    'Stok Fisik': 35,
    'Satuan': 'Botol',
    'Tanggal Exp': '2026-10-30',
    'Lokasi Rak': 'Rak B-02 (Sirup Kering)',
    'PBF Distributor': 'PT Sanbe Farma',
    'Kondisi': 'Baik',
  },
  {
    'Kode Barang': 'OBT-008',
    'Nama Barang': 'Insulin Glargine Pen 100IU',
    'Kategori': 'LAINNYA',
    'No Batch': 'INS-2026-K1',
    'Stok Fisik': 20,
    'Satuan': 'Pcs',
    'Tanggal Exp': '2027-02-14',
    'Lokasi Rak': 'Kulkas Farmasi 01 (2-8°C)',
    'PBF Distributor': 'PT Kalbe Farma',
    'Kondisi': 'Suhu Terjaga',
  },
];

const STORAGE_KEYS = {
  rows: 'apotek_gudang_rows',
  allCols: 'apotek_gudang_all_cols',
  selectedCols: 'apotek_gudang_selected_cols',
  fileName: 'apotek_gudang_file_name',
  importTime: 'apotek_gudang_import_time',
};

export default function GudangPage() {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [lastImportedTime, setLastImportedTime] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalFileName, setModalFileName] = useState('');
  const [modalDetectedColumns, setModalDetectedColumns] = useState<string[]>([]);
  const [modalSelectedColumns, setModalSelectedColumns] = useState<string[]>([]);
  const [modalParsedRows, setModalParsedRows] = useState<Record<string, any>[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = () => {
    if (typeof window === 'undefined') return;

    try {
      const storedRows = localStorage.getItem(STORAGE_KEYS.rows);
      const storedAllCols = localStorage.getItem(STORAGE_KEYS.allCols);
      const storedSelectedCols = localStorage.getItem(STORAGE_KEYS.selectedCols);
      const storedFileName = localStorage.getItem(STORAGE_KEYS.fileName);
      const storedTime = localStorage.getItem(STORAGE_KEYS.importTime);

      if (storedRows && storedAllCols) {
        const parsedRows = JSON.parse(storedRows);
        const parsedAllCols = JSON.parse(storedAllCols);
        const parsedSelectedCols = storedSelectedCols ? JSON.parse(storedSelectedCols) : parsedAllCols;

        setRows(parsedRows);
        setAllColumns(parsedAllCols);
        setSelectedColumns(parsedSelectedCols);
        setFileName(storedFileName || 'File Excel Gudang');
        setLastImportedTime(storedTime || '');
      } else {
        // Gunakan data bawaan awal
        setRows(DEFAULT_ROWS);
        setAllColumns(DEFAULT_COLUMNS);
        setSelectedColumns(DEFAULT_COLUMNS);
        setFileName('Data Master Gudang (Default)');
        setLastImportedTime(new Date().toISOString());
      }
    } catch (e) {
      console.error('Error loading warehouse data:', e);
      setRows(DEFAULT_ROWS);
      setAllColumns(DEFAULT_COLUMNS);
      setSelectedColumns(DEFAULT_COLUMNS);
    }
  };

  const saveToStorage = (
    newRows: Record<string, any>[],
    allCols: string[],
    selCols: string[],
    name: string
  ) => {
    if (typeof window === 'undefined') return;
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.rows, JSON.stringify(newRows));
    localStorage.setItem(STORAGE_KEYS.allCols, JSON.stringify(allCols));
    localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(selCols));
    localStorage.setItem(STORAGE_KEYS.fileName, name);
    localStorage.setItem(STORAGE_KEYS.importTime, now);

    setRows(newRows);
    setAllColumns(allCols);
    setSelectedColumns(selCols);
    setFileName(name);
    setLastImportedTime(now);
  };

  // Toggle pilihan kolom yang tampil di halaman gudang
  const handleToggleColumn = (col: string) => {
    let nextCols: string[];
    if (selectedColumns.includes(col)) {
      if (selectedColumns.length === 1) {
        showNotification('error', 'Minimal satu kolom harus tetap dipilih!');
        return;
      }
      nextCols = selectedColumns.filter((c) => c !== col);
    } else {
      nextCols = [...selectedColumns, col];
    }
    setSelectedColumns(nextCols);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(nextCols));
    }
  };

  const handleSelectAllColumns = () => {
    setSelectedColumns([...allColumns]);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(allColumns));
    }
  };

  const handleResetToDefaultColumns = () => {
    const defaultCols = allColumns.slice(0, Math.min(8, allColumns.length));
    setSelectedColumns(defaultCols);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(defaultCols));
    }
    showNotification('success', 'Pilihan kolom dikembalikan ke default.');
  };

  // Baca file Excel yang dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setModalFileName(file.name);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Dapatkan nama header kolom dari baris pertama Excel
        const rawHeaderData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawHeaderData || rawHeaderData.length === 0) {
          showNotification('error', 'File Excel kosong.');
          setIsProcessingFile(false);
          return;
        }

        const detectedCols = (rawHeaderData[0] || [])
          .map((h) => String(h ?? '').trim())
          .filter(Boolean);

        if (detectedCols.length === 0) {
          showNotification('error', 'Tidak dapat menemukan header kolom pada file Excel ini.');
          setIsProcessingFile(false);
          return;
        }

        // Dapatkan baris data dalam format objek JSON
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawRows.length === 0) {
          showNotification('error', 'Tidak ada baris data yang ditemukan di dalam file.');
          setIsProcessingFile(false);
          return;
        }

        setModalDetectedColumns(detectedCols);
        // Secara default pilih semua kolom yang terdeteksi
        setModalSelectedColumns([...detectedCols]);
        setModalParsedRows(rawRows);
        setIsProcessingFile(false);
        setShowImportModal(true);
      } catch (err: any) {
        console.error('Excel read error:', err);
        showNotification('error', `Gagal membaca file Excel: ${err.message || 'Format tidak didukung'}`);
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      showNotification('error', 'Gagal membaca file dari disk.');
      setIsProcessingFile(false);
    };

    reader.readAsBinaryString(file);
    // Reset file input agar bisa pilih ulang file yang sama jika diperlukan
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle kolom pada modal import
  const handleToggleModalColumn = (col: string) => {
    if (modalSelectedColumns.includes(col)) {
      if (modalSelectedColumns.length === 1) {
        showNotification('error', 'Minimal satu kolom harus dipilih!');
        return;
      }
      setModalSelectedColumns(modalSelectedColumns.filter((c) => c !== col));
    } else {
      setModalSelectedColumns([...modalSelectedColumns, col]);
    }
  };

  const handleModalSelectAll = () => {
    setModalSelectedColumns([...modalDetectedColumns]);
  };

  const handleModalDeselectAll = () => {
    if (modalDetectedColumns.length > 0) {
      setModalSelectedColumns([modalDetectedColumns[0]]);
    }
  };

  // Konfirmasi Import dan simpan ke tampilan Gudang
  const handleConfirmImport = () => {
    if (modalParsedRows.length === 0) {
      showNotification('error', 'Tidak ada data untuk diimpor.');
      return;
    }

    if (modalSelectedColumns.length === 0) {
      showNotification('error', 'Pilih minimal satu kolom untuk ditampilkan.');
      return;
    }

    saveToStorage(
      modalParsedRows,
      modalDetectedColumns,
      modalSelectedColumns,
      modalFileName
    );

    setShowImportModal(false);
    showNotification(
      'success',
      `Berhasil mengimpor ${modalParsedRows.length} baris data gudang dengan ${modalSelectedColumns.length} kolom terpilih!`
    );
  };

  // Reset ke data awal default
  const handleResetToDefaultData = () => {
    if (confirm('Kembalikan data tabel gudang ke data bawaan awal?')) {
      saveToStorage(DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_COLUMNS, 'Data Master Gudang (Default)');
      showNotification('success', 'Data gudang berhasil dikembalikan ke default.');
    }
  };

  // Unduh contoh Template Excel Gudang
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Kode Barang': 'OBT-001',
        'Nama Barang': 'Paracetamol 500mg',
        'Kategori': 'TABLET',
        'No Batch': 'PCT-2026-A1',
        'Stok Fisik': 500,
        'Satuan': 'Biji',
        'Tanggal Exp': '2027-12-31',
        'Lokasi Rak': 'Rak A-01',
        'PBF Distributor': 'PT Kimia Farma',
        'Harga Beli': 350,
        'Kondisi': 'Baik',
      },
      {
        'Kode Barang': 'OBT-002',
        'Nama Barang': 'Amoxicillin 500mg',
        'Kategori': 'TABLET',
        'No Batch': 'AMX-2026-02',
        'Stok Fisik': 250,
        'Satuan': 'Biji',
        'Tanggal Exp': '2027-08-20',
        'Lokasi Rak': 'Rak A-02',
        'PBF Distributor': 'PT Kalbe Farma',
        'Harga Beli': 600,
        'Kondisi': 'Baik',
      },
      {
        'Kode Barang': 'OBT-003',
        'Nama Barang': 'Sanmol Sirup 60ml',
        'Kategori': 'SIRUP',
        'No Batch': 'SNM-2026-S1',
        'Stok Fisik': 40,
        'Satuan': 'Botol',
        'Tanggal Exp': '2027-04-15',
        'Lokasi Rak': 'Rak B-01',
        'PBF Distributor': 'PT Sanbe Farma',
        'Harga Beli': 18000,
        'Kondisi': 'Baik',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Gudang');
    XLSX.writeFile(workbook, 'template_data_gudang_apotek.xlsx');
    showNotification('success', 'Template Excel gudang berhasil diunduh.');
  };

  // Ekspor tampilan tabel saat ini ke file Excel
  const handleExportView = () => {
    if (filteredRows.length === 0) {
      showNotification('error', 'Tidak ada data untuk diekspor.');
      return;
    }

    // Ekspor hanya kolom yang sedang dipilih / tampil
    const exportData = filteredRows.map((row, idx) => {
      const item: Record<string, any> = { 'No': idx + 1 };
      selectedColumns.forEach((col) => {
        item[col] = row[col] !== undefined && row[col] !== null ? row[col] : '-';
      });
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gudang Apotek');
    XLSX.writeFile(
      workbook,
      `data_gudang_terpilih_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showNotification('success', 'Data gudang berhasil diekspor ke Excel.');
  };

  // Filter baris data berdasarkan pencarian
  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return selectedColumns.some((col) => {
      const val = row[col];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });
  });

  // Hitung total stok jika ada kolom berbau stok
  const stokCol = allColumns.find((c) => /stok|qty|jumlah|kuantitas/i.test(c));
  const totalStokCount = stokCol
    ? rows.reduce((sum, r) => sum + (parseFloat(r[stokCol]) || 0), 0)
    : rows.length;

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>Manajemen Stok Gudang</h1>
          <p>
            Pusat data stok fisik gudang apotek dengan fitur impor file Excel dan pengaturan fleksibel pilihan kolom yang ingin ditampilkan.
          </p>
        </div>
        <div className="page-header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadTemplate}
            title="Download file contoh template Excel gudang"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3v10M6 9l4 4 4-4M3 17h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Unduh Template</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportView}
            title="Ekspor kolom terpilih ke Excel"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M14 8l-4-4-4 4M10 4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            title="Upload file Excel (.xlsx / .xls)"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M10 3v11M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Import File Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-icon teal">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="14" height="14" rx="2" />
              <line x1="3" y1="8" x2="17" y2="8" />
              <line x1="8" y1="8" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div className="summary-card-value">{rows.length}</div>
            <div className="summary-card-label">Total Baris / Item Gudang</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon blue">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h14M3 8h14M3 12h14M3 16h14" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="summary-card-value">
              {selectedColumns.length} <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 500 }}>/ {allColumns.length}</span>
            </div>
            <div className="summary-card-label">Kolom Excel Ditampilkan</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon amber">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" />
              <path d="M3 6l7 4" />
              <path d="M17 6l-7 4" />
              <line x1="10" y1="10" x2="10" y2="18" />
            </svg>
          </div>
          <div>
            <div className="summary-card-value">{totalStokCount.toLocaleString('id-ID')}</div>
            <div className="summary-card-label">Total Kuantitas Fisik</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon green">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
              <path d="M14 2v4a2 2 0 002 2h4" />
            </svg>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              className="summary-card-value"
              style={{ fontSize: '1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              title={fileName}
            >
              {fileName || 'Default Gudang'}
            </div>
            <div className="summary-card-label">
              {lastImportedTime
                ? `Diperbarui ${new Date(lastImportedTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                : 'Sumber Data Aktif'}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL UTAMA: PILIHAN KOLOM EXCEL YANG INGIN DITAMPILKAN DI GUDANG */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--teal-600)" strokeWidth="2">
                <rect x="2" y="3" width="16" height="14" rx="2" />
                <line x1="2" y1="8" x2="18" y2="8" />
                <line x1="8" y1="8" x2="8" y2="17" />
                <line x1="14" y1="8" x2="14" y2="17" />
              </svg>
              <span>Pilihan Kolom Excel yang Ditampilkan di Gudang</span>
            </h3>
            <p className="text-muted text-xs" style={{ marginTop: '2px' }}>
              Centang atau hilangkan centang kolom di bawah ini untuk mengatur kolom apa saja yang muncul pada tabel gudang.
            </p>
          </div>

          {/* Quick Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSelectAllColumns}
            >
              Pilih Semua Kolom ({allColumns.length})
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetToDefaultColumns}
            >
              Reset Default
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleResetToDefaultData}
              title="Reset kembali ke sampel data awal"
            >
              Reset Data Awal
            </button>
          </div>
        </div>

        {/* Checkbox Chips List */}
        <div className="column-chips-container">
          {allColumns.map((col) => {
            const isChecked = selectedColumns.includes(col);
            return (
              <label
                key={col}
                className={`column-chip ${isChecked ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleColumn(col)}
                />
                <span>{col}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tabel Data Gudang */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Search Bar & Table Action Header */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div className="search-wrapper" style={{ flex: 1, maxWidth: '420px', margin: 0 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <line x1="13.5" y1="13.5" x2="18" y2="18" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Cari obat, no batch, rak gudang, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="text-sm text-muted">
              Menampilkan <strong>{filteredRows.length}</strong> dari <strong>{rows.length}</strong> baris data
            </span>
            {searchQuery && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Table with Selected Columns */}
        {selectedColumns.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="16" height="14" rx="2" />
              <line x1="2" y1="8" x2="18" y2="8" />
            </svg>
            <h3>Tidak ada kolom yang dipilih</h3>
            <p>Silakan centang satu atau beberapa kolom pada panel di atas untuk menampilkan data.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '12px' }}
              onClick={handleSelectAllColumns}
            >
              Pilih Semua Kolom
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                  {selectedColumns.map((col) => (
                    <th key={col} style={{ whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={selectedColumns.length + 1}>
                      <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                        <p>Tidak ada data yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                        {idx + 1}
                      </td>
                      {selectedColumns.map((col) => {
                        const rawVal = row[col];
                        const displayVal =
                          rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ''
                            ? String(rawVal)
                            : '-';

                        // Styling khusus berdasarkan jenis kolom
                        const isStok = /stok|qty|jumlah/i.test(col);
                        const isExp = /exp|kadaluwarsa|expired/i.test(col);
                        const isRak = /rak|lokasi/i.test(col);
                        const isKondisi = /kondisi|status/i.test(col);

                        return (
                          <td key={col} style={{ whiteSpace: 'nowrap' }}>
                            {isStok ? (
                              <span style={{ fontWeight: 600, color: 'var(--teal-700)' }}>
                                {displayVal}
                              </span>
                            ) : isExp ? (
                              <span className="badge badge-neutral" style={{ fontSize: '0.786rem' }}>
                                📅 {displayVal}
                              </span>
                            ) : isRak ? (
                              <span className="badge badge-info" style={{ fontSize: '0.786rem' }}>
                                📍 {displayVal}
                              </span>
                            ) : isKondisi ? (
                              <span
                                className={`badge ${
                                  /baik|aman/i.test(displayVal) ? 'badge-success' : 'badge-warning'
                                }`}
                              >
                                {displayVal}
                              </span>
                            ) : (
                              displayVal
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div
          style={{
            padding: 'var(--sp-3) var(--sp-5)',
            background: 'var(--slate-50)',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.786rem',
            color: 'var(--slate-500)',
          }}
        >
          <div>
            Data tersimpan otomatis di browser lokal. Anda dapat mengimpor file Excel baru kapan saja.
          </div>
          <div>
            <Link href="/warehouse" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
              Buka Form Input Barang Datang &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL IMPORT FILE EXCEL DENGAN PILIHAN KOLOM */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h2>Import File Excel ke Gudang</h2>
                <div className="text-muted text-xs" style={{ marginTop: '2px' }}>
                  File: <strong>{modalFileName}</strong> ({modalParsedRows.length} baris terdeteksi)
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowImportModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  background: 'var(--teal-50)',
                  border: '1px solid var(--teal-200)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '0.857rem',
                  color: 'var(--teal-800)',
                }}
              >
                <strong>💡 Pilih Kolom yang Ingin Ditampilkan:</strong>
                <p style={{ marginTop: '4px' }}>
                  Sistem menemukan <strong>{modalDetectedColumns.length} kolom</strong> pada file Excel Anda.
                  Pilih kolom mana saja yang ingin dimunculkan pada tabel gudang. Pilihan ini juga dapat Anda ubah kapan saja di halaman gudang.
                </p>
              </div>

              {/* Action Buttons in Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="text-sm" style={{ fontWeight: 600 }}>
                  Daftar Kolom ({modalSelectedColumns.length}/{modalDetectedColumns.length} dipilih):
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleModalSelectAll}
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleModalDeselectAll}
                  >
                    Hanya Kolom Pertama
                  </button>
                </div>
              </div>

              {/* Checkboxes List in Modal */}
              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '8px',
                  background: 'white',
                }}
              >
                {modalDetectedColumns.map((col) => {
                  const checked = modalSelectedColumns.includes(col);
                  return (
                    <label
                      key={col}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.857rem',
                        cursor: 'pointer',
                        border: checked ? '1px solid var(--teal-500)' : '1px solid var(--slate-200)',
                        background: checked ? 'var(--teal-50)' : 'var(--slate-50)',
                        color: checked ? 'var(--teal-900)' : 'var(--slate-700)',
                        fontWeight: checked ? 600 : 400,
                      }}
                    >
                      <input
                        type="checkbox"
                        accent-color="var(--teal-600)"
                        checked={checked}
                        onChange={() => handleToggleModalColumn(col)}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Sample Data Preview Preview */}
              <div style={{ marginTop: '16px' }}>
                <div className="text-xs text-muted" style={{ marginBottom: '6px' }}>
                  Preview Contoh Baris 1:
                </div>
                <div
                  style={{
                    background: 'var(--slate-100)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.786rem',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {modalSelectedColumns.map((col) => (
                    <span key={col} style={{ marginRight: '16px' }}>
                      <strong>{col}:</strong> {String(modalParsedRows[0]?.[col] ?? '-')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowImportModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmImport}
                disabled={modalSelectedColumns.length === 0}
              >
                Terapkan &amp; Tampilkan di Gudang ({modalParsedRows.length} Baris)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
