// ============================================================
// ESC/POS Thermal Receipt Formatter (58mm & 80mm)
// Formats receipt for ESC/POS thermal printers & plain text
// ============================================================

import { Sale, SaleItem } from '@/database/schema';
import { formatRupiah, formatDate } from '@/lib/formatters';

export interface ReceiptData {
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  sale: Sale;
  items: SaleItem[];
  cashierName?: string;
}

/**
 * Format plain text receipt for 58mm printer (32 characters wide)
 */
export function formatReceipt58mm(data: ReceiptData): string {
  const WIDTH = 32;
  const store = data.storeName || 'APOTEK SEHAT SENTOSA';
  const address = data.storeAddress || 'Jl. Raya Kesehatan No. 12';
  const phone = data.storePhone || 'Telp: 021-5551234';

  const line = '-'.repeat(WIDTH);
  const doubleLine = '='.repeat(WIDTH);

  const center = (text: string) => {
    const pad = Math.max(0, Math.floor((WIDTH - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  const justify = (left: string, right: string) => {
    const space = Math.max(1, WIDTH - left.length - right.length);
    return left + ' '.repeat(space) + right;
  };

  let out = '';
  out += center(store) + '\n';
  out += center(address) + '\n';
  out += center(phone) + '\n';
  out += doubleLine + '\n';
  out += justify(`No: ${data.sale.invoiceNumber}`, '') + '\n';
  out += justify(`Tgl: ${formatDate(data.sale.createdAt)}`, '') + '\n';
  if (data.cashierName) {
    out += justify(`Kasir: ${data.cashierName}`, '') + '\n';
  }
  out += line + '\n';

  for (const item of data.items) {
    out += item.medicineName + '\n';
    const detail = `  ${item.quantity} ${item.unit} x ${formatRupiah(item.unitPrice)}`;
    const subtotal = formatRupiah(item.subtotal);
    out += justify(detail, subtotal) + '\n';
  }

  out += line + '\n';
  out += justify('TOTAL:', formatRupiah(data.sale.totalAmount)) + '\n';
  out += justify('TUNAI:', formatRupiah(data.sale.amountPaid)) + '\n';
  out += justify('KEMBALI:', formatRupiah(data.sale.changeAmount)) + '\n';
  out += doubleLine + '\n';
  out += center('Terima Kasih Atas Kunjungan Anda') + '\n';
  out += center('Semoga Lekas Sembuh!') + '\n';
  out += '\n\n';

  return out;
}

/**
 * Format plain text receipt for 80mm printer (48 characters wide)
 */
export function formatReceipt80mm(data: ReceiptData): string {
  const WIDTH = 48;
  const store = data.storeName || 'APOTEK SEHAT SENTOSA';
  const address = data.storeAddress || 'Jl. Raya Kesehatan No. 12, Jakarta';
  const phone = data.storePhone || 'Telp: (021) 555-1234';

  const line = '-'.repeat(WIDTH);
  const doubleLine = '='.repeat(WIDTH);

  const center = (text: string) => {
    const pad = Math.max(0, Math.floor((WIDTH - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  const justify = (left: string, right: string) => {
    const space = Math.max(1, WIDTH - left.length - right.length);
    return left + ' '.repeat(space) + right;
  };

  let out = '';
  out += center(store) + '\n';
  out += center(address) + '\n';
  out += center(phone) + '\n';
  out += doubleLine + '\n';
  out += justify(`Faktur: ${data.sale.invoiceNumber}`, `Tgl: ${formatDate(data.sale.createdAt)}`) + '\n';
  out += line + '\n';

  for (const item of data.items) {
    const left = `${item.medicineName} (${item.quantity} ${item.unit} @ ${formatRupiah(item.unitPrice)})`;
    const right = formatRupiah(item.subtotal);
    out += justify(left, right) + '\n';
  }

  out += line + '\n';
  out += justify('TOTAL PEMBELIAN:', formatRupiah(data.sale.totalAmount)) + '\n';
  out += justify('JUMLAH DIBAYAR:', formatRupiah(data.sale.amountPaid)) + '\n';
  out += justify('KEMBALIAN:', formatRupiah(data.sale.changeAmount)) + '\n';
  out += doubleLine + '\n';
  out += center('Terima Kasih Atas Kunjungan Anda') + '\n';
  out += center('Barang yang sudah dibeli tidak dapat ditukar/dikembalikan') + '\n';
  out += '\n\n\n';

  return out;
}
