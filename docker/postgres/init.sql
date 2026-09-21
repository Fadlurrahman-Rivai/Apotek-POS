-- ============================================================
-- Skema Database PostgreSQL — Apotek POS & Unified Stock
-- Disesuaikan untuk efisiensi tinggi dan beban ringan
-- ============================================================

CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_unit VARCHAR(50) NOT NULL,
    secondary_unit VARCHAR(50),
    tertiary_unit VARCHAR(50),
    pieces_per_secondary INTEGER,
    secondary_per_tertiary INTEGER,
    buy_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sell_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sell_price_secondary NUMERIC(12, 2),
    sell_price_base NUMERIC(12, 2),
    min_stock INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);

CREATE TABLE IF NOT EXISTS stock_batches (
    id VARCHAR(50) PRIMARY KEY,
    medicine_id VARCHAR(50) NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    total_base_qty INTEGER NOT NULL DEFAULT 0,
    supplier_name VARCHAR(255) NOT NULL,
    received_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_batches_med_exp ON stock_batches(medicine_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_batches_status ON stock_batches(status);

CREATE TABLE IF NOT EXISTS stock_mutations (
    id VARCHAR(50) PRIMARY KEY,
    medicine_id VARCHAR(50) NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_id VARCHAR(50) REFERENCES stock_batches(id) ON DELETE SET NULL,
    mutation_type VARCHAR(50) NOT NULL,
    qty_change INTEGER NOT NULL,
    unit_used VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mutations_med ON stock_mutations(medicine_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    change_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'TUNAI',
    cashier_name VARCHAR(100) NOT NULL DEFAULT 'Kasir 1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(50) PRIMARY KEY,
    sale_id VARCHAR(50) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    medicine_id VARCHAR(50) NOT NULL REFERENCES medicines(id),
    batch_id VARCHAR(50) REFERENCES stock_batches(id),
    unit VARCHAR(50) NOT NULL,
    quantity NUMERIC(8, 2) NOT NULL,
    base_qty_deducted INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);

-- Seeding data awal obat
INSERT INTO medicines (id, name, category, base_unit, secondary_unit, tertiary_unit, pieces_per_secondary, secondary_per_tertiary, buy_price, sell_price, sell_price_secondary, sell_price_base, min_stock)
VALUES 
('med-001', 'Paracetamol 500mg', 'TABLET', 'Tablet', 'Strip', 'Box', 10, 10, 25000, 35000, 4000, 500, 100),
('med-002', 'Amoxicillin 500mg', 'TABLET', 'Tablet', 'Strip', 'Box', 10, 10, 45000, 62000, 7000, 800, 50),
('med-003', 'CTM 4mg (Chlorpheniramine)', 'TABLET', 'Tablet', 'Strip', 'Box', 10, 10, 8000, 12000, 1500, 200, 100),
('med-004', 'Antangin Tablet', 'TABLET', 'Tablet', 'Strip', 'Box', 4, 25, 32000, 45000, 2000, 500, 50),
('med-005', 'Ibuprofen 400mg', 'TABLET', 'Tablet', 'Strip', 'Box', 10, 5, 18000, 28000, 6000, 700, 50),
('med-006', 'Dexamethasone 0.5mg', 'TABLET', 'Tablet', 'Strip', 'Box', 10, 10, 15000, 22000, 2500, 300, 50),
('med-007', 'Sanmol Sirup 60ml', 'SIRUP', 'Botol', NULL, NULL, NULL, NULL, 16000, 22500, NULL, NULL, 15),
('med-008', 'OBH Combi Plus Batuk Flu 100ml', 'SIRUP', 'Botol', NULL, NULL, NULL, NULL, 18500, 26000, NULL, NULL, 12),
('med-009', 'Salep Kalpanax Krim 10g', 'SALEP', 'Tube', NULL, NULL, NULL, NULL, 11000, 16000, NULL, NULL, 10),
('med-010', 'Betadine Salep Antiseptik 10g', 'SALEP', 'Tube', NULL, NULL, NULL, NULL, 14000, 20000, NULL, NULL, 10),
('med-011', 'Insto Regular Tetes Mata 7.5ml', 'TETES', 'Botol', NULL, NULL, NULL, NULL, 12500, 17500, NULL, NULL, 15),
('med-012', 'Omeprazole 20mg', 'KAPSUL', 'Kapsul', 'Strip', 'Box', 10, 3, 22000, 35000, 12000, 1500, 30)
ON CONFLICT (id) DO NOTHING;

-- Seeding data batch stok awal
INSERT INTO stock_batches (id, medicine_id, batch_number, expiry_date, total_base_qty, supplier_name, received_date, status)
VALUES
('bat-001', 'med-001', 'PCT-2024-A', CURRENT_DATE + INTERVAL '180 days', 350, 'PT Kimia Farma Trading', CURRENT_DATE - INTERVAL '30 days', 'ACTIVE'),
('bat-002', 'med-001', 'PCT-2024-B', CURRENT_DATE + INTERVAL '25 days', 80, 'PT Mensa Binasukses', CURRENT_DATE - INTERVAL '90 days', 'NEAR_EXP'),
('bat-003', 'med-002', 'AMX-2024-01', CURRENT_DATE + INTERVAL '240 days', 180, 'PT Anugrah Argon Medica', CURRENT_DATE - INTERVAL '20 days', 'ACTIVE'),
('bat-004', 'med-003', 'CTM-2023-99', CURRENT_DATE - INTERVAL '10 days', 20, 'PT Enseval Putera Megatrading', CURRENT_DATE - INTERVAL '180 days', 'EXPIRED'),
('bat-005', 'med-007', 'SNM-2024-05', CURRENT_DATE + INTERVAL '150 days', 25, 'PT Kimia Farma Trading', CURRENT_DATE - INTERVAL '15 days', 'ACTIVE'),
('bat-006', 'med-008', 'OBH-2024-03', CURRENT_DATE + INTERVAL '60 days', 18, 'PT Mensa Binasukses', CURRENT_DATE - INTERVAL '45 days', 'NEAR_EXP'),
('bat-007', 'med-009', 'KLP-2024-11', CURRENT_DATE + INTERVAL '300 days', 30, 'PT Kalbe Farma', CURRENT_DATE - INTERVAL '10 days', 'ACTIVE'),
('bat-008', 'med-010', 'BTD-2024-02', CURRENT_DATE + INTERVAL '200 days', 22, 'PT Mahakam Beta Farma', CURRENT_DATE - INTERVAL '25 days', 'ACTIVE'),
('bat-009', 'med-011', 'INS-2024-08', CURRENT_DATE + INTERVAL '270 days', 40, 'PT Combiphar', CURRENT_DATE - INTERVAL '12 days', 'ACTIVE'),
('bat-010', 'med-012', 'OMZ-2024-04', CURRENT_DATE + INTERVAL '210 days', 90, 'PT Dexa Medica', CURRENT_DATE - INTERVAL '18 days', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
