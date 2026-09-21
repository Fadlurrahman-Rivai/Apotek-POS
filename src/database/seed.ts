// ============================================================
// Seed — Realistic Indonesian pharmacy data
// ============================================================

import {
  Medicine,
  StockBatch,
  StockMutation,
  Sale,
  SaleItem,
  MedicineCategory,
  MutationType,
  BatchStatus,
  SaleUnit,
} from './schema';
import { generateId } from '@/lib/formatters';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// ── Medicine Seed Data ──

export const seedMedicines: Medicine[] = [
  // TABLET
  {
    id: 'med-001', name: 'Paracetamol 500mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 10,
    buyPrice: 25000, sellPrice: 35000, sellPriceSecondary: 4000, sellPriceBase: 500,
    minStock: 100, createdAt: daysAgo(90), updatedAt: daysAgo(5),
  },
  {
    id: 'med-002', name: 'Amoxicillin 500mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 10,
    buyPrice: 45000, sellPrice: 62000, sellPriceSecondary: 7000, sellPriceBase: 800,
    minStock: 50, createdAt: daysAgo(90), updatedAt: daysAgo(10),
  },
  {
    id: 'med-003', name: 'CTM 4mg (Chlorpheniramine)', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 10,
    buyPrice: 8000, sellPrice: 12000, sellPriceSecondary: 1500, sellPriceBase: 200,
    minStock: 100, createdAt: daysAgo(60), updatedAt: daysAgo(3),
  },
  {
    id: 'med-004', name: 'Antangin Tablet', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 4, secondaryPerTertiary: 25,
    buyPrice: 32000, sellPrice: 45000, sellPriceSecondary: 2000, sellPriceBase: 500,
    minStock: 50, createdAt: daysAgo(45), updatedAt: daysAgo(1),
  },
  {
    id: 'med-005', name: 'Ibuprofen 400mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 5,
    buyPrice: 18000, sellPrice: 28000, sellPriceSecondary: 6000, sellPriceBase: 700,
    minStock: 50, createdAt: daysAgo(30), updatedAt: daysAgo(2),
  },
  {
    id: 'med-006', name: 'Dexamethasone 0.5mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 10,
    buyPrice: 15000, sellPrice: 22000, sellPriceSecondary: 2500, sellPriceBase: 300,
    minStock: 50, createdAt: daysAgo(80), updatedAt: daysAgo(15),
  },
  // KAPSUL
  {
    id: 'med-007', name: 'Omeprazole 20mg', category: MedicineCategory.KAPSUL,
    baseUnit: 'Kapsul', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 3,
    buyPrice: 35000, sellPrice: 52000, sellPriceSecondary: 18000, sellPriceBase: 2000,
    minStock: 30, createdAt: daysAgo(70), updatedAt: daysAgo(7),
  },
  {
    id: 'med-008', name: 'Lansoprazole 30mg', category: MedicineCategory.KAPSUL,
    baseUnit: 'Kapsul', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 3,
    buyPrice: 42000, sellPrice: 60000, sellPriceSecondary: 22000, sellPriceBase: 2500,
    minStock: 30, createdAt: daysAgo(50), updatedAt: daysAgo(4),
  },
  // SIRUP
  {
    id: 'med-009', name: 'Sanmol Sirup 60ml', category: MedicineCategory.SIRUP,
    baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 12000, sellPrice: 18000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 20, createdAt: daysAgo(60), updatedAt: daysAgo(2),
  },
  {
    id: 'med-010', name: 'OBH Combi Batuk 100ml', category: MedicineCategory.SIRUP,
    baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 15000, sellPrice: 22000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 15, createdAt: daysAgo(45), updatedAt: daysAgo(8),
  },
  {
    id: 'med-011', name: 'Tempra Syrup 60ml', category: MedicineCategory.SIRUP,
    baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 28000, sellPrice: 38000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 10, createdAt: daysAgo(30), updatedAt: daysAgo(1),
  },
  // SALEP
  {
    id: 'med-012', name: 'Bioplacenton Gel', category: MedicineCategory.SALEP,
    baseUnit: 'Tube', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 18000, sellPrice: 28000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 10, createdAt: daysAgo(40), updatedAt: daysAgo(5),
  },
  {
    id: 'med-013', name: 'Kalpanax Salep', category: MedicineCategory.SALEP,
    baseUnit: 'Tube', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 8000, sellPrice: 13000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 15, createdAt: daysAgo(55), updatedAt: daysAgo(12),
  },
  {
    id: 'med-014', name: 'Thrombophob Gel 20g', category: MedicineCategory.SALEP,
    baseUnit: 'Tube', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 42000, sellPrice: 58000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 5, createdAt: daysAgo(35), updatedAt: daysAgo(3),
  },
  // TETES
  {
    id: 'med-015', name: 'Insto Regular 7.5ml', category: MedicineCategory.TETES,
    baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 10000, sellPrice: 16000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 20, createdAt: daysAgo(50), updatedAt: daysAgo(6),
  },
  {
    id: 'med-016', name: 'Cendo Xitrol Tetes Mata', category: MedicineCategory.TETES,
    baseUnit: 'Botol', secondaryUnit: null, tertiaryUnit: null,
    piecesPerSecondary: null, secondaryPerTertiary: null,
    buyPrice: 35000, sellPrice: 48000, sellPriceSecondary: null, sellPriceBase: null,
    minStock: 10, createdAt: daysAgo(40), updatedAt: daysAgo(9),
  },
  // TABLET extra
  {
    id: 'med-017', name: 'Metformin 500mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 10,
    buyPrice: 20000, sellPrice: 30000, sellPriceSecondary: 3500, sellPriceBase: 400,
    minStock: 100, createdAt: daysAgo(70), updatedAt: daysAgo(4),
  },
  {
    id: 'med-018', name: 'Amlodipine 5mg', category: MedicineCategory.TABLET,
    baseUnit: 'Biji', secondaryUnit: 'Strip', tertiaryUnit: 'Box',
    piecesPerSecondary: 10, secondaryPerTertiary: 3,
    buyPrice: 12000, sellPrice: 18000, sellPriceSecondary: 6500, sellPriceBase: 700,
    minStock: 30, createdAt: daysAgo(60), updatedAt: daysAgo(2),
  },
];

