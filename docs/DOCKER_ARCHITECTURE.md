# Arsitektur Docker Multi-Service: Sistem Apotek POS

Dokumen ini menjelaskan rancangan arsitektur kontainerisasi modular (*multi-service container*) untuk sistem **Apotek POS**. Arsitektur ini dirancang khusus dengan prinsip **Low Overhead & High Efficiency** agar setiap layanan berjalan ringan (*tidak memberatkan server / PC kasir*).

---

## 1. Diagram Topologi & Alur Layanan

```
                        [ Browser Klien / PC Kasir / Tablet ]
                                          │
                                          ▼ Port 80 / 3000
                    ┌───────────────────────────────────────────┐
                    │          1. apotek-gateway                │
                    │      (Nginx Alpine Reverse Proxy)         │
                    │  - Kompresi Gzip                          │
                    │  - Static Asset Cache (CSS, JS, Gambar)   │
                    │  - SSL & Rate Limiter Ready               │
                    └─────────────┬───────────────┬─────────────┘
                                  │               │
                 Aset Statis &    │               │ Panggilan Data
                 Halaman Web      │               │ /api/*
                                  ▼               ▼
     ┌──────────────────────────────┐   ┌──────────────────────────────┐
     │        2. apotek-web         │   │        3. apotek-api         │
     │   (Next.js 16 Standalone)    │   │  (Express Microservice API)  │
     │  - Kasir POS                 │   │  - Master Obat & Harga       │
     │  - Resep Pecahan (0.5 strip) │   │  - Mutasi & Batch FEFO       │
     │  - Penerimaan Gudang         │   │  - Transaksi Penjualan       │
     │  - Dashboard & Monitor EXP   │   │  - Pengeluaran Resep         │
     └──────────────────────────────┘   └──────────────┬───────────────┘
                                                       │
                                                       ▼ Port 5432
                                        ┌──────────────────────────────┐
                                        │        4. apotek-db          │
                                        │    (PostgreSQL 16 Alpine)    │
                                        │  - ACID-Compliant Storage    │
                                        │  - Shared Buffers: 64MB      │
                                        │  - Auto Init & Seeding       │
                                        └──────────────┬───────────────┘
                                                       ▲
                                   Siklus Audit &      │
                                   Backup Latar        │
                                   Belakang            │
                        ┌──────────────────────────────┴┐
                        │       5. apotek-worker        │
                        │    (Background Scheduler)     │
                        │  - Audit Batch EXP (<30/90 hr)│
                        │  - Backup Harian Otomatis     │
                        │  - Zero POS Overhead          │
                        └───────────────────────────────┘
```

---

## 2. Rincian Pembagian Service & Strategi Optimasi Beban

Agar sistem tidak memberatkan perangkat keras (khususnya PC kasir dengan spesifikasi standar):

| Service | Peran & Tanggung Jawab | Teknologi | Alokasi RAM (Limit / Reserve) | CPU Limit | Strategi Beban Ringan |
|---|---|---|---|---|---|
| **`gateway`** | Reverse proxy, static asset cache, kompresi respons | `nginx:1.27-alpine` | **64 MB** / 16 MB | 0.25 | Menangani koneksi idle, kompresi Gzip, dan menyajikan cache statis langsung tanpa membebani Node.js. |
| **`web`** | Frontend Web POS, antarmuka resep, dan manajemen apotek | `node:20-alpine` (Next.js Standalone) | **384 MB** / 128 MB | 1.00 | Menggunakan `output: 'standalone'` sehingga hanya menyertakan dependensi runtime minimal (~130MB image). |
| **`api`** | Engine perhitungan stok, transaksi kasir, kalkulasi resep FEFO | `node:20-alpine` (Express) | **256 MB** / 64 MB | 0.75 | Terpisah dari render UI. Beban kalkulasi inventaris berat tidak akan membuat antarmuka kasir membeku (*freeze*). |
| **`db`** | Penyimpanan relasional terpusat | `postgres:16-alpine` | **256 MB** / 64 MB | 0.50 | Dikonfigurasi dengan tuning hemat memori: `shared_buffers = 64MB`, `work_mem = 2MB`, `max_connections = 30`. |
| **`worker`** | Audit tanggal kedaluwarsa berkala & backup data harian | `node:20-alpine` | **128 MB** / 16 MB | 0.25 | Tugas audit berat dipindahkan ke latar belakang, menjaga respon kasir tetap di bawah 1 detik. |

> **Total Estimasi Konsumsi RAM Aktif:** ~300 MB – 450 MB untuk seluruh sistem berjalan bersamaan. Sangat aman dijalankan pada komputer dengan RAM 4 GB sekalipun.

---

## 3. Cara Menjalankan Layanan (Quick Start)

### A. Menggunakan Perintah Docker Compose Langsung
```bash
# Menjalankan seluruh 5 layanan di latar belakang & build otomatis
docker compose up -d --build

# Melihat status kontainer dan alokasi resource
docker compose ps

# Memeriksa log seluruh layanan secara real-time
docker compose logs -f

# Menghentikan seluruh layanan dengan aman
docker compose down
```

### B. Menggunakan Script NPM
```bash
# Start
npm run docker:up

# Status
npm run docker:ps

# Logs
npm run docker:logs

# Stop
npm run docker:down
```

---

## 4. Akses Layanan

- **Web POS & Dashboard:** [http://localhost:3000](http://localhost:3000) atau [http://localhost](http://localhost)
- **API Endpoint:** [http://localhost:3000/api/medicines](http://localhost:3000/api/medicines)
- **Gateway Healthcheck:** [http://localhost:3000/healthz](http://localhost:3000/healthz)
- **Database PostgreSQL:** `localhost:5432` (`apotek_user` / `apotek_secret` / database `apotek_db`)

---

## 5. Persistensi Data & Keamanan

1. **Volume Docker Terisolasi:**
   - `apotek_pg_data`: Menyimpan tabel data PostgreSQL secara permanen.
   - `apotek_shared_data`: Menyimpan berkas store JSON dan backup harian (`/app/data/backups/`).
2. **Jaringan Privat (`apotek-network`):**
   - Layanan `web`, `api`, `db`, dan `worker` berkomunikasi dalam jaringan internal terisolasi.
   - Hanya `gateway` (port 80/3000) dan port database (5432, opsional) yang diekspos ke luar kontainer.
