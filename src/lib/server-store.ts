// ============================================================
// Server Store — File-backed JSON database for API routes
// Persists in data/store.json on the server
// ============================================================

import fs from 'fs';
import path from 'path';
import {
  Medicine,
  StockBatch,
  StockMutation,
  Sale,
  SaleItem,
  BatchStatus,
} from '@/database/schema';
import {
  seedMedicines,
  seedBatches,
  seedMutations,
  seedSales,
  seedSaleItems,
} from '@/database/seed';

interface DatabaseData {
  medicines: Medicine[];
  batches: StockBatch[];
  mutations: StockMutation[];
  sales: Sale[];
  saleItems: SaleItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readServerDB(): DatabaseData {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseData = {
      medicines: seedMedicines,
      batches: seedBatches,
      mutations: seedMutations,
      sales: seedSales,
      saleItems: seedSaleItems,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading server DB file, reinitializing:', err);
    const fallbackData: DatabaseData = {
      medicines: seedMedicines,
      batches: seedBatches,
      mutations: seedMutations,
      sales: seedSales,
      saleItems: seedSaleItems,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackData, null, 2), 'utf-8');
    return fallbackData;
  }
}

export function writeServerDB(data: DatabaseData): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
