// ============================================================
// DB — localStorage CRUD helpers
// ============================================================

import {
  Medicine,
  StockBatch,
  StockMutation,
  Sale,
  SaleItem,
  BatchStatus,
} from './schema';
import {
  seedMedicines,
  seedBatches,
  seedMutations,
  seedSales,
  seedSaleItems,
} from './seed';
import { daysUntilExpiry } from '@/lib/formatters';

const KEYS = {
  medicines: 'apotek_medicines',
  batches: 'apotek_batches',
  mutations: 'apotek_mutations',
  sales: 'apotek_sales',
  saleItems: 'apotek_sale_items',
  seeded: 'apotek_seeded',
} as const;

function getStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

const PURGE_KEY = 'apotek_clean_slate_v1';

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  setStore(KEYS.medicines, []);
  setStore(KEYS.batches, []);
  setStore(KEYS.mutations, []);
  setStore(KEYS.sales, []);
  setStore(KEYS.saleItems, []);
  localStorage.setItem('apotek_gudang_rows', JSON.stringify([]));
  localStorage.setItem('apotek_gudang_file_name', 'Data Master Gudang');
  localStorage.setItem(KEYS.seeded, 'true');
  localStorage.setItem(PURGE_KEY, 'true');
}

// ── Initialize / Seed ──

export function initDB(): void {
  if (typeof window === 'undefined') return;

  // Satu kali pembersihan total data dummy lama bagi user yang sudah deploy
  if (!localStorage.getItem(PURGE_KEY)) {
    clearAllData();
    return;
  }

  if (!localStorage.getItem(KEYS.seeded)) {
    clearAllData();
    return;
  }

  // Migrasi otomatis data lama: ubah baseUnit 'Tablet' menjadi 'Biji'
  const existingMeds = getStore<Medicine>(KEYS.medicines);
  if (existingMeds.length > 0) {
    let hasChanges = false;
    const updated = existingMeds.map((m) => {
      if (m.baseUnit && m.baseUnit.toLowerCase() === 'tablet') {
        hasChanges = true;
        return { ...m, baseUnit: 'Biji' };
      }
      return m;
    });
    if (hasChanges) {
      setStore(KEYS.medicines, updated);
    }
  }
}

// ── Medicines ──

export function getMedicines(): Medicine[] {
  const meds = getStore<Medicine>(KEYS.medicines);
  return meds.map((m) => {
    if (m.baseUnit && m.baseUnit.toLowerCase() === 'tablet') {
      return { ...m, baseUnit: 'Biji' };
    }
    return m;
  });
}

export function getMedicineById(id: string): Medicine | undefined {
  return getMedicines().find((m) => m.id === id);
}

export function addMedicine(med: Medicine): void {
  const all = getMedicines();
  all.push(med);
  setStore(KEYS.medicines, all);
}

export function updateMedicine(id: string, updates: Partial<Medicine>): void {
  const all = getMedicines();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  setStore(KEYS.medicines, all);
}

export function deleteMedicine(id: string): void {
  setStore(
    KEYS.medicines,
    getMedicines().filter((m) => m.id !== id)
  );
}

// ── StockBatches ──

export function getBatches(): StockBatch[] {
  return getStore<StockBatch>(KEYS.batches);
}

export function getBatchesByMedicine(medicineId: string): StockBatch[] {
  return getBatches().filter((b) => b.medicineId === medicineId);
}

export function addBatch(batch: StockBatch): void {
  const all = getBatches();
  all.push(batch);
  setStore(KEYS.batches, all);
}

export function updateBatch(id: string, updates: Partial<StockBatch>): void {
  const all = getBatches();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  setStore(KEYS.batches, all);
}

/**
 * Reduce stock from a specific batch
 * Returns false if insufficient stock
 */
