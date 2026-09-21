# Product Requirements Document (PRD): Web POS Apotek Sederhana

## Problem Statement

Pengelolaan apotek skala kecil dan menengah masih banyak yang mengandalkan pembukuan manual di buku catatan atau lembar kasir terpisah:
1. **Pencatatan Penjualan Lambat & Rawan Salah:** Kasir harus menghafal atau mencari daftar harga obat secara manual di etalase, rawan salah hitung total belanja dan kembalian.
2. **Kekompleksan Satuan Bertingkat (Box vs Strip vs Butir):** Obat sering kali datang dan disimpan dalam bentuk **Box besar**, namun dijual ke pembeli dalam bentuk **Strip**, atau bahkan diberikan ke pasien resep dalam jumlah **setengah strip / butir**. Ketiadaan fitur konversi satuan otomatis membuat stok fisik dan sistem sering selisih besar.
3. **Pengeluaran Resep Parsial (Pecahan):** Resep dokter sering meresepkan jumlah yang tidak genap (misalnya: 5 butir atau 0.5 strip dari strip isi 10). Jika sistem kasir biasa hanya mendukung pengurangan bilangan bulat (1, 2, 3), apoteker terpaksa membulatkan atau mencatat manual, yang merusak akurasi stok pergudangan.
4. **Pembaruan Harga yang Memakan Waktu (Harga PBF Fluktuatif):** Harga obat dari distributor/PBF sering mengalami kenaikan secara berkala. Jika pengelola harus mengedit ratusan item obat satu per satu di sistem, prosesnya sangat lambat dan melelahkan tanpa adanya fasilitas import file (Excel/CSV).
5. **Pencatatan Barang Datang & Risiko Kedaluwarsa:** Saat barang datang dari supplier, staf sering lupa mencatat nomor batch dan tanggal EXP ke dalam buku stok, sehingga obat yang lama menumpuk di belakang dan baru diketahui rusak/kedaluwarsa saat sudah basi.
6. **Ketiadaan Peringatan Dini Obat Kadaluarsa:** Apotek mengalami kerugian finansial karena tidak memiliki sistem peringatan otomatis untuk memisahkan atau meretur obat yang masa berlakunya tinggal sedikit (1 hingga 3 bulan sebelum EXP).
7. **Pergudangan & Toko Tidak Terintegrasi:** Stok yang keluar untuk penjualan kasir vs stok yang keluar untuk peracikan/resep pasien sering dicatat di tempat terpisah, sehingga pengelola kesulitan melihat sisa stok bersih di gudang/apotek.

---

## Solution

Membangun aplikasi **Web POS (Point of Sale) Apotek Sederhana** yang ringan, cepat, dan fokus pada alur inti bisnis harian apotek:

1. **Kasir Penjualan Obat (Web POS):**
   - Antarmuka penjualan kasir cepat dengan pencarian nama obat instan.
   - Mendukung penjualan per Box, per Strip, maupun satuan eceran/butir.
   - Perhitungan otomatis subtotal, nominal bayar, dan uang kembalian.
   - Riwayat transaksi harian dan cetak ringkasan struk belanja.

2. **Penentuan & Pembaruan Harga Fleksibel (Input Langsung & Import File):**
   - **Input Langsung & Edit Cepat:** Pengelola dapat memasukkan harga beli (modal) dan harga jual langsung melalui formulir obat, serta dapat mengedit/mengubah harga sewaktu-waktu secara instan (*inline edit* atau tombol edit modal).
   - **Import File Massal (Excel / CSV):** Pengelola dapat mengunggah file Excel/CSV untuk memperbarui (*bulk update*) harga ratusan obat sekaligus atau mengimpor katalog obat baru.
   - **Download Template Import:** Menyediakan file template Excel/CSV yang rapi untuk mempermudah staf mengisi data sesuai format.
   - **Export Data Harga:** Pengelola dapat mengunduh (*export*) daftar harga obat terkini ke format Excel/CSV.

