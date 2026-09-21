# Arsitektur & Susunan Folder: Web POS Apotek Sederhana

Dokumen ini mendefinisikan susunan folder dan struktur kode untuk aplikasi **Web POS Apotek Sederhana** sesuai dengan spesifikasi pada [PRD-Apotek.md](file:///e:/Idul/Project/Apotek/docs/prd/PRD-Apotek.md).

---

## 1. Diagram Pohon Direktori (Directory Tree)

```text
Apotek/
├── docs/                                # Dokumentasi Proyek
│   ├── prd/
│   │   └── PRD-Apotek.md                # Dokumen PRD acuan
│   └── FOLDER_STRUCTURE.md              # Dokumen susunan folder ini
│
├── public/                              # Aset Statis & Template Unduhan
│   ├── icons/                           # Ikon visual bentuk sediaan (tablet, sirup, salep, dll)
│   ├── templates/                       # File template siap unduh untuk pengguna
│   │   └── template_import_obat.xlsx    # Template Excel untuk import katalog & harga obat
│   └── favicon.ico                      # Ikon browser
│
├── src/                                 # Kode Sumber Aplikasi Utama
│   ├── assets/                          # Aset grafis internal (logo apotek, stylesheet)
│   │
│   ├── components/                      # Komponen UI Umum (Reusables / Shared)
│   │   ├── ui/                          # Komponen atom dasar (Button, Input, Select, Badge, Card, Modal)
│   │   ├── layout/                      # Tata letak global (Navbar, Sidebar navigasi, Header, Footer)
│   │   └── feedback/                    # Komponen interaksi (Toast notifikasi, Dialog konfirmasi)
│   │
│   ├── features/                        # Modul Fitur Berorientasi Domain Bisnis (Feature-Driven)
│   │   │
│   │   ├── pos/                         # [Fitur 1] Kasir & Penjualan Obat
│   │   │   ├── components/              # Terminal POS, Keranjang belanja, Kalkulator kembalian, Print struk
│   │   │   ├── hooks/                   # useCart, useCheckout
│   │   │   └── types.ts                 # Tipe data transaksi penjualan & keranjang
│   │   │
│   │   ├── inventory/                   # [Fitur 2] Katalog Obat, Sediaan & Konversi Satuan
│   │   │   ├── components/              # Tabel katalog obat, Form tambah/edit obat, Modal buka kemasan (Unbox)
│   │   │   ├── utils/                   # Logika konversi satuan bertingkat (Box -> Strip -> Pcs)
│   │   │   └── types.ts                 # Definisi jenis sediaan (Tablet, Sirup, Salep, Kapsul, Tetes)
│   │   │
│   │   ├── warehouse/                   # [Fitur 3] Pergudangan Stok & Input Barang Datang
│   │   │   ├── components/              # Form input barang masuk, Riwayat log penerimaan barang
│   │   │   └── types.ts                 # Tipe batch stok, data supplier, dan log mutasi masuk
│   │   │
│   │   ├── prescription/                # [Fitur 4] Pengeluaran Resep Parsial (Pecahan)
│   │   │   ├── components/              # Form pengeluaran resep (input pecahan: 0.5 strip, tablet eceran)
│   │   │   └── types.ts                 # Tipe data pengeluaran resep dokter
│   │   │
│   │   ├── expiry/                      # [Fitur 5] Pengingat Kedaluwarsa (EXP Reminder)
│   │   │   ├── components/              # Widget alert dashboard, Filter tabel <30/<60/<90 hari
│   │   │   └── utils/                   # Kalkulator sisa hari & status warna (Merah, Oranye, Kuning, Hijau)
│   │   │
│   │   └── pricing-import/              # [Fitur 6] Penentuan Harga & Import/Export File
│   │       ├── components/              # Modal upload file Excel/CSV, Modal pratinjau & validasi data
│   │       └── utils/                   # Parser Excel/CSV, validator baris, ekspor data katalog
│   │
│   ├── app/                             # Next.js App Router (Pages, Layout, & Route Handlers)
│   │   ├── layout.tsx                   # Root Layout & Provider (Theme, Font, Sidebar)
│   │   ├── page.tsx                     # Dashboard Utama Apotek
│   │   ├── globals.css                  # Styling Global, Variabel Warna & Tipografi
│   │   ├── pos/page.tsx                 # Route Kasir Penjualan (POS)
│   │   ├── inventory/page.tsx           # Route Master Katalog Obat & Sediaan
│   │   ├── warehouse/page.tsx           # Route Pergudangan & Barang Datang
│   │   ├── prescription/page.tsx        # Route Pengeluaran Resep Parsial
│   │   ├── expiry/page.tsx              # Route Pengingat Kedaluwarsa (EXP)
│   │   ├── pricing/page.tsx             # Route Penentuan Harga & Import/Export
│   │   └── api/                         # Backend API Route Handlers (Node.js + PostgreSQL)
│   │       ├── medicines/route.ts       # Endpoint CRUD Obat & Harga
│   │       ├── batches/route.ts         # Endpoint Stok Pergudangan & EXP
│   │       ├── sales/route.ts           # Endpoint Transaksi Penjualan
│   │       └── prescriptions/route.ts   # Endpoint Pengeluaran Resep
│   │
│   ├── database/                        # Database Layer (PostgreSQL / ORM / Client)
│   │   ├── schema.ts                    # Definisi skema tabel PostgreSQL
│   │   ├── db.ts                        # Pool koneksi PostgreSQL (Node.js pg/Prisma/Drizzle)
│   │   └── seed.ts                      # Script Seeding data awal obat
│   │
│   ├── lib/                             # Utility & Pustaka Pendukung Global
│   │   ├── formatters.ts                # Format mata uang Rupiah (IDR), format tanggal lokal
│   │   ├── db-client.ts                 # Helper query database PostgreSQL
│   │   └── print-escpos.ts              # Template cetak struk kasir (thermal 58mm/80mm)
│
├── .agents/                             # Agent Skills & Tools
│   └── skills/                          # Skill to-prd, ponytail, frontend-design, web-design-guidelines
│
├── package.json                         # Dependensi Proyek & Script NPM
├── tsconfig.json                        # Konfigurasi TypeScript
└── README.md                            # Panduan Memulai & Menjalankan Proyek
```

---

## 2. Pemetaan Modul Folder ke Kebutuhan PRD

| Modul Direktori | Relevansi Fitur pada PRD | Tanggung Jawab Utama |
|---|---|---|
| **`src/features/pos/`** | Kasir Penjualan Obat (Web POS) | Pencarian obat instan, perhitungan total & kembalian, pemotongan stok otomatis, cetak struk kasir. |
| **`src/features/inventory/`** | Katalog Obat & Bentuk Sediaan | Master data obat, pengelompokan sediaan (Tablet, Sirup, Salep), konversi satuan bertingkat (*Box ➡️ Strip ➡️ Pcs*), aksi *Unbox*. |
| **`src/features/warehouse/`** | Pergudangan & Barang Datang | Form input penerimaan obat dari supplier, pencatatan no batch, tanggal EXP, dan update stok gudang. |
| **`src/features/prescription/`** | Pengeluaran Resep Parsial | Pencatatan pengeluaran obat untuk resep, mendukung kuantitas desimal/pecahan (*0.5 strip* atau hitungan butir). |
| **`src/features/expiry/`** | Pengingat Kedaluwarsa (EXP) | Indikator visual warna (Merah = Expired, Kuning/Oranye = Kritis <30/<90 hari, Hijau = Aman), filter cepat kedaluwarsa. |
| **`src/features/pricing-import/`** | Penentuan Harga & Import File | Form edit harga langsung (*inline/modal*), import massal dari Excel/CSV, unduh template, dan export data katalog. |
| **`src/database/`** | Unified Stock Management | Menjamin seluruh transaksi kasir dan pengeluaran resep memotong stok pergudangan yang sama secara *real-time*. |

---

## 3. Prinsip Arsitektur

1. **Feature-Driven (Domain Driven):** Kode dikelompokkan berdasarkan fungsinya dalam apotek, bukan sekadar tipe teknis (bukan sekadar kumpulan folder `controllers`, `models`, `views` raksasa yang saling tumpang tindih).
2. **Kemandirian Modul (Low Coupling, High Cohesion):** Modul `pos` hanya berfokus pada kasir; modul `warehouse` hanya berfokus pada penerimaan stok. Keduanya berkomunikasi melalui layer data bersama (`database/`).
3. **Penyimpanan Terpadu (*Single Source of Truth*):** Seluruh mutasi obat (baik dari penjualan kasir maupun resep pecahan) dicatat pada tabel `StockMutation` yang terpusat di `database/schema.ts`.
4. **Ringan & Cepat (Prinsip *Ponytail*):** Menjaga dependensi seminimal mungkin dan menggunakan logika konversi yang sederhana tanpa *boilerplate* berlebih.
