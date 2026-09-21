import { NextResponse } from 'next/server';
import { readServerDB, writeServerDB } from '@/lib/server-store';
import { Sale, SaleItem, MutationType } from '@/database/schema';

// GET: Ambil daftar transaksi penjualan
export async function GET() {
  const db = readServerDB();
  return NextResponse.json({
    success: true,
    data: {
      sales: db.sales,
      saleItems: db.saleItems,
    },
  });
}

// POST: Transaksi penjualan kasir (POS)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sale, items } = body as { sale: Sale; items: SaleItem[] };

    const db = readServerDB();

    // 1. Simpan Transaksi Penjualan
    db.sales.push(sale);

    // 2. Simpan Item Penjualan & Kurangi Stok Batch Terkait
    for (const item of items) {
      db.saleItems.push(item);

      if (item.batchId) {
        const batchIdx = db.batches.findIndex((b) => b.id === item.batchId);
        if (batchIdx > -1) {
          // Kurangi stok di batch
          db.batches[batchIdx].totalBaseQty = Math.max(
            0,
            db.batches[batchIdx].totalBaseQty - item.quantity
          );
        }
      }

      // Catat mutasi kasir
      db.mutations.push({
        id: 'mut-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        medicineId: item.medicineId,
        batchId: item.batchId,
        mutationType: MutationType.PENJUALAN_KASIR,
        qtyChange: -item.quantity,
        unitUsed: `${item.quantity} ${item.unit}`,
        referenceNumber: sale.invoiceNumber,
        notes: `Penjualan Kasir - Faktur ${sale.invoiceNumber}`,
        createdAt: new Date().toISOString(),
      });
    }

    writeServerDB(db);

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memproses transaksi kasir' }, { status: 400 });
  }
}