3. **Satuan Bertingkat & Pengeluaran Resep Parsial (Pecahan):**
   - **Hierarki Kemasan:** Konversi otomatis antara **Box ➡️ Strip ➡️ Tablet/Butir/Pcs**.
   - **Fitur Pecah Satuan / Buka Kemasan:** Memungkinkan staf membuka 1 Box menjadi beberapa Strip untuk dipajang di etalase/meja racik.
   - **Pengeluaran Fleksibel (Jual Biasa vs Resep Pasien):**
     - Jalur penjualan kasir umum (OTC).
     - Jalur pengeluaran untuk resep dokter, mendukung pengurangan pecahan (misal: **0.5 strip**, atau input per **5 tablet/butir**).

4. **Pergudangan Terintegrasi (Unified Stock Management):**
   - Seluruh stok (baik yang ada di gudang penyimpanan maupun etalase kasir) terpusat dalam satu basis data terintegrasi.
   - Setiap pengurangan dari transaksi kasir maupun pengeluaran resep pasien secara otomatis memotong stok pergudangan secara *real-time*.

5. **Katalog & Stok Obat Berdasarkan Bentuk Sediaan:**
   - Pengelompokan bentuk sediaan: **Tablet**, **Sirup**, **Salep/Krim**, **Kapsul**, **Tetes (Drop)**, dll.
   - Penentuan harga bertingkat: harga beli dan harga jual (per Box, per Strip, per Pcs/Butir).
   - Batas stok minimum (*safety stock*).

6. **Pergudangan Stok & Input Barang Datang:**
   - Form pencatatan barang datang dari pemasok (nama obat, pilihan satuan masuk misal Box/Botol/Tube, jumlah masuk, tanggal EXP, nomor batch, dan harga beli).
   - Penambahan stok otomatis ke inventaris begitu barang datang disimpan.
   - Riwayat log penerimaan barang datang.

7. **Sistem Pengingat Kedaluwarsa (EXP Reminder & Warning):**
   - Dashboard alert dengan indikator warna yang jelas:
     - 🔴 **Merah (Sudah Kadaluarsa):** Otomatis dicegah untuk dijual di kasir dan resep.
     - 🟡 **Kuning (Mendekati EXP / Kritis):** Obat dengan sisa masa berlaku < 30 hari, 60 hari, atau 90 hari agar segera diretur/didiskon.
     - 🟢 **Hijau (Aman):** Masa berlaku masih panjang (> 90 hari).
   - Filter cepat pada daftar stok untuk menyaring obat-obat yang mendekati masa kadaluarsa.

---

## User Stories

### A. Kasir & Penjualan Obat (POS)
1. Sebagai Kasir, saya ingin mencari obat dengan mengetikkan nama obat pada kolom pencarian kasir, sehingga saya dapat menemukan obat dalam hitungan detik.
2. Sebagai Kasir, saya ingin memilih satuan jual saat transaksi (misal: jual 1 Box penuh, atau jual 2 Strip saja), sehingga harga otomatis menyesuaikan satuan yang dipilih pembeli.
3. Sebagai Kasir, saya ingin sistem secara otomatis mencegah penjualan obat jika tanggal EXP obat tersebut sudah lewat.
4. Sebagai Kasir, saya ingin sistem memvalidasi sisa stok saat transaksi, sehingga saya tidak dapat menjual melebihi jumlah stok yang tersedia di gudang/toko.
5. Sebagai Kasir, saya ingin memasukkan nominal uang yang diterima dari pembeli, sehingga sistem langsung menghitung nominal uang kembalian dengan tepat.
6. Sebagai Kasir, saya ingin menyelesaikan transaksi dan mencetak atau menampilkan struk penjualan sederhana (nama apotek, daftar obat, kuantitas, harga, total, kembalian).
7. Sebagai Kasir / Pengelola, saya ingin melihat daftar transaksi penjualan hari ini, sehingga saya mengetahui total uang masuk harian.

