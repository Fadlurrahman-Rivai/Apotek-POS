import { NextResponse } from 'next/server';
import { readServerDB, writeServerDB } from '@/lib/server-store';
import { StockBatch, BatchStatus } from '@/database/schema';

// GET: Ambil daftar batch
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const medicineId = searchParams.get('medicineId');

  const db = readServerDB();
  let result = db.batches;

  if (medicineId) {
    result = result.filter((b) => b.medicineId === medicineId);
  }

  return NextResponse.json({ success: true, data: result });
}

// POST: Tambah batch baru (barang masuk)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readServerDB();

    const newBatch: StockBatch = {
      ...body,
      id: body.id || 'bat-' + Date.now().toString(36),
      status: body.status || BatchStatus.ACTIVE,
    };

    db.batches.push(newBatch);
    writeServerDB(db);

    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menambahkan batch' }, { status: 400 });
  }
}

// PATCH: Perbarui status atau kuantitas batch (misal karantina / koreksi)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const db = readServerDB();

    const idx = db.batches.findIndex((b) => b.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Batch tidak ditemukan' }, { status: 404 });
    }

    db.batches[idx] = { ...db.batches[idx], ...updates };
    writeServerDB(db);

    return NextResponse.json({ success: true, data: db.batches[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui batch' }, { status: 400 });
  }
}
