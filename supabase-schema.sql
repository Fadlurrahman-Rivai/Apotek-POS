-- ============================================================
-- SQL Schema untuk Apotek POS (Jalankan di SQL Editor Supabase)
-- ============================================================

-- 1. Tabel Obat (Medicines)
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_unit TEXT NOT NULL,
  secondary_unit TEXT,
  tertiary_unit TEXT,
  pieces_per_secondary NUMERIC,
  secondary_per_tertiary NUMERIC,
  buy_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  sell_price_secondary NUMERIC,
  sell_price_base NUMERIC,
  min_stock NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Batch Stok (Stock Batches)
CREATE TABLE IF NOT EXISTS stock_batches (
  id TEXT PRIMARY KEY,
  medicine_id TEXT REFERENCES medicines(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  total_base_qty NUMERIC DEFAULT 0,
  supplier_name TEXT,
  received_date TEXT,
  status TEXT DEFAULT 'ACTIVE'
);

-- 3. Tabel Mutasi Stok (Stock Mutations)
CREATE TABLE IF NOT EXISTS stock_mutations (
  id TEXT PRIMARY KEY,
  medicine_id TEXT,
  batch_id TEXT,
  mutation_type TEXT NOT NULL,
  qty_change NUMERIC DEFAULT 0,
  unit_used TEXT,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Transaksi Penjualan (Sales)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Item Penjualan (Sale Items)
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id TEXT,
  batch_id TEXT,
  medicine_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL
);

-- 6. Tabel Master Gudang (Gudang Rows)
CREATE TABLE IF NOT EXISTS warehouse_rows (
  id TEXT PRIMARY KEY,
  row_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Meta Konfigurasi Gudang (Columns, File Name, dsb)
CREATE TABLE IF NOT EXISTS warehouse_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_meta ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk menghindari duplicate error
DROP POLICY IF EXISTS "Public Read Medicines" ON medicines;
DROP POLICY IF EXISTS "Public Insert Medicines" ON medicines;
DROP POLICY IF EXISTS "Public Update Medicines" ON medicines;
DROP POLICY IF EXISTS "Public Delete Medicines" ON medicines;

DROP POLICY IF EXISTS "Public Read Batches" ON stock_batches;
DROP POLICY IF EXISTS "Public Insert Batches" ON stock_batches;
DROP POLICY IF EXISTS "Public Update Batches" ON stock_batches;
DROP POLICY IF EXISTS "Public Delete Batches" ON stock_batches;

DROP POLICY IF EXISTS "Public Read Mutations" ON stock_mutations;
DROP POLICY IF EXISTS "Public Insert Mutations" ON stock_mutations;
DROP POLICY IF EXISTS "Public Update Mutations" ON stock_mutations;
DROP POLICY IF EXISTS "Public Delete Mutations" ON stock_mutations;

DROP POLICY IF EXISTS "Public Read Sales" ON sales;
DROP POLICY IF EXISTS "Public Insert Sales" ON sales;
DROP POLICY IF EXISTS "Public Update Sales" ON sales;
DROP POLICY IF EXISTS "Public Delete Sales" ON sales;

DROP POLICY IF EXISTS "Public Read Sale Items" ON sale_items;
DROP POLICY IF EXISTS "Public Insert Sale Items" ON sale_items;
DROP POLICY IF EXISTS "Public Update Sale Items" ON sale_items;
DROP POLICY IF EXISTS "Public Delete Sale Items" ON sale_items;

DROP POLICY IF EXISTS "Public Read Warehouse Rows" ON warehouse_rows;
DROP POLICY IF EXISTS "Public Insert Warehouse Rows" ON warehouse_rows;
DROP POLICY IF EXISTS "Public Update Warehouse Rows" ON warehouse_rows;
DROP POLICY IF EXISTS "Public Delete Warehouse Rows" ON warehouse_rows;

DROP POLICY IF EXISTS "Public Read Warehouse Meta" ON warehouse_meta;
DROP POLICY IF EXISTS "Public Insert Warehouse Meta" ON warehouse_meta;
DROP POLICY IF EXISTS "Public Update Warehouse Meta" ON warehouse_meta;
DROP POLICY IF EXISTS "Public Delete Warehouse Meta" ON warehouse_meta;

-- Buat Policy baru agar aplikasi POS dapat membaca & menulis data secara penuh
CREATE POLICY "Public Read Medicines" ON medicines FOR SELECT USING (true);
CREATE POLICY "Public Insert Medicines" ON medicines FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Medicines" ON medicines FOR UPDATE USING (true);
CREATE POLICY "Public Delete Medicines" ON medicines FOR DELETE USING (true);

CREATE POLICY "Public Read Batches" ON stock_batches FOR SELECT USING (true);
CREATE POLICY "Public Insert Batches" ON stock_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Batches" ON stock_batches FOR UPDATE USING (true);
CREATE POLICY "Public Delete Batches" ON stock_batches FOR DELETE USING (true);

CREATE POLICY "Public Read Mutations" ON stock_mutations FOR SELECT USING (true);
CREATE POLICY "Public Insert Mutations" ON stock_mutations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Mutations" ON stock_mutations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Mutations" ON stock_mutations FOR DELETE USING (true);

CREATE POLICY "Public Read Sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Public Insert Sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Public Delete Sales" ON sales FOR DELETE USING (true);

CREATE POLICY "Public Read Sale Items" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Sale Items" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Sale Items" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Public Delete Sale Items" ON sale_items FOR DELETE USING (true);

CREATE POLICY "Public Read Warehouse Rows" ON warehouse_rows FOR SELECT USING (true);
CREATE POLICY "Public Insert Warehouse Rows" ON warehouse_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Warehouse Rows" ON warehouse_rows FOR UPDATE USING (true);
CREATE POLICY "Public Delete Warehouse Rows" ON warehouse_rows FOR DELETE USING (true);

CREATE POLICY "Public Read Warehouse Meta" ON warehouse_meta FOR SELECT USING (true);
CREATE POLICY "Public Insert Warehouse Meta" ON warehouse_meta FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Warehouse Meta" ON warehouse_meta FOR UPDATE USING (true);
CREATE POLICY "Public Delete Warehouse Meta" ON warehouse_meta FOR DELETE USING (true);