### B. Penentuan Harga (Input Langsung, Edit Cepat & Import File)
8. Sebagai Pengelola Apotek, saya ingin memasukkan harga beli dan harga jual saat mendaftarkan obat baru secara langsung melalui form input.
9. Sebagai Pengelola Apotek, saya ingin mengedit harga beli maupun harga jual obat kapan saja secara langsung di aplikasi (misal saat ada kenaikan harga dari distributor), sehingga harga langsung berlaku di kasir saat itu juga.
10. Sebagai Pengelola Apotek, saya ingin mengunduh template Excel/CSV yang sudah disiapkan sistem, agar saya mengetahui format kolom yang harus diisi.
11. Sebagai Pengelola Apotek, saya ingin mengunggah file Excel atau CSV yang berisi daftar obat dan harga baru, sehingga sistem otomatis memperbarui (*bulk update*) harga obat yang sudah ada atau menambahkan obat baru jika belum terdaftar.
12. Sebagai Pengelola Apotek, saya ingin mendapatkan laporan pratinjau (*preview*) dan pesan konfirmasi sebelum file import disimpan ke database, sehingga saya dapat memastikan data harga yang diunggah sudah benar.
13. Sebagai Pengelola Apotek, saya ingin mengekspor seluruh katalog obat dan daftar harganya ke dalam file Excel/CSV untuk keperluan arsip atau pembukuan luar sistem.

### C. Satuan Bertingkat & Pengeluaran Resep Parsial
14. Sebagai Pengelola Apotek, saya ingin mengatur konversi isi kemasan obat (misal: 1 Box Amoxicillin = 10 Strip, 1 Strip = 10 Tablet), sehingga sistem memahami hierarki satuan obat tersebut.
15. Sebagai Asisten Apoteker / Kasir, saya ingin mengeluarkan obat untuk keperluan resep pasien dengan jumlah pecahan (contoh: **0.5 strip** atau **5 tablet**), sehingga obat yang diracik/diberikan ke pasien tercatat persis sesuai dosis resep.
16. Sebagai Pengelola Stok, saya ingin melakukan aksi "Buka Box Menjadi Strip" (Unbox), sehingga stok 1 Box berkurang dan stok eceran bertambah sesuai rasio konversi.
17. Sebagai Pengelola Apotek, saya ingin melihat rincian riwayat pengeluaran stok yang membedakan antara "Keluar via Kasir Penjualan" vs "Keluar via Keperluan Resep", agar transparansi penggunaan obat tetap terjaga.

### D. Manajemen Master Obat & Bentuk Sediaan
18. Sebagai Pengelola Apotek, saya ingin menambahkan data obat baru dengan nama obat, jenis sediaan (Tablet, Sirup, Salep, Kapsul, Tetes, dll), satuan utama (Box, Botol, Tube), harga beli, dan harga jual.
19. Sebagai Pengelola Apotek, saya ingin memfilter daftar obat berdasarkan jenis sediaannya (misal: kelompok sirup, tablet, salep), agar penataan stok di rak etalase lebih mudah.
20. Sebagai Pengelola Apotek, saya ingin menentukan batas minimum stok untuk masing-masing obat, sehingga sistem memberi tanda saat stok menipis.

### E. Pergudangan & Input Barang Datang
21. Sebagai Pengelola Gudang / Staf Apotek, saya ingin membuka form "Input Barang Datang" untuk mencatat obat yang baru dikirim oleh distributor dalam satuan Box atau Botol/Tube.
22. Sebagai Staf Apotek, saya ingin mencatat nomor batch, tanggal kedaluwarsa (EXP Date), jumlah stok masuk, dan nama distributor pada saat input barang datang.
23. Sebagai Staf Apotek, saya ingin stok obat utama di pergudangan otomatis bertambah segera setelah data barang datang disubmit.
24. Sebagai Pengelola Apotek, saya ingin melihat riwayat penerimaan barang datang lengkap dengan tanggal masuk dan keterangan supplier untuk keperluan pelacakan.
25. Sebagai Pengelola Gudang, saya ingin dapat melakukan penyesuaian stok manual (koreksi stok fisik jika ada botol sirup pecah atau strip tablet rusak) disertai catatan alasan.

