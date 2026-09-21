import { NextResponse } from 'next/server';
import { readServerDB, writeServerDB } from '@/lib/server-store';
import { Medicine } from '@/database/schema';

// GET: Ambil daftar obat
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const category = searchParams.get('category') || '';

  const db = readServerDB();
  let result = db.medicines;

  if (search) {
    result = result.filter((m) => m.name.toLowerCase().includes(search));
  }
  if (category && category !== 'ALL') {
    result = result.filter((m) => m.category === category);
  }

  return NextResponse.json({ success: true, data: result });
}

// POST: Tambah obat baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readServerDB();

    const newMed: Medicine = {
      ...body,
      id: body.id || 'med-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.medicines.push(newMed);
    writeServerDB(db);

    return NextResponse.json({ success: true, data: newMed }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal menambahkan obat' }, { status: 400 });
  }
}

// PUT: Perbarui data obat / harga
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const db = readServerDB();

    const index = db.medicines.findIndex((m) => m.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Obat tidak ditemukan' }, { status: 404 });
    }

    db.medicines[index] = {
      ...db.medicines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeServerDB(db);

    return NextResponse.json({ success: true, data: db.medicines[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui obat' }, { status: 400 });
  }
}

// DELETE: Hapus obat
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Parameter id diperlukan' }, { status: 400 });
  }

  const db = readServerDB();
  db.medicines = db.medicines.filter((m) => m.id !== id);
  writeServerDB(db);

  return NextResponse.json({ success: true, message: 'Obat berhasil dihapus' });
}
