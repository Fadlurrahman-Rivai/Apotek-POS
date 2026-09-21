import { NextResponse } from 'next/server';
import { readServerDB } from '@/lib/server-store';

// GET: Ambil seluruh riwayat log mutasi pergudangan
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const medicineId = searchParams.get('medicineId');
  const type = searchParams.get('type');

  const db = readServerDB();
  let result = db.mutations;

  if (medicineId) {
    result = result.filter((m) => m.medicineId === medicineId);
  }
  if (type) {
    result = result.filter((m) => m.mutationType === type);
  }

  // Newest first
  result = [...result].reverse();

  return NextResponse.json({ success: true, data: result });
}