### F. Pengingat & Manajemen Kedaluwarsa (EXP Reminder)
26. Sebagai Pengelola Apotek, saya ingin melihat widget/badge peringatan di dashboard utama yang menampilkan jumlah obat yang sudah kedaluwarsa dan yang mendekati kedaluwarsa.
27. Sebagai Pengelola Apotek, saya ingin memfilter daftar stok obat berdasarkan parameter kedaluwarsa: *Sudah EXP*, *EXP < 30 Hari*, *EXP < 60 Hari*, dan *EXP < 90 Hari*.
28. Sebagai Staf Apotek, saya ingin melihat tanggal EXP secara jelas dan mencolok di setiap baris tabel stok (dengan warna indikator merah/kuning/hijau).
29. Sebagai Pengelola Apotek, saya ingin mengeluarkan atau menandai stok obat yang sudah kedaluwarsa sebagai "Karantina / Siap Retur", sehingga stok tersebut dikeluarkan dari inventaris penjualan.

---

## Implementation Decisions

### 1. Architectural Decisions & Tech Stack
- **Technology Stack:**
  - **Frontend:** Next.js (React framework, App Router, SSR & interactive client components, responsive UI)
  - **Backend:** Node.js (REST API / Server Routes / Services)
  - **Database:** PostgreSQL (Relational Database dengan skema terstruktur, ACID-compliant untuk integritas data obat, stok batch, transaksi, dan mutasi pergudangan)
- **Teknologi Platform:** Berbasis Web (Fullstack Web App modern) yang responsif dan cepat, dapat diakses dari browser PC kasir, laptop, maupun tablet staf apotek.
- **Mekanisme Import & Ekspor File:** Menggunakan library parser spreadsheet client-side/server-side yang efisien (misal: SheetJS `xlsx` atau parser CSV teroptimasi) sehingga proses unggah file Excel/CSV tidak membebani server dan langsung menampilkan pratinjau ke pengguna.
- **Penyimpanan Terintegrasi (Single Unified Stock):** Seluruh pengurangan (baik dari kasir penjualan langsung maupun pengeluaran resep parsial) bermuara pada satu tabel stok inventaris terpusat.
- **Prinsip Konversi Basis Satuan Terkecil (*Base Unit Strategy*):**
  - Untuk obat kemasan bertingkat: 1 Box = 10 Strip = 100 Tablet.
  - Menjual 0.5 strip = memotong 5 tablet dari total stok pergudangan.
  - Menjual 1 box = memotong 100 tablet (atau 10 strip) dari total stok pergudangan.
  - Untuk sirup/salep/tetes: satuan dasar adalah Botol / Tube / Botol Tetes.

### 2. Module Boundaries
- **Module POS (Kasir Penjualan):** Penjualan obat reguler per box/strip/botol, perhitungan kembalian, struk kasir.
- **Module Pricing & Import/Export (Manajemen Harga & File):**
  - Form input & edit harga langsung.
  - Parser file Excel/CSV, validator kolom, pratinjau sebelum simpan, dan download template.
- **Module Prescription Dispense (Pengeluaran Resep):** Formulir khusus untuk mengeluarkan obat resep (mendukung jumlah pecahan / 0.5 strip / butiran) dengan input catatan dokter/pasien.
- **Module Inventory & Conversion (Katalog Obat & Konversi):** Master obat, klasifikasi sediaan (Sirup, Tablet, Salep, dll), rasio konversi (Strip/Box, Pcs/Strip), dan aksi buka kemasan (unboxing).
- **Module Receiving (Barang Datang & Gudang):** Pencatatan penerimaan stok baru, batch, EXP date, dan histori barang masuk.
- **Module Expiry Monitor (Pengingat EXP):** Kalkulator selisih hari kedaluwarsa, badge warna peringatan, dan proteksi checkout.

### 3. Data Schema & Core Entities

