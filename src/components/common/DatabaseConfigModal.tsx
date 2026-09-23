'use client';

import React, { useState, useEffect } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseReady,
  getSupabase,
} from '@/lib/supabase';
import { syncFromCloud } from '@/database/db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_SCRIPT = `-- ============================================================
-- SQL Schema untuk Apotek POS (Jalankan di SQL Editor Supabase)
-- ============================================================

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

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  change_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS warehouse_rows (
  id TEXT PRIMARY KEY,
  row_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public All Medicines" ON medicines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Batches" ON stock_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Mutations" ON stock_mutations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Sale Items" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Warehouse Rows" ON warehouse_rows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Warehouse Meta" ON warehouse_meta FOR ALL USING (true) WITH CHECK (true);
`;

export default function DatabaseConfigModal({ isOpen, onClose }: Props) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = isSupabaseReady();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setStatusMessage({ type: 'error', text: 'URL dan API Key Supabase wajib diisi!' });
      return;
    }

    if (!url.startsWith('https://')) {
      setStatusMessage({ type: 'error', text: 'URL Supabase harus diawali dengan https://' });
      return;
    }

    setTesting(true);
    setStatusMessage({ type: 'info', text: 'Menghubungkan ke Supabase & memverifikasi tabel...' });

    try {
      saveSupabaseCredentials(url.trim(), key.trim());
      const sb = getSupabase();
      if (!sb) {
        throw new Error('Gagal menginisialisasi client Supabase.');
      }

      // Tes koneksi dengan query sederhana
      const { error } = await sb.from('medicines').select('id').limit(1);
      if (error) {
        throw new Error(`Koneksi berhasil tetapi tabel belum siap: ${error.message}. Pastikan Anda sudah menjalankan Script SQL di Supabase SQL Editor.`);
      }

      // Sinkronkan data langsung
      await syncFromCloud();

      setStatusMessage({
        type: 'success',
        text: 'Alhamdulillah! Berhasil terhubung ke Supabase. Seluruh data sekarang tersinkronisasi antar semua perangkat!',
      });

      setTimeout(() => {
        onClose();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Test connection error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal terhubung ke database. Periksa kembali URL dan API Key.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Apakah Anda ingin memutuskan koneksi database cloud dan kembali ke mode penyimpanan lokal?')) {
      saveSupabaseCredentials('', '');
      setStatusMessage({ type: 'info', text: 'Koneksi cloud diputuskan. Aplikasi berjalan dalam mode lokal.' });
      setTimeout(() => {
        onClose();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 120 }}>
      <div className="modal-content modal-wide" style={{ maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isConnected ? 'var(--teal-50)' : '#fef3c7',
                color: isConnected ? 'var(--teal-700)' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Hubungkan 1 Database Online (Supabase)</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Sinkronkan seluruh data HP, laptop kasir, dan tablet dalam 1 database terpusat real-time.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: '18px 22px', gap: '16px' }}>
          {/* Status Bar */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: isConnected ? 'var(--teal-50)' : '#f8fafc',
              border: `1px solid ${isConnected ? 'var(--teal-200)' : 'var(--slate-200)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isConnected ? '#22c55e' : '#f59e0b',
                  boxShadow: isConnected ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
                }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isConnected ? 'var(--teal-900)' : 'var(--slate-700)' }}>
                {isConnected ? 'Status: Terhubung ke Cloud Database' : 'Status: Belum Terhubung (Mode Penyimpanan Browser/Lokal)'}
              </span>
            </div>
            {isConnected && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--red-600)', fontSize: '0.8rem' }}
                onClick={handleDisconnect}
              >
                Putuskan
              </button>
            )}
          </div>

          {statusMessage && (
            <div
              className={`toast ${
                statusMessage.type === 'success'
                  ? 'toast-success'
                  : statusMessage.type === 'error'
                  ? 'toast-error'
                  : ''
              }`}
              style={{ padding: '10px 14px', fontSize: '0.85rem' }}
            >
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Form Credentials */}
          <form onSubmit={handleTestAndSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Project URL Supabase <span style={{ color: 'var(--red-500)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <span className="form-hint">Didapat dari dashboard Supabase: Project Settings ➔ API ➔ Project URL</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                API Anon / Public Key Supabase <span style={{ color: 'var(--red-500)' }}>*</span>
              </label>
              <textarea
                className="form-input"
                rows={2}
                style={{ height: 'auto', padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
              <span className="form-hint">Didapat dari dashboard Supabase: Project Settings ➔ API ➔ Project API keys (anon public)</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={testing}
                style={{ flex: 1, justifyContent: 'center', background: 'var(--teal-700)', minHeight: '42px' }}
              >
                {testing ? 'Sedang Memverifikasi & Menyinkronkan...' : 'Simpan & Sinkronkan Semua Perangkat'}
              </button>
            </div>
          </form>

          {/* Panduan 3 Langkah Mudah */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--slate-200)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginTop: '4px',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)', marginBottom: '8px' }}>
              Panduan 3 Langkah Membuat Database Supabase (100% Gratis):
            </div>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              <li>
                Buka <strong>supabase.com</strong>, daftar gratis, lalu klik <strong>New Project</strong> (beri nama misal: <em>Apotek-POS</em>).
              </li>
              <li>
                Buka menu <strong>SQL Editor</strong> di Supabase, lalu salin dan tempel Script SQL di bawah ini, kemudian klik <strong>Run</strong>.
              </li>
              <li>
                Buka menu <strong>Project Settings ➔ API</strong>, salin <em>Project URL</em> dan <em>anon public key</em> ke formulir di atas, lalu klik tombol Simpan.
              </li>
            </ol>

            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopySql}
                style={{ borderColor: 'var(--teal-600)', color: 'var(--teal-800)', fontWeight: 600 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copied ? 'Berhasil Disalin! ✓' : 'Salin Script SQL Schema'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowSql(!showSql)}
                style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}
              >
                {showSql ? 'Sembunyikan SQL' : 'Lihat Script SQL'}
              </button>
            </div>

            {showSql && (
              <pre
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  marginTop: '10px',
                }}
              >
                {SQL_SCHEMA_SCRIPT}
              </pre>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--slate-200)', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
