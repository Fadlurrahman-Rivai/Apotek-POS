// ============================================================
// Conversion — Satuan bertingkat (Box → Strip → Pcs)
// ============================================================

import type { Medicine } from '@/database/schema';
import { SaleUnit } from '@/database/schema';

/**
 * Convert quantity from a given unit to base unit (satuan terkecil)
 * e.g. 1 BOX of Paracetamol (10 strip/box, 10 pcs/strip) = 100 Tablet
 *      0.5 STRIP (10 pcs/strip) = 5 Tablet
 *      1 BOTOL = 1 Botol (sirup: baseUnit = Botol)
 */
export function toBaseUnit(
  qty: number,
  unit: SaleUnit | string,
  medicine: Medicine
): number {
  const u = (typeof unit === 'string' ? unit : '').toUpperCase().trim();

  if (
    u === 'PCS' ||
    u === medicine.baseUnit.toUpperCase() ||
    u === 'TABLET' ||
    u === 'BUTIR' ||
    u === 'BIJI' ||
    u === 'PER BIJI' ||
    u === 'PERBIJI'
  ) {
    return qty;
  }

  if (u === 'STRIP' || (medicine.secondaryUnit && u === medicine.secondaryUnit.toUpperCase())) {
    return qty * (medicine.piecesPerSecondary ?? 1);
  }

  if (u === 'BOX' || (medicine.tertiaryUnit && u === medicine.tertiaryUnit.toUpperCase())) {
    const pps = medicine.piecesPerSecondary ?? 1;
    const spt = medicine.secondaryPerTertiary ?? 1;
    return qty * pps * spt;
  }

  // Untuk satuan tunggal (BOTOL, TUBE)
  if (u === 'BOTOL' || u === 'TUBE') {
    return qty;
  }

  return qty;
}

/**
 * Convert base unit quantity to a target unit
 * e.g. 50 Tablet → 5 Strip (10 pcs/strip)
 */
export function fromBaseUnit(
  baseQty: number,
  targetUnit: SaleUnit | string,
  medicine: Medicine
): number {
  const u = (typeof targetUnit === 'string' ? targetUnit : '').toUpperCase().trim();

  if (
    u === 'PCS' ||
    u === medicine.baseUnit.toUpperCase() ||
    u === 'TABLET' ||
    u === 'BUTIR' ||
    u === 'BIJI' ||
    u === 'PER BIJI' ||
    u === 'PERBIJI'
  ) {
    return baseQty;
  }

  if (u === 'STRIP' || (medicine.secondaryUnit && u === medicine.secondaryUnit.toUpperCase())) {
    return baseQty / (medicine.piecesPerSecondary ?? 1);
  }

  if (u === 'BOX' || (medicine.tertiaryUnit && u === medicine.tertiaryUnit.toUpperCase())) {
    const pps = medicine.piecesPerSecondary ?? 1;
    const spt = medicine.secondaryPerTertiary ?? 1;
    return baseQty / (pps * spt);
  }

  return baseQty;
}

/**
 * Get the price for a specific unit of medicine
 */
export function getPriceForUnit(
  medicine: Medicine,
  unit: SaleUnit | string
): number {
  const u = (typeof unit === 'string' ? unit : '').toUpperCase().trim();

  if (u === 'BOX' || (medicine.tertiaryUnit && u === medicine.tertiaryUnit.toUpperCase())) {
    return medicine.sellPrice;
  }

  if (u === 'STRIP' || (medicine.secondaryUnit && u === medicine.secondaryUnit.toUpperCase())) {
    return medicine.sellPriceSecondary ?? medicine.sellPrice / (medicine.secondaryPerTertiary ?? 1);
  }

  if (
    u === 'PCS' ||
    u === 'TABLET' ||
    u === 'BUTIR' ||
    u === 'BIJI' ||
    u === 'PER BIJI' ||
    u === 'PERBIJI' ||
    u === medicine.baseUnit.toUpperCase()
  ) {
    if (medicine.sellPriceBase) return medicine.sellPriceBase;
    const pps = medicine.piecesPerSecondary ?? 1;
    const spt = medicine.secondaryPerTertiary ?? 1;
    return medicine.sellPrice / (pps * spt);
  }

  // Untuk BOTOL / TUBE satuan tunggal
  return medicine.sellPrice;
}

/**
 * Get available selling units for a medicine (Kasir & Katalog)
 */
export function getAvailableUnits(medicine: Medicine): string[] {
  const units: string[] = [];

  if (medicine.tertiaryUnit) {
    units.push(medicine.tertiaryUnit);
  }
  if (medicine.secondaryUnit) {
    units.push(medicine.secondaryUnit);
  }
  const base = medicine.baseUnit.toLowerCase() === 'tablet' ? 'Biji' : medicine.baseUnit;
  units.push(base);

  return units;
}

/**
 * Get available dispensing units specifically for prescription
 * Solid medicines (Tablet, Kapsul) are dispensed per "Biji", NOT Strip/Tablet.
 */
export function getPrescriptionUnits(medicine: Medicine): string[] {
  const u = medicine.baseUnit.toUpperCase();
  const cat = (medicine.category || '').toUpperCase();

  if (
    cat === 'TABLET' ||
    cat === 'KAPSUL' ||
    u === 'TABLET' ||
    u === 'KAPSUL' ||
    u === 'BUTIR' ||
    u === 'PCS' ||
    u === 'BIJI'
  ) {
    return ['Biji'];
  }

  if (cat === 'SIRUP' || u === 'BOTOL') {
    return ['Botol'];
  }

  if (cat === 'SALEP' || u === 'TUBE') {
    return ['Tube'];
  }

  if (cat === 'TETES') {
    return ['Botol'];
  }

  return ['Biji', medicine.baseUnit];
}
