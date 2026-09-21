// ============================================================
// Server — Layanan API Apotek (Express Microservice)
// Sangat ringan, cepat, dan terpisah dari beban UI Frontend
// ============================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Database Setup (PostgreSQL or JSON File Store) ──
let pgPool = null;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  pgPool.on('error', (err) => {
    console.error('PostgreSQL Pool Error:', err);
  });
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    // Muat data awal jika berkas belum ada
    const initial = {
      medicines: [
        { id: 'med-001', name: 'Paracetamol 500mg', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 10, buyPrice: 25000, sellPrice: 35000, sellPriceSecondary: 4000, sellPriceBase: 500, minStock: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-002', name: 'Amoxicillin 500mg', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 10, buyPrice: 45000, sellPrice: 62000, sellPriceSecondary: 7000, sellPriceBase: 800, minStock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-003', name: 'CTM 4mg (Chlorpheniramine)', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 10, buyPrice: 8000, sellPrice: 12000, sellPriceSecondary: 1500, sellPriceBase: 200, minStock: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-004', name: 'Antangin Tablet', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 4, secondaryPerTertiary: 25, buyPrice: 32000, sellPrice: 45000, sellPriceSecondary: 2000, sellPriceBase: 500, minStock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-005', name: 'Ibuprofen 400mg', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 5, buyPrice: 18000, sellPrice: 28000, sellPriceSecondary: 6000, sellPriceBase: 700, minStock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-006', name: 'Dexamethasone 0.5mg', category: 'TABLET', baseUnit: 'Tablet', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 10, buyPrice: 15000, sellPrice: 22000, sellPriceSecondary: 2500, sellPriceBase: 300, minStock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-007', name: 'Sanmol Sirup 60ml', category: 'SIRUP', baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null, piecesPerSecondary: null, secondaryPerTertiary: null, buyPrice: 16000, sellPrice: 22500, sellPriceSecondary: null, sellPriceBase: null, minStock: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-008', name: 'OBH Combi Plus Batuk Flu 100ml', category: 'SIRUP', baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null, piecesPerSecondary: null, secondaryPerTertiary: null, buyPrice: 18500, sellPrice: 26000, sellPriceSecondary: null, sellPriceBase: null, minStock: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-009', name: 'Salep Kalpanax Krim 10g', category: 'SALEP', baseUnit: 'Tube', secondaryUnit: null, tertiaryUnit: null, piecesPerSecondary: null, secondaryPerTertiary: null, buyPrice: 11000, sellPrice: 16000, sellPriceSecondary: null, sellPriceBase: null, minStock: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-010', name: 'Betadine Salep Antiseptik 10g', category: 'SALEP', baseUnit: 'Tube', secondaryUnit: null, tertiaryUnit: null, piecesPerSecondary: null, secondaryPerTertiary: null, buyPrice: 14000, sellPrice: 20000, sellPriceSecondary: null, sellPriceBase: null, minStock: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-011', name: 'Insto Regular Tetes Mata 7.5ml', category: 'TETES', baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null, piecesPerSecondary: null, secondaryPerTertiary: null, buyPrice: 12500, sellPrice: 17500, sellPriceSecondary: null, sellPriceBase: null, minStock: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'med-012', name: 'Omeprazole 20mg', category: 'KAPSUL', baseUnit: 'Kapsul', secondaryUnit: 'Strip', tertiaryUnit: 'Box', piecesPerSecondary: 10, secondaryPerTertiary: 3, buyPrice: 22000, sellPrice: 35000, sellPriceSecondary: 12000, sellPriceBase: 1500, minStock: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ],
      batches: [
        { id: 'bat-001', medicineId: 'med-001', batchNumber: 'PCT-2024-A', expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], totalBaseQty: 350, supplierName: 'PT Kimia Farma Trading', receivedDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], status: 'ACTIVE' },
        { id: 'bat-002', medicineId: 'med-001', batchNumber: 'PCT-2024-B', expiryDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0], totalBaseQty: 80, supplierName: 'PT Mensa Binasukses', receivedDate: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0], status: 'NEAR_EXP' },
        { id: 'bat-003', medicineId: 'med-002', batchNumber: 'AMX-2024-01', expiryDate: new Date(Date.now() + 240 * 86400000).toISOString().split('T')[0], totalBaseQty: 180, supplierName: 'PT Anugrah Argon Medica', receivedDate: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0], status: 'ACTIVE' },
        { id: 'bat-004', medicineId: 'med-003', batchNumber: 'CTM-2023-99', expiryDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], totalBaseQty: 20, supplierName: 'PT Enseval Putera Megatrading', receivedDate: new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0], status: 'EXPIRED' }
      ],
      mutations: [],
      sales: [],
      saleItems: [],
      prescriptions: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return { medicines: [], batches: [], mutations: [], sales: [], saleItems: [], prescriptions: [] };
  }
}

function writeStore(data) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Health Check ──
app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy', service: 'apotek-api', uptime: process.uptime() });
});

// ── Medicines Routes ──
app.get('/api/medicines', (req, res) => {
  const store = readStore();
  const search = (req.query.search || '').toLowerCase();
  const category = req.query.category || '';

  let result = store.medicines;
  if (search) {
    result = result.filter(m => m.name.toLowerCase().includes(search));
  }
  if (category && category !== 'ALL') {
    result = result.filter(m => m.category === category);
  }

  res.json({ success: true, data: result });
});