// ── StockBatch Seed Data ──

export const seedBatches: StockBatch[] = [
  // Paracetamol — aman
  { id: 'bat-001', medicineId: 'med-001', batchNumber: 'PCT-2025-A1', expiryDate: daysFromNow(365), totalBaseQty: 500, supplierName: 'PT Kimia Farma', receivedDate: daysAgo(60), status: BatchStatus.ACTIVE },
  // Paracetamol — mendekati EXP
  { id: 'bat-002', medicineId: 'med-001', batchNumber: 'PCT-2024-B3', expiryDate: daysFromNow(25), totalBaseQty: 80, supplierName: 'PT Kimia Farma', receivedDate: daysAgo(300), status: BatchStatus.NEAR_EXP },
  // Amoxicillin — aman
  { id: 'bat-003', medicineId: 'med-002', batchNumber: 'AMX-2025-C1', expiryDate: daysFromNow(200), totalBaseQty: 300, supplierName: 'PT Sanbe Farma', receivedDate: daysAgo(45), status: BatchStatus.ACTIVE },
  // CTM — expired!
  { id: 'bat-004', medicineId: 'med-003', batchNumber: 'CTM-2024-D1', expiryDate: daysFromNow(-10), totalBaseQty: 50, supplierName: 'PT Indo Farma', receivedDate: daysAgo(400), status: BatchStatus.EXPIRED },
  // CTM — aman
  { id: 'bat-005', medicineId: 'med-003', batchNumber: 'CTM-2025-D2', expiryDate: daysFromNow(180), totalBaseQty: 200, supplierName: 'PT Indo Farma', receivedDate: daysAgo(30), status: BatchStatus.ACTIVE },
  // Antangin — warning
  { id: 'bat-006', medicineId: 'med-004', batchNumber: 'ATG-2025-E1', expiryDate: daysFromNow(60), totalBaseQty: 150, supplierName: 'PT Deltomed', receivedDate: daysAgo(120), status: BatchStatus.NEAR_EXP },
  // Ibuprofen — aman
  { id: 'bat-007', medicineId: 'med-005', batchNumber: 'IBU-2026-F1', expiryDate: daysFromNow(400), totalBaseQty: 250, supplierName: 'PT Kalbe Farma', receivedDate: daysAgo(20), status: BatchStatus.ACTIVE },
  // Dexamethasone — aman
  { id: 'bat-008', medicineId: 'med-006', batchNumber: 'DEX-2025-G1', expiryDate: daysFromNow(150), totalBaseQty: 300, supplierName: 'PT Kimia Farma', receivedDate: daysAgo(50), status: BatchStatus.ACTIVE },
  // Omeprazole — warning
  { id: 'bat-009', medicineId: 'med-007', batchNumber: 'OMP-2025-H1', expiryDate: daysFromNow(45), totalBaseQty: 60, supplierName: 'PT Dexa Medica', receivedDate: daysAgo(200), status: BatchStatus.NEAR_EXP },
  // Lansoprazole — aman
  { id: 'bat-010', medicineId: 'med-008', batchNumber: 'LNS-2026-I1', expiryDate: daysFromNow(300), totalBaseQty: 90, supplierName: 'PT Dexa Medica', receivedDate: daysAgo(15), status: BatchStatus.ACTIVE },
  // Sanmol Sirup
  { id: 'bat-011', medicineId: 'med-009', batchNumber: 'SNM-2025-J1', expiryDate: daysFromNow(120), totalBaseQty: 30, supplierName: 'PT Sanbe Farma', receivedDate: daysAgo(40), status: BatchStatus.ACTIVE },
  // OBH Combi
  { id: 'bat-012', medicineId: 'med-010', batchNumber: 'OBH-2025-K1', expiryDate: daysFromNow(90), totalBaseQty: 25, supplierName: 'PT Combiphar', receivedDate: daysAgo(60), status: BatchStatus.ACTIVE },
  // Tempra Syrup — critical
  { id: 'bat-013', medicineId: 'med-011', batchNumber: 'TMP-2024-L1', expiryDate: daysFromNow(15), totalBaseQty: 8, supplierName: 'PT Taisho', receivedDate: daysAgo(350), status: BatchStatus.NEAR_EXP },
  // Bioplacenton
  { id: 'bat-014', medicineId: 'med-012', batchNumber: 'BIO-2025-M1', expiryDate: daysFromNow(250), totalBaseQty: 20, supplierName: 'PT Kalbe Farma', receivedDate: daysAgo(25), status: BatchStatus.ACTIVE },
  // Kalpanax
  { id: 'bat-015', medicineId: 'med-013', batchNumber: 'KLP-2025-N1', expiryDate: daysFromNow(180), totalBaseQty: 15, supplierName: 'PT Darya Varia', receivedDate: daysAgo(35), status: BatchStatus.ACTIVE },
  // Thrombophob
  { id: 'bat-016', medicineId: 'med-014', batchNumber: 'THR-2025-O1', expiryDate: daysFromNow(200), totalBaseQty: 10, supplierName: 'PT Soho Industri', receivedDate: daysAgo(20), status: BatchStatus.ACTIVE },
  // Insto
  { id: 'bat-017', medicineId: 'med-015', batchNumber: 'INS-2025-P1', expiryDate: daysFromNow(100), totalBaseQty: 40, supplierName: 'PT Combiphar', receivedDate: daysAgo(50), status: BatchStatus.ACTIVE },
  // Cendo Xitrol — expired
  { id: 'bat-018', medicineId: 'med-016', batchNumber: 'CND-2024-Q1', expiryDate: daysFromNow(-5), totalBaseQty: 5, supplierName: 'PT Cendo', receivedDate: daysAgo(380), status: BatchStatus.EXPIRED },
  // Cendo Xitrol — aman
  { id: 'bat-019', medicineId: 'med-016', batchNumber: 'CND-2025-Q2', expiryDate: daysFromNow(270), totalBaseQty: 15, supplierName: 'PT Cendo', receivedDate: daysAgo(10), status: BatchStatus.ACTIVE },
  // Metformin
  { id: 'bat-020', medicineId: 'med-017', batchNumber: 'MET-2026-R1', expiryDate: daysFromNow(350), totalBaseQty: 500, supplierName: 'PT Kimia Farma', receivedDate: daysAgo(14), status: BatchStatus.ACTIVE },
  // Amlodipine — stok rendah
  { id: 'bat-021', medicineId: 'med-018', batchNumber: 'AML-2025-S1', expiryDate: daysFromNow(150), totalBaseQty: 20, supplierName: 'PT Dexa Medica', receivedDate: daysAgo(60), status: BatchStatus.ACTIVE },
];