#### Entity: `Medicine` (Master Obat & Harga)
- `id`: string (UUID / Auto-increment)
- `name`: string (Nama Obat, misal: *Paracetamol 500mg*, *Sanmol Sirup 60ml*, *Salep Kalpanax*)
- `category`: string enum (`TABLET`, `SIRUP`, `SALEP`, `KAPSUL`, `TETES`, `LAINNYA`)
- `baseUnit`: string (Satuan dasar, misal: `Pcs`, `Botol`, `Tube`)
- `secondaryUnit`: string (Satuan menengah, misal: `Strip`, opsional)
- `tertiaryUnit`: string (Satuan besar, misal: `Box`, opsional)
- `piecesPerSecondary`: number (Jumlah pcs per strip, contoh: 10)
- `secondaryPerTertiary`: number (Jumlah strip per box, contoh: 10)
- `buyPrice`: number (Harga beli / modal)
- `sellPrice`: number (Harga jual satuan dasar / box)
- `sellPriceSecondary`: number (Harga jual per strip, opsional)
- `minStock`: number (Batas minimal stok)
- `updatedAt`: timestamp

#### Format Kolom File Import (Excel / CSV Template)
| Kolom Excel/CSV | Keterangan | Contoh Nilai | Wajib? |
|---|---|---|---|
| `nama_obat` | Nama lengkap obat | Paracetamol 500mg | Ya |
| `bentuk_sediaan` | Kategori obat | TABLET / SIRUP / SALEP | Ya |
| `satuan_dasar` | Satuan terkecil | Tablet / Botol / Tube | Ya |
| `satuan_tengah` | Satuan tingkat 2 | Strip (kosongkan jika sirup) | Opsional |
| `satuan_besar` | Satuan tingkat 3 | Box (kosongkan jika sirup) | Opsional |
| `isi_per_strip` | Jumlah butir dlm 1 strip | 10 | Opsional |
| `strip_per_box` | Jumlah strip dlm 1 box | 10 | Opsional |
| `harga_beli` | Modal beli per unit | 45000 | Ya |
| `harga_jual_box` | Harga jual per box | 55000 | Ya |
| `harga_jual_strip` | Harga jual per strip | 6000 | Opsional |
| `stok_minimum` | Batas safety stock | 10 | Ya |

#### Entity: `StockBatch` (Stok Pergudangan Terintegrasi & Kedaluwarsa)
- `id`: string
- `medicineId`: foreign key -> `Medicine.id`
- `batchNumber`: string (Nomor Batch pabrik)
- `expiryDate`: date (Tanggal Kedaluwarsa)
- `totalBaseQty`: number (Total stok dalam satuan dasar, misal 250 tablet)
- `supplierName`: string
- `receivedDate`: date
- `status`: string enum (`ACTIVE`, `NEAR_EXP`, `EXPIRED`, `RETURNED`)

#### Entity: `StockMutation` (Log Mutasi Stok Terpadu)
- `id`: string
- `medicineId`: foreign key -> `Medicine.id`
- `batchId`: foreign key -> `StockBatch.id`
- `mutationType`: string enum (`BARANG_DATANG`, `PENJUALAN_KASIR`, `PENGELUARAN_RESEP`, `KOREKSI_RUSAK`)
- `qtyChange`: number (Perubahan dalam satuan dasar)
- `unitUsed`: string (Satuan yang dipilih staf saat input, misal: `0.5 Strip`, `1 Box`, `5 Tablet`)
- `referenceNumber`: string
- `notes`: string
- `createdAt`: timestamp

#### Entity: `Sale` & `SaleItem` (Transaksi Kasir)
- `Sale`: `id`, `invoiceNumber`, `totalAmount`, `amountPaid`, `changeAmount`, `createdAt`
- `SaleItem`: `id`, `saleId`, `medicineId`, `batchId`, `unit` (`BOX`, `STRIP`, `PCS`), `quantity` (bisa desimal), `unitPrice`, `subtotal`

