// ============================================================
// Worker — Background Service: Audit Kedaluwarsa & Auto-Backup
// Menjalankan tugas berkala tanpa membebani thread kasir POS
// ============================================================

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const INTERVAL_SECONDS = parseInt(process.env.CHECK_INTERVAL_SECONDS || '3600', 10); // default per 1 jam

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function daysDiff(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function runAuditJob() {
  ensureDirs();
  console.log(`[Worker] Memulai audit berkala pada: ${new Date().toISOString()}`);

  if (!fs.existsSync(DB_FILE)) {
    console.log('[Worker] File store.json belum tersedia, menunggu siklus berikutnya...');
    return;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const store = JSON.parse(raw);

    let updatedCount = 0;
    let expiredCount = 0;
    let nearExpCount = 0;

    // 1. Audit status kedaluwarsa batch
    if (Array.isArray(store.batches)) {
      for (const batch of store.batches) {
        if (batch.status === 'RETURNED') continue;

        const days = daysDiff(batch.expiryDate);
        let newStatus = batch.status;

        if (days <= 0) {
          newStatus = 'EXPIRED';
          expiredCount++;
        } else if (days <= 90) {
          newStatus = 'NEAR_EXP';
          nearExpCount++;
        } else {
          newStatus = 'ACTIVE';
        }

        if (batch.status !== newStatus) {
          batch.status = newStatus;
          updatedCount++;
        }
      }
    }

    // 2. Simpan jika ada perubahan status
    if (updatedCount > 0) {
      fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
      console.log(`[Worker] Audit EXP selesai: ${updatedCount} batch diperbarui (${expiredCount} Expired, ${nearExpCount} Mendekati EXP).`);
    } else {
      console.log(`[Worker] Audit EXP selesai: Semua status batch mutakhir.`);
    }

    // 3. Backup harian otomatis
    const dateTag = new Date().toISOString().split('T')[0];
    const backupPath = path.join(BACKUP_DIR, `store_backup_${dateTag}.json`);

    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, raw, 'utf-8');
      console.log(`[Worker] Backup harian dibuat: ${backupPath}`);

      // Rotasi backup (simpan maksimal 7 hari terakhir)
      cleanOldBackups(7);
    }
  } catch (err) {
    console.error('[Worker] Terjadi kesalahan saat menjalankan audit:', err.message);
  }
}

function cleanOldBackups(maxKeep) {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('store_backup_') && f.endsWith('.json'))
      .sort();

    if (files.length > maxKeep) {
      const toDelete = files.slice(0, files.length - maxKeep);
      for (const f of toDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
        console.log(`[Worker] Menghapus backup lama: ${f}`);
      }
    }
  } catch (e) {
    console.error('[Worker] Gagal merotasi backup lama:', e.message);
  }
}

console.log(`[Worker] Background Scheduler Apotek aktif (interval: ${INTERVAL_SECONDS}s)`);

// Jalankan segera saat startup
runAuditJob();

// Jalankan berulang secara periodik
setInterval(runAuditJob, INTERVAL_SECONDS * 1000);