app.post('/api/medicines', (req, res) => {
  try {
    const store = readStore();
    const newMed = {
      ...req.body,
      id: req.body.id || 'med-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.medicines.push(newMed);
    writeStore(store);
    res.status(201).json({ success: true, data: newMed });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal menambahkan obat' });
  }
});

app.put('/api/medicines', (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const store = readStore();
    const idx = store.medicines.findIndex(m => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Obat tidak ditemukan' });
    }
    store.medicines[idx] = {
      ...store.medicines[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeStore(store);
    res.json({ success: true, data: store.medicines[idx] });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal memperbarui obat' });
  }
});

app.delete('/api/medicines/:id', (req, res) => {
  const store = readStore();
  store.medicines = store.medicines.filter(m => m.id !== req.params.id);
  writeStore(store);
  res.json({ success: true, message: 'Obat berhasil dihapus' });
});

// ── Batches Routes ──
app.get('/api/batches', (req, res) => {
  const store = readStore();
  const medicineId = req.query.medicineId;
  let result = store.batches;
  if (medicineId) {
    result = result.filter(b => b.medicineId === medicineId);
  }
  res.json({ success: true, data: result });
});

app.post('/api/batches', (req, res) => {
  try {
    const store = readStore();
    const newBatch = {
      ...req.body,
      id: req.body.id || 'bat-' + Date.now().toString(36),
      status: req.body.status || 'ACTIVE'
    };
    store.batches.push(newBatch);
    writeStore(store);
    res.status(201).json({ success: true, data: newBatch });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal menambahkan batch' });
  }
});

app.patch('/api/batches', (req, res) => {
  try {
    const { id, ...updates } = req.body;
    const store = readStore();
    const idx = store.batches.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Batch tidak ditemukan' });
    }
    store.batches[idx] = { ...store.batches[idx], ...updates };
    writeStore(store);
    res.json({ success: true, data: store.batches[idx] });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal memperbarui batch' });
  }
});

// ── Sales (POS) Routes ──
app.get('/api/sales', (req, res) => {
  const store = readStore();
  res.json({
    success: true,
    data: {
      sales: store.sales || [],
      saleItems: store.saleItems || []
    }
  });
});

app.post('/api/sales', (req, res) => {
  try {
    const { sale, items } = req.body;
    const store = readStore();

    store.sales = store.sales || [];
    store.saleItems = store.saleItems || [];
    store.mutations = store.mutations || [];

    store.sales.push(sale);

    for (const item of items) {
      store.saleItems.push(item);
      if (item.batchId) {
        const batchIdx = store.batches.findIndex(b => b.id === item.batchId);
        if (batchIdx > -1) {
          store.batches[batchIdx].totalBaseQty = Math.max(0, store.batches[batchIdx].totalBaseQty - item.quantity);
        }
      }

      store.mutations.push({
        id: 'mut-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        medicineId: item.medicineId,
        batchId: item.batchId || null,
        mutationType: 'PENJUALAN_KASIR',
        qtyChange: -item.quantity,
        unitUsed: `${item.quantity} ${item.unit}`,
        referenceNumber: sale.invoiceNumber,
        notes: `Penjualan Kasir - Faktur ${sale.invoiceNumber}`,
        createdAt: new Date().toISOString()
      });
    }

    writeStore(store);
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal memproses transaksi penjualan' });
  }
});

// ── Prescription Dispensing Routes ──
app.get('/api/prescriptions', (req, res) => {
  const store = readStore();
  res.json({ success: true, data: store.prescriptions || [] });
});

app.post('/api/prescriptions', (req, res) => {
  try {
    const { prescription, items } = req.body;
    const store = readStore();

    store.prescriptions = store.prescriptions || [];
    store.mutations = store.mutations || [];

    const record = {
      ...prescription,
      id: prescription.id || 'rx-' + Date.now().toString(36),
      items,
      createdAt: new Date().toISOString()
    };

    store.prescriptions.push(record);

    // Pemotongan stok FEFO otomatis untuk setiap obat dalam resep
    for (const item of items) {
      let remainingDeduction = item.baseQty;

      // Ambil batch obat terkait yang aktif diurutkan berdasarkan expiry terdekat (FEFO)
      const batches = store.batches
        .filter(b => b.medicineId === item.medicineId && b.totalBaseQty > 0 && b.status !== 'EXPIRED')
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      for (const batch of batches) {
        if (remainingDeduction <= 0) break;
        const deduct = Math.min(batch.totalBaseQty, remainingDeduction);
        batch.totalBaseQty -= deduct;
        remainingDeduction -= deduct;

        store.mutations.push({
          id: 'mut-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
          medicineId: item.medicineId,
          batchId: batch.id,
          mutationType: 'PENGELUARAN_RESEP',
          qtyChange: -deduct,
          unitUsed: `${item.quantity} ${item.unit}`,
          referenceNumber: prescription.prescriptionNo,
          notes: `Resep Dokter - Pasien: ${prescription.patientName}, No: ${prescription.prescriptionNo}`,
          createdAt: new Date().toISOString()
        });
      }
    }

    writeStore(store);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal memproses pengeluaran resep' });
  }
});

// ── Mutations Routes ──
app.get('/api/mutations', (req, res) => {
  const store = readStore();
  res.json({ success: true, data: store.mutations || [] });
});

app.post('/api/mutations', (req, res) => {
  try {
    const store = readStore();
    store.mutations = store.mutations || [];

    const mutation = {
      ...req.body,
      id: req.body.id || 'mut-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };

    store.mutations.push(mutation);
    writeStore(store);
    res.status(201).json({ success: true, data: mutation });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Gagal mencatat mutasi stok' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Service] Apotek REST API berjalan di http://0.0.0.0:${PORT}`);
});