// ── Mutation Seed Data ──

export const seedMutations: StockMutation[] = [
  { id: generateId(), medicineId: 'med-001', batchId: 'bat-001', mutationType: MutationType.BARANG_DATANG, qtyChange: 500, unitUsed: '5 Box', referenceNumber: 'PO-2026-001', notes: 'Stok awal dari Kimia Farma', createdAt: daysAgo(60) },
  { id: generateId(), medicineId: 'med-002', batchId: 'bat-003', mutationType: MutationType.BARANG_DATANG, qtyChange: 300, unitUsed: '3 Box', referenceNumber: 'PO-2026-002', notes: 'Stok awal Amoxicillin', createdAt: daysAgo(45) },
  { id: generateId(), medicineId: 'med-009', batchId: 'bat-011', mutationType: MutationType.BARANG_DATANG, qtyChange: 30, unitUsed: '30 Botol', referenceNumber: 'PO-2026-003', notes: 'Sanmol Sirup dari Sanbe', createdAt: daysAgo(40) },
];

// ── Sale Seed Data ──

export const seedSales: Sale[] = [
  { id: 'sale-001', invoiceNumber: 'INV-20260905-001', totalAmount: 46000, amountPaid: 50000, changeAmount: 4000, createdAt: daysAgo(2) },
  { id: 'sale-002', invoiceNumber: 'INV-20260906-001', totalAmount: 22000, amountPaid: 25000, changeAmount: 3000, createdAt: daysAgo(1) },
];

export const seedSaleItems: SaleItem[] = [
  { id: 'si-001', saleId: 'sale-001', medicineId: 'med-001', batchId: 'bat-001', medicineName: 'Paracetamol 500mg', unit: SaleUnit.STRIP, quantity: 2, unitPrice: 4000, subtotal: 8000 },
  { id: 'si-002', saleId: 'sale-001', medicineId: 'med-009', batchId: 'bat-011', medicineName: 'Sanmol Sirup 60ml', unit: SaleUnit.BOTOL, quantity: 1, unitPrice: 18000, subtotal: 18000 },
  { id: 'si-003', saleId: 'sale-001', medicineId: 'med-012', batchId: 'bat-014', medicineName: 'Bioplacenton Gel', unit: SaleUnit.TUBE, quantity: 1, unitPrice: 28000, subtotal: 28000 },  
  { id: 'si-004', saleId: 'sale-002', medicineId: 'med-010', batchId: 'bat-012', medicineName: 'OBH Combi Batuk 100ml', unit: SaleUnit.BOTOL, quantity: 1, unitPrice: 22000, subtotal: 22000 },
];