export function reduceStock(batchId: string, baseQty: number): boolean {
  const all = getBatches();
  const idx = all.findIndex((b) => b.id === batchId);
  if (idx === -1) return false;
  if (all[idx].totalBaseQty < baseQty) return false;
  all[idx].totalBaseQty -= baseQty;
  setStore(KEYS.batches, all);
  return true;
}

/**
 * Deduct stock across active batches using FEFO order.
 * Can deduct across multiple batches if necessary.
 * Returns array of deduction details or null if insufficient total stock.
 */
export function deductStockFEFO(
  medicineId: string,
  baseQty: number
): { batchId: string; batchNumber: string; deductedQty: number }[] | null {
  const totalAvailable = getTotalStock(medicineId);
  if (totalAvailable < baseQty) return null;

  const all = getBatches();
  const activeBatches = all
    .filter(
      (b) =>
        b.medicineId === medicineId &&
        b.status !== BatchStatus.EXPIRED &&
        b.status !== BatchStatus.RETURNED &&
        b.totalBaseQty > 0 &&
        daysUntilExpiry(b.expiryDate) > 0
    )
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

  let remaining = baseQty;
  const deductions: { batchId: string; batchNumber: string; deductedQty: number }[] = [];

  for (const batch of activeBatches) {
    if (remaining <= 0) break;
    const toTake = Math.min(batch.totalBaseQty, remaining);
    batch.totalBaseQty -= toTake;
    remaining -= toTake;
    deductions.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      deductedQty: toTake,
    });
  }

  if (remaining > 0) return null;

  setStore(KEYS.batches, all);
  return deductions;
}

/**
 * Get total stock for a medicine across all active (non-expired, non-returned) batches
 */
export function getTotalStock(medicineId: string): number {
  return getBatches()
    .filter(
      (b) =>
        b.medicineId === medicineId &&
        b.status !== BatchStatus.EXPIRED &&
        b.status !== BatchStatus.RETURNED
    )
    .reduce((sum, b) => sum + b.totalBaseQty, 0);
}

/**
 * Get the best batch to sell from (FEFO: First Expired, First Out)
 * Only returns active batches that are not expired
 */
export function getBestBatchForSale(medicineId: string): StockBatch | null {
  const active = getBatches()
    .filter(
      (b) =>
        b.medicineId === medicineId &&
        b.totalBaseQty > 0 &&
        daysUntilExpiry(b.expiryDate) > 0
    )
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );
  return active[0] ?? null;
}

// ── StockMutations ──

export function getMutations(): StockMutation[] {
  return getStore<StockMutation>(KEYS.mutations);
}

export function getMutationsByMedicine(medicineId: string): StockMutation[] {
  return getMutations().filter((m) => m.medicineId === medicineId);
}

export function addMutation(mutation: StockMutation): void {
  const all = getMutations();
  all.push(mutation);
  setStore(KEYS.mutations, all);
}

// ── Sales ──

export function getSales(): Sale[] {
  return getStore<Sale>(KEYS.sales);
}

export function getTodaySales(): Sale[] {
  const todayStr = new Date().toISOString().split('T')[0];
  return getSales().filter((s) => s.createdAt.startsWith(todayStr));
}

export function addSale(sale: Sale): void {
  const all = getSales();
  all.push(sale);
  setStore(KEYS.sales, all);
}

// ── Sale Items ──

export function getSaleItems(): SaleItem[] {
  return getStore<SaleItem>(KEYS.saleItems);
}

export function getSaleItemsBySale(saleId: string): SaleItem[] {
  return getSaleItems().filter((si) => si.saleId === saleId);
}

export function addSaleItem(item: SaleItem): void {
  const all = getSaleItems();
  all.push(item);
  setStore(KEYS.saleItems, all);
}

export function addSaleItems(items: SaleItem[]): void {
  const all = getSaleItems();
  all.push(...items);
  setStore(KEYS.saleItems, all);
}

/**
 * Reset all data and re-seed
 */
export function resetDB(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  initDB();
}