### 4. Logic & Interaction Decisions
- **Mekanisme Import & Sinkronisasi Harga:**
  - Jika `nama_obat` pada file sudah cocok dengan data di database, sistem melakukan **Update Harga** (`buyPrice`, `sellPrice`, dll).
  - Jika belum ada di database, sistem menambahkan obat baru (**Insert Baru**).
  - Validasi ketat: jika ada nilai harga yang bernilai negatif atau bukan angka, baris tersebut ditandai dengan pesan kesalahan di tampilan preview sebelum proses commit.
- **Penanganan Pecahan (Fractional Dispensing):**
  - Input kuantitas mendukung desimal (contoh: `0.5` strip) atau input dalam satuan terkecil (contoh: `5` tablet).
  - Sistem mengonversi input desimal tersebut ke satuan dasar pergudangan tanpa pembulatan yang merugikan.
- **Aturan Pengingat Kedaluwarsa (Expiry Alert):**
  - `daysUntilExp <= 0`: **EXPIRED (Merah)** -> Diblokir dari penjualan kasir & resep.
  - `1 <= daysUntilExp <= 30`: **CRITICAL (< 30 Hari - Oranye Kemerahan)**.
  - `31 <= daysUntilExp <= 90`: **WARNING (30-90 Hari - Kuning)**.
  - `> 90`: **SAFE (Hijau)**.

---

## Testing Decisions

### 1. Kriteria Pengujian yang Baik
- Menjamin fungsi edit harga langsung langsung terefleksi pada transaksi baru di kasir.
- Memastikan file import Excel/CSV dapat membaca ratusan baris data dan memperbarui harga tanpa merusak relasi stok batch yang ada.
- Menolak file import yang rusak atau kolom tidak sesuai dengan menampilkan pesan error informatif per baris.

### 2. Modul yang Wajib Diuji
- **Pengujian Penentuan & Import Harga:**
  - Uji edit langsung harga jual obat -> cek apakah kasir langsung mengenakan harga baru tersebut.
  - Uji unggah file Excel/CSV dengan 50 baris data pembaruan harga -> pastikan seluruh data terupdate sesuai kolom.
  - Uji download template Excel/CSV -> pastikan file template dapat dibuka dan memiliki header kolom yang benar.
- **Pengujian Konversi Satuan & Pecahan:**
  - Input pengeluaran resep 0.5 strip (isi 10 tablet per strip) harus mengurangi stok total sebesar tepat 5 tablet.
  - Membuka 1 box isi 10 strip harus mencatat pengurangan 1 box dan penambahan 10 strip.
- **Pengujian Integrasi Stok Pergudangan:**
  - Verifikasi bahwa penjualan kasir dan pengeluaran resep sama-sama mengurangi tabel `StockBatch` yang bersangkutan.
  - Verifikasi tabel riwayat mutasi stok mencatat jenis pengeluaran dengan benar (`PENJUALAN_KASIR` vs `PENGELUARAN_RESEP`).
- **Pengujian Logika EXP:**
  - Verifikasi akurasi filter < 30 hari, < 60 hari, < 90 hari, dan pencegahan transaksi jika barang sudah expired.

---

## Out of Scope (Untuk Versi Sederhana Ini)

1. **Bridging BPJS / SatuSehat:** Ditiadakan agar fokus pada operasional mandiri apotek.
2. **Kalkulasi Dosis Farmakologi Kompleks:** Dokter/apoteker menentukan dosis sendiri; sistem hanya mencatat jumlah fisik obat yang keluar.
3. **Multi-Cabang Terpisah:** Sistem dioptimasi untuk 1 toko & 1 gudang apotek yang terintegrasi.
4. **Akuntansi Buku Besar Lanjutan:** Cukup mencatat uang masuk penjualan kasir dan modal beli barang masuk.

---

## Further Notes

- **Format Template Excel/CSV:** Template harus menyertakan contoh data baris pertama agar staf apotek tidak bingung membedakan antara format sediaan Tablet (bertingkat Box-Strip-Pcs) dan Sirup/Salep (satuan tunggal Botol/Tube).
