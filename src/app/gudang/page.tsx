'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { generateId } from '@/lib/formatters';
import { initDB, addMedicine, addBatch } from '@/database/db';
import { Medicine, StockBatch, MedicineCategory, BatchStatus } from '@/database/schema';

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

  // Checkbox Selection State
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Modal Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'bulk' | 'all';
    rowId?: string;
    rowName?: string;
    rowCode?: string;
  } | null>(null);

  // Modal Tambah Obat Manual State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    'Kode Barang': '',
    'Nama Barang': '',
    'Kategori': 'TABLET',
    'No Batch': '',
    'Stok Fisik': 100 as number | string,
    'Satuan': 'Biji',
    'Tanggal Exp': '',
    'Lokasi Rak': 'Rak A-01 (Tablet)',
    'PBF Distributor': 'PT Kimia Farma',
    'Kondisi': 'Baik',
    syncToPos: true,
    hargaBeli: 500 as number | string,
    hargaJual: 1000 as number | string,
    extraFields: {} as Record<string, string>,
  });

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

      if (storedRows !== null && storedAllCols !== null) {
        const parsedRows: Record<string, any>[] = JSON.parse(storedRows);
        const parsedAllCols: string[] = JSON.parse(storedAllCols);
        const parsedSelectedCols: string[] = storedSelectedCols
          ? JSON.parse(storedSelectedCols)
          : parsedAllCols;

        // Pastikan setiap baris memiliki _rowId unik
        const rowsWithId = parsedRows.map((r, idx) => ({
          _rowId: r._rowId || `row_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...r,
        }));

        setRows(rowsWithId);
        setAllColumns(parsedAllCols);
        setSelectedColumns(parsedSelectedCols);
        setFileName(storedFileName || 'Data Gudang');
        setLastImportedTime(storedTime || '');
      } else {
        // Gunakan data bawaan awal
        const defaultRowsWithId = DEFAULT_ROWS.map((r, idx) => ({
          _rowId: `default_${idx}_${Date.now()}`,
          ...r,
        }));
        setRows(defaultRowsWithId);
        setAllColumns(DEFAULT_COLUMNS);
        setSelectedColumns(DEFAULT_COLUMNS);
        setFileName('Data Master Gudang (Default)');
        setLastImportedTime(new Date().toISOString());
      }
    } catch (e) {
      console.error('Error loading warehouse data:', e);
      const defaultRowsWithId = DEFAULT_ROWS.map((r, idx) => ({
        _rowId: `default_${idx}_${Date.now()}`,
        ...r,
      }));
      setRows(defaultRowsWithId);
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

    const rowsWithId = newRows.map((r, idx) => ({
      _rowId: r._rowId || `row_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...r,
    }));

    localStorage.setItem(STORAGE_KEYS.rows, JSON.stringify(rowsWithId));
    localStorage.setItem(STORAGE_KEYS.allCols, JSON.stringify(allCols));
    localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(selCols));
    localStorage.setItem(STORAGE_KEYS.fileName, name);
    localStorage.setItem(STORAGE_KEYS.importTime, now);

    setRows(rowsWithId);
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
    const defaultCols = allColumns.slice(0, Math.min(10, allColumns.length));
    setSelectedColumns(defaultCols);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.selectedCols, JSON.stringify(defaultCols));
    }
    showNotification('success', 'Pilihan kolom dikembalikan ke default.');
  };

  // ----------------------------------------------------
  // FITUR HAPUS DATA GUDANG (Single, Bulk, & Clear All)
  // ----------------------------------------------------
  const handleOpenDeleteSingle = (row: Record<string, any>) => {
    setDeleteTarget({
      type: 'single',
      rowId: row._rowId,
      rowName: row['Nama Barang'] || row['Nama Obat'] || row['Nama'] || 'Barang ini',
      rowCode: row['Kode Barang'] || row['Kode'] || '',
    });
    setShowDeleteModal(true);
  };

  const handleOpenBulkDelete = () => {
    if (selectedRowIds.size === 0) return;
    setDeleteTarget({
      type: 'bulk',
    });
    setShowDeleteModal(true);
  };

  const handleOpenClearAll = () => {
    if (rows.length === 0) {
      showNotification('error', 'Gudang sudah kosong.');
      return;
    }
    setDeleteTarget({
      type: 'all',
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single') {
      const nextRows = rows.filter((r) => r._rowId !== deleteTarget.rowId);
      saveToStorage(nextRows, allColumns, selectedColumns, fileName);
      if (deleteTarget.rowId) {
        setSelectedRowIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.rowId!);
          return next;
        });
      }
      showNotification('success', `Data "${deleteTarget.rowName}" berhasil dihapus dari gudang.`);
    } else if (deleteTarget.type === 'bulk') {
      const count = selectedRowIds.size;
      const nextRows = rows.filter((r) => !selectedRowIds.has(r._rowId));
      saveToStorage(nextRows, allColumns, selectedColumns, fileName);
      setSelectedRowIds(new Set());
      showNotification('success', `${count} data barang terpilih berhasil dihapus dari gudang.`);
    } else if (deleteTarget.type === 'all') {
      saveToStorage([], allColumns, selectedColumns, 'Gudang Kosong (Input Mandiri)');
      setSelectedRowIds(new Set());
      showNotification('success', 'Seluruh data gudang telah dikosongkan. Anda dapat mulai menginput data baru!');
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Checkbox Selection Handlers
  const handleToggleSelectRow = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
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

  const isAllFilteredSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedRowIds.has(r._rowId));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.delete(r._rowId));
        return next;
      });
    } else {
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        filteredRows.forEach((r) => next.add(r._rowId));
        return next;
      });
    }
  };

  // ----------------------------------------------------
  // FITUR TAMBAH OBAT SECARA MANUAL
  // ----------------------------------------------------
  const generateNextMedicineCode = () => {
    const codes = rows
      .map((r) => String(r['Kode Barang'] || r['Kode'] || ''))
      .filter((c) => /OBT-\d+/i.test(c));

    let maxNum = 0;
    codes.forEach((c) => {
      const match = c.match(/OBT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const nextNum = (maxNum || rows.length) + 1;
    return `OBT-${String(nextNum).padStart(3, '0')}`;
  };

  const generateNextBatchNumber = (kategori: string) => {
    const year = new Date().getFullYear();
    const prefix = kategori.substring(0, 3).toUpperCase() || 'BCH';
    const rand = Math.floor(10 + Math.random() * 90);
    return `${prefix}-${year}-B${rand}`;
  };

  const handleOpenAddModal = () => {
    const defaultExp = new Date();
    defaultExp.setFullYear(defaultExp.getFullYear() + 2);
    const expStr = defaultExp.toISOString().split('T')[0];

    const standardCols = [
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
    const extraCols: Record<string, string> = {};
    allColumns.forEach((c) => {
      if (!standardCols.includes(c) && c !== '_rowId') {
        extraCols[c] = '';
      }
    });

    setAddForm({
      'Kode Barang': generateNextMedicineCode(),
      'Nama Barang': '',
      'Kategori': 'TABLET',
      'No Batch': generateNextBatchNumber('TABLET'),
      'Stok Fisik': 100,
      'Satuan': 'Biji',
      'Tanggal Exp': expStr,
      'Lokasi Rak': 'Rak A-01 (Tablet)',
      'PBF Distributor': 'PT Kimia Farma',
      'Kondisi': 'Baik',
      syncToPos: true,
      hargaBeli: 500,
      hargaJual: 1000,
      extraFields: extraCols,
    });
    setShowAddModal(true);
  };

  const handleSaveManualMedicine = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm['Nama Barang'].trim()) {
      showNotification('error', 'Nama barang / obat wajib diisi!');
      return;
    }

    const stokNum = parseFloat(String(addForm['Stok Fisik']));
    if (isNaN(stokNum) || stokNum < 0) {
      showNotification('error', 'Stok fisik harus berupa angka non-negatif!');
      return;
    }

    if (!addForm['Tanggal Exp']) {
      showNotification('error', 'Tanggal kadaluarsa wajib diisi!');
      return;
    }

    const newRowId = `manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRow: Record<string, any> = {
      _rowId: newRowId,
      'Kode Barang': addForm['Kode Barang'].trim() || generateNextMedicineCode(),
      'Nama Barang': addForm['Nama Barang'].trim(),
      'Kategori': addForm['Kategori'],
      'No Batch': addForm['No Batch'].trim() || generateNextBatchNumber(addForm['Kategori']),
      'Stok Fisik': stokNum,
      'Satuan': addForm['Satuan'].trim() || 'Biji',
      'Tanggal Exp': addForm['Tanggal Exp'],
      'Lokasi Rak': addForm['Lokasi Rak'].trim() || 'Rak Utama',
      'PBF Distributor': addForm['PBF Distributor'].trim() || 'Distributor Lokal',
      'Kondisi': addForm['Kondisi'],
      ...addForm.extraFields,
    };

    // Pastikan allColumns dan selectedColumns menyertakan kolom standar jika belum ada
    const standardCols = [
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
    let nextAllCols = [...allColumns];
    let nextSelCols = [...selectedColumns];
    standardCols.forEach((col) => {
      if (!nextAllCols.includes(col)) {
        nextAllCols.push(col);
      }
      if (!nextSelCols.includes(col)) {
        nextSelCols.push(col);
      }
    });

    const nextRows = [newRow, ...rows];
    saveToStorage(nextRows, nextAllCols, nextSelCols, fileName || 'Data Gudang');

    // Sinkronisasi ke Katalog Obat & Kasir POS jika dicentang
    if (addForm.syncToPos) {
      try {
        initDB();
        const medId = generateId();
        const buyPrice = parseFloat(String(addForm.hargaBeli)) || 0;
        const sellPrice = parseFloat(String(addForm.hargaJual)) || (buyPrice > 0 ? buyPrice * 1.3 : 1000);

        const newMedicine: Medicine = {
          id: medId,
          name: newRow['Nama Barang'],
          category: (newRow['Kategori'] as MedicineCategory) || MedicineCategory.TABLET,
          baseUnit: newRow['Satuan'],
          secondaryUnit: null,
          tertiaryUnit: null,
          piecesPerSecondary: null,
          secondaryPerTertiary: null,
          buyPrice: buyPrice,
          sellPrice: sellPrice,
          sellPriceSecondary: null,
          sellPriceBase: sellPrice,
          minStock: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addMedicine(newMedicine);

        const newBatch: StockBatch = {
          id: generateId(),
          medicineId: medId,
          batchNumber: newRow['No Batch'],
          expiryDate: newRow['Tanggal Exp'],
          totalBaseQty: stokNum,
          supplierName: newRow['PBF Distributor'],
          receivedDate: new Date().toISOString().split('T')[0],
          status: BatchStatus.ACTIVE,
        };
        addBatch(newBatch);

        showNotification('success', `Obat "${newRow['Nama Barang']}" berhasil ditambahkan ke gudang & disinkronkan ke Kasir POS!`);
      } catch (err) {
        console.error('POS sync error:', err);
        showNotification('success', `Obat "${newRow['Nama Barang']}" berhasil ditambahkan ke gudang!`);
      }
    } else {
      showNotification('success', `Obat "${newRow['Nama Barang']}" berhasil ditambahkan ke gudang!`);
    }

    setShowAddModal(false);
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

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawRows.length === 0) {
          showNotification('error', 'Tidak ada baris data yang ditemukan di dalam file.');
          setIsProcessingFile(false);
          return;
        }

        setModalDetectedColumns(detectedCols);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  // Reset ke data contoh bawaan
  const handleResetToDefaultData = () => {
    if (confirm('Kembalikan data tabel gudang ke data sampel bawaan awal?')) {
      saveToStorage(DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_COLUMNS, 'Data Master Gudang (Default)');
      showNotification('success', 'Data gudang berhasil dikembalikan ke sampel default.');
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

  // Hitung total kuantitas stok
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
            Pusat data stok fisik gudang apotek. Anda dapat menginput obat manual, mengimpor file Excel, memilih kolom tampilan, atau mengosongkan data untuk input mandiri.
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
          />

          {/* Tombol Tambah Obat Manual */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddModal}
            title="Tambah data obat baru ke gudang secara manual"
            style={{ background: 'var(--teal-600)', color: '#ffffff' }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="10" y1="4" x2="10" y2="16" strokeLinecap="round" />
              <line x1="4" y1="10" x2="16" y2="10" strokeLinecap="round" />
            </svg>
            <span>+ Tambah Obat Manual</span>
          </button>

          {/* Tombol Import Excel */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Upload file Excel (.xlsx / .xls)"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M10 3v11M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Import Excel</span>
          </button>

          {/* Tombol Ekspor Excel */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportView}
            title="Ekspor kolom terpilih ke Excel"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M14 8l-4-4-4 4M10 4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Ekspor</span>
          </button>

          {/* Tombol Unduh Template */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadTemplate}
            title="Download file contoh template Excel gudang"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3v10M6 9l4 4 4-4M3 17h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Template</span>
          </button>

          {/* Tombol Kosongkan Gudang */}
          <button
            type="button"
            className="btn"
            style={{
              background: 'var(--red-50)',
              color: 'var(--red-600)',
              border: '1px solid var(--red-200)',
            }}
            onClick={handleOpenClearAll}
            title="Hapus seluruh data gudang agar bisa diinput sendiri dari awal"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2M5 6v10a2 2 0 002 2h6a2 2 0 002-2V6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Kosongkan Gudang</span>
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
              {selectedColumns.length}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)', fontWeight: 500 }}>
                / {allColumns.length}
              </span>
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
                ? `Diperbarui ${new Date(lastImportedTime).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Sumber Data Aktif'}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL UTAMA: PILIHAN KOLOM EXCEL YANG INGIN DITAMPILKAN DI GUDANG */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              title="Reset kembali ke sampel data awal jika dibutuhkan"
            >
              Muat Sampel Awal
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

      {/* FLOATING / STICKY BULK ACTION BAR KETIKA ADA ITEM YANG DICENTANG */}
      {selectedRowIds.size > 0 && (
        <div
          style={{
            background: 'var(--slate-900)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--sp-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: 'var(--teal-500)',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              {selectedRowIds.size}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Barang gudang dipilih untuk tindakan massal
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
              onClick={() => setSelectedRowIds(new Set())}
            >
              Batalkan Pilihan
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{ background: 'var(--red-600)', color: '#ffffff', fontWeight: 600 }}
              onClick={handleOpenBulkDelete}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2M5 6v10a2 2 0 002 2h6a2 2 0 002-2V6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Hapus {selectedRowIds.size} Barang Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* TABEL DATA GUDANG / EMPTY STATE */}
      {rows.length === 0 ? (
        /* EMPTY STATE: TAMPILAN JIKA GUDANG TELAH DIKOSONGKAN AGAR BISA DIINPUT SENDIRI */
        <div
          className="card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--slate-300)',
            margin: 'var(--sp-4) 0',
          }}
        >
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'var(--teal-50)',
              color: 'var(--teal-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--sp-4)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '8px' }}>
            Data Gudang Apotek Masih Kosong
          </h2>
          <p
            style={{
              color: 'var(--slate-500)',
              maxWidth: '540px',
              margin: '0 auto var(--sp-6)',
              fontSize: '0.95rem',
              lineHeight: 1.5,
            }}
          >
            Data gudang telah bersih! Sekarang Anda dapat menginput sendiri data obat apotek secara manual satu per satu, atau mengimpor file Excel stok gudang Anda.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
              style={{ padding: '10px 20px', fontSize: '0.95rem', background: 'var(--teal-600)', color: '#ffffff' }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="10" y1="4" x2="10" y2="16" strokeLinecap="round" />
                <line x1="4" y1="10" x2="16" y2="10" strokeLinecap="round" />
              </svg>
              <span>+ Tambah Obat Manual</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '10px 20px', fontSize: '0.95rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M10 3v11M6 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Import File Excel</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleDownloadTemplate}
              style={{ padding: '10px 20px', fontSize: '0.95rem' }}
            >
              <span>Unduh Template Excel</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleResetToDefaultData}
              style={{ padding: '10px 16px', fontSize: '0.9rem', color: 'var(--slate-500)' }}
            >
              <span>Muat Sampel Bawaan</span>
            </button>
          </div>
        </div>
      ) : (
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

          {/* Dynamic Table with Selected Columns & Action Column */}
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
                    {/* Master Checkbox Header */}
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleToggleSelectAll}
                        title="Pilih semua baris yang tampil"
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--teal-600)' }}
                      />
                    </th>
                    <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                    {selectedColumns.map((col) => (
                      <th key={col} style={{ whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                    {/* Kolom Aksi */}
                    <th style={{ width: '70px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={selectedColumns.length + 3}>
                        <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                          <p>Tidak ada data yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => {
                      const isSelected = selectedRowIds.has(row._rowId);
                      return (
                        <tr
                          key={row._rowId || idx}
                          style={{
                            background: isSelected ? 'var(--teal-50)' : undefined,
                            transition: 'background-color 0.15s',
                          }}
                        >
                          {/* Row Checkbox */}
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(row._rowId)}
                              style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--teal-600)' }}
                            />
                          </td>

                          {/* Row Number */}
                          <td style={{ textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                            {idx + 1}
                          </td>

                          {/* Dynamic Data Columns */}
                          {selectedColumns.map((col) => {
                            const rawVal = row[col];
                            const displayVal =
                              rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ''
                                ? String(rawVal)
                                : '-';

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

                          {/* Tombol Hapus Baris */}
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--red-600)', padding: '5px 8px' }}
                              title="Hapus baris barang ini dari gudang"
                              onClick={() => handleOpenDeleteSingle(row)}
                            >
                              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2M5 6v10a2 2 0 002 2h6a2 2 0 002-2V6" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="8" y1="10" x2="8" y2="14" strokeLinecap="round" />
                                <line x1="12" y1="10" x2="12" y2="14" strokeLinecap="round" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '0.786rem',
              color: 'var(--slate-500)',
            }}
          >
            <div>
              Data tersimpan otomatis di browser lokal. Anda dapat menginput obat secara manual atau mengimpor file Excel kapan saja.
            </div>
            <div>
              <Link href="/warehouse" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
                Buka Form Input Barang Datang &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL KONFIRMASI HAPUS (SINGLE, BULK, ATAU SEMUA)             */}
      {/* ============================================================ */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--red-100)',
                  color: 'var(--red-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2M5 6v10a2 2 0 002 2h6a2 2 0 002-2V6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="10" y1="11" x2="10" y2="15" strokeLinecap="round" />
                  <line x1="14" y1="11" x2="14" y2="15" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div style={{ padding: '0 var(--sp-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
                {deleteTarget.type === 'single'
                  ? 'Hapus Barang dari Gudang?'
                  : deleteTarget.type === 'bulk'
                  ? `Hapus ${selectedRowIds.size} Barang Terpilih?`
                  : 'Kosongkan Seluruh Data Gudang?'}
              </h2>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {deleteTarget.type === 'single' ? (
                  <>
                    Apakah Anda yakin ingin menghapus data <strong>{deleteTarget.rowName}</strong>
                    {deleteTarget.rowCode ? ` (Kode: ${deleteTarget.rowCode})` : ''} dari gudang apotek? Tindakan ini tidak dapat dibatalkan.
                  </>
                ) : deleteTarget.type === 'bulk' ? (
                  <>
                    Apakah Anda yakin ingin menghapus <strong>{selectedRowIds.size} barang</strong> yang dipilih? Data yang terhapus tidak dapat dikembalikan.
                  </>
                ) : (
                  <>
                    <strong>PERHATIAN:</strong> Seluruh <strong>{rows.length} data barang</strong> di gudang akan dihapus secara permanen sehingga Anda dapat mulai menginput data Anda sendiri secara mandiri.
                    <br /><br />
                    <em>Catatan: Anda tetap dapat memuat kembali data sampel bawaan kapan saja melalui tombol &quot;Muat Sampel Awal&quot;.</em>
                  </>
                )}
              </p>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn"
                style={{ background: 'var(--red-600)', color: '#ffffff', fontWeight: 600 }}
                onClick={handleConfirmDelete}
              >
                {deleteTarget.type === 'all'
                  ? 'Ya, Kosongkan Semua'
                  : deleteTarget.type === 'bulk'
                  ? `Ya, Hapus (${selectedRowIds.size})`
                  : 'Ya, Hapus Barang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL INPUT TAMBAH DATA OBAT SECARA MANUAL                   */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--teal-50)',
                    color: 'var(--teal-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="10" y1="4" x2="10" y2="16" strokeLinecap="round" />
                    <line x1="4" y1="10" x2="16" y2="10" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Tambah Data Obat ke Gudang</h2>
                  <div className="text-muted text-xs">Masukkan data obat secara manual ke dalam inventori gudang apotek</div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveManualMedicine}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px 24px' }}>
                {/* Row 1: Kode Barang & Kategori */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Kode Barang / SKU</span>
                      <button
                        type="button"
                        style={{ color: 'var(--teal-600)', fontSize: '0.78rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => setAddForm((prev) => ({ ...prev, 'Kode Barang': generateNextMedicineCode() }))}
                      >
                        ⚡ Auto Code
                      </button>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. OBT-009"
                      value={addForm['Kode Barang']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, 'Kode Barang': e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Kategori Obat</label>
                    <select
                      className="form-input"
                      value={addForm['Kategori']}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        let defaultSatuan = 'Biji';
                        let defaultRak = 'Rak A-01 (Tablet)';
                        if (newCat === 'SIRUP') {
                          defaultSatuan = 'Botol';
                          defaultRak = 'Rak B-01 (Sirup)';
                        } else if (newCat === 'SALEP') {
                          defaultSatuan = 'Tube';
                          defaultRak = 'Rak C-01 (Salep & Gel)';
                        } else if (newCat === 'TETES') {
                          defaultSatuan = 'Botol';
                          defaultRak = 'Rak C-02 (Cairan Luar)';
                        } else if (newCat === 'KAPSUL') {
                          defaultSatuan = 'Kapsul';
                          defaultRak = 'Rak A-04 (Kapsul)';
                        } else if (newCat === 'INJEKSI') {
                          defaultSatuan = 'Ampul';
                          defaultRak = 'Kulkas Farmasi (2-8°C)';
                        } else if (newCat === 'ALKES') {
                          defaultSatuan = 'Pcs';
                          defaultRak = 'Rak Alkes 01';
                        }

                        setAddForm((prev) => ({
                          ...prev,
                          Kategori: newCat,
                          Satuan: defaultSatuan,
                          'Lokasi Rak': defaultRak,
                          'No Batch': generateNextBatchNumber(newCat),
                        }));
                      }}
                    >
                      <option value="TABLET">TABLET</option>
                      <option value="SIRUP">SIRUP</option>
                      <option value="SALEP">SALEP</option>
                      <option value="KAPSUL">KAPSUL</option>
                      <option value="TETES">TETES</option>
                      <option value="INJEKSI">INJEKSI</option>
                      <option value="ALKES">ALKES</option>
                      <option value="LAINNYA">LAINNYA</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Nama Barang (Full Width) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Nama Barang / Obat <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Paracetamol 500mg, Sanmol Sirup 60ml"
                    value={addForm['Nama Barang']}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, 'Nama Barang': e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                {/* Row 3: No Batch & Tanggal Exp */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>No. Batch</span>
                      <button
                        type="button"
                        style={{ color: 'var(--teal-600)', fontSize: '0.78rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => setAddForm((prev) => ({ ...prev, 'No Batch': generateNextBatchNumber(addForm['Kategori']) }))}
                      >
                        ⚡ Auto Batch
                      </button>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PCT-2026-A1"
                      value={addForm['No Batch']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, 'No Batch': e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Tanggal Kadaluarsa (Exp Date) <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={addForm['Tanggal Exp']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, 'Tanggal Exp': e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Row 4: Stok Fisik & Satuan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      Stok Fisik Gudang <span style={{ color: 'var(--red-500)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 100"
                      value={addForm['Stok Fisik']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, 'Stok Fisik': e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Satuan Barang</label>
                    <input
                      type="text"
                      list="satuan-gudang-options"
                      className="form-input"
                      placeholder="Pilih atau ketik satuan..."
                      value={addForm['Satuan']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, Satuan: e.target.value }))}
                    />
                    <datalist id="satuan-gudang-options">
                      <option value="Biji" />
                      <option value="Strip" />
                      <option value="Box" />
                      <option value="Botol" />
                      <option value="Tube" />
                      <option value="Pcs" />
                      <option value="Kapsul" />
                      <option value="Ampul" />
                      <option value="Vial" />
                      <option value="Sachet" />
                    </datalist>
                  </div>
                </div>

                {/* Row 5: Lokasi Rak & Kondisi */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lokasi Rak / Penyimpanan</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rak A-01 (Tablet), Kulkas 01"
                      value={addForm['Lokasi Rak']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, 'Lokasi Rak': e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Kondisi Barang</label>
                    <select
                      className="form-input"
                      value={addForm['Kondisi']}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, Kondisi: e.target.value }))}
                    >
                      <option value="Baik">Baik (Segel Aman)</option>
                      <option value="Suhu Terjaga">Suhu Terjaga (Kulkas 2-8°C)</option>
                      <option value="Segel Terbuka">Segel Terbuka</option>
                      <option value="Rusak">Rusak</option>
                      <option value="Karantina">Karantina</option>
                    </select>
                  </div>
                </div>

                {/* Row 6: PBF Distributor */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">PBF Distributor / Supplier</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PT Kimia Farma, PT Kalbe Farma, PT Sanbe Farma"
                    value={addForm['PBF Distributor']}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, 'PBF Distributor': e.target.value }))}
                  />
                </div>

                {/* Section: Sinkronisasi ke POS / Kasir */}
                <div
                  style={{
                    background: 'var(--teal-50)',
                    border: '1px solid var(--teal-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginTop: '4px',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: 'var(--teal-900)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={addForm.syncToPos}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, syncToPos: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--teal-600)', cursor: 'pointer' }}
                    />
                    <span>Sinkronkan juga ke Katalog Obat &amp; Kasir POS</span>
                  </label>
                  <p className="text-muted text-xs" style={{ margin: '4px 0 0 26px' }}>
                    Jika dicentang, obat ini langsung tercatat di Katalog Obat dan dapat langsung dijual kepada pasien di halaman Kasir POS.
                  </p>

                  {addForm.syncToPos && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginTop: '12px',
                        marginLeft: '26px',
                      }}
                    >
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>
                          Harga Modal / Beli (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          placeholder="e.g. 500"
                          value={addForm.hargaBeli}
                          onChange={(e) => setAddForm((prev) => ({ ...prev, hargaBeli: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>
                          Harga Jual Pasien (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          placeholder="e.g. 1000"
                          value={addForm.hargaJual}
                          onChange={(e) => setAddForm((prev) => ({ ...prev, hargaJual: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Extra fields from imported columns if any */}
                {Object.keys(addForm.extraFields).length > 0 && (
                  <div
                    style={{
                      background: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ fontSize: '0.857rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '10px' }}>
                      Kolom Tambahan dari File Excel yang Aktif:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {Object.keys(addForm.extraFields).map((extraKey) => (
                        <div key={extraKey}>
                          <label className="form-label" style={{ fontSize: '0.8rem' }}>
                            {extraKey}
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder={`Isi ${extraKey}...`}
                            value={addForm.extraFields[extraKey]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddForm((prev) => ({
                                ...prev,
                                extraFields: { ...prev.extraFields, [extraKey]: val },
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: 'var(--teal-600)', color: '#ffffff' }}
                >
                  Simpan Obat ke Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL IMPORT FILE EXCEL DENGAN PILIHAN KOLOM                 */}
      {/* ============================================================ */}
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
                        checked={checked}
                        onChange={() => handleToggleModalColumn(col)}
                        style={{ accentColor: 'var(--teal-600)' }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Sample Data Preview */}
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
