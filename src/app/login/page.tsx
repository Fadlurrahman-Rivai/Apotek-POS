'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/database/schema';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Jika sudah login, langsung arahkan ke halaman utama atau kasir
  useEffect(() => {
    if (!loading && user) {
      if (user.role === UserRole.PEGAWAI) {
        router.replace('/pos');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Silakan masukkan username dan password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      // Redirect sesuai role
      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername === 'pegawai') {
        router.push('/pos');
      } else {
        router.push('/');
      }
    } else {
      setError(result.message || 'Login gagal.');
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'pegawai') => {
    setError('');
    setIsSubmitting(true);
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      const res = await login('admin', 'admin123');
      setIsSubmitting(false);
      if (res.success) router.push('/');
      else setError(res.message || 'Gagal login.');
    } else {
      setUsername('pegawai');
      setPassword('pegawai123');
      const res = await login('pegawai', 'pegawai123');
      setIsSubmitting(false);
      if (res.success) router.push('/pos');
      else setError(res.message || 'Gagal login.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090f1d' }}>
        <div style={{ color: 'var(--teal-400)', fontSize: '1rem', fontWeight: 600 }}>
          Memuat sesi pengguna...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #090f1d 0%, #0d1a30 50%, #091a26 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Background Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.2) 0%, rgba(13, 148, 136, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 118, 110, 0.2) 0%, rgba(15, 118, 110, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Card Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090f1d 0%, #112338 100%)',
            padding: '32px 24px 28px',
            textAlign: 'center',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.45)',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.02em', margin: 0 }}>
            APOTEK SEHAT SENTOSA
          </h1>
          <p style={{ color: 'var(--teal-300)', fontSize: '0.82rem', margin: '4px 0 0', fontWeight: 500 }}>
            Sistem Kasir POS &amp; Manajemen Farmasi
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px 26px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.857rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '6px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: '42px', paddingLeft: '38px', fontSize: '0.929rem' }}
                  placeholder="Masukkan username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--slate-400)',
                    display: 'flex',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="10" cy="6" r="4" />
                    <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ height: '42px', paddingLeft: '38px', paddingRight: '40px', fontSize: '0.929rem' }}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--slate-400)',
                    display: 'flex',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="9" width="12" height="9" rx="2" />
                    <path d="M7 9V6a3 3 0 016 0v3" />
                  </svg>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--slate-400)',
                    fontSize: '0.8rem',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '42px',
                fontSize: '0.95rem',
                fontWeight: 600,
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(13, 148, 136, 0.3)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Masuk ke Aplikasi'}
            </button>
          </form>

          {/* Quick Demo Access per Role */}
          <div style={{ marginTop: '26px', paddingTop: '20px', borderTop: '1px dashed var(--slate-200)' }}>
            <div
              style={{
                fontSize: '0.786rem',
                color: 'var(--slate-500)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              ⚡ Pilihan Akses Cepat (Role Demo)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Button Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={isSubmitting}
                style={{
                  background: 'var(--teal-50)',
                  border: '1px solid var(--teal-200)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--teal-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--teal-200)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '1rem' }}>👨‍⚕️</span>
                  <span style={{ fontWeight: 700, fontSize: '0.857rem', color: 'var(--teal-800)' }}>
                    Admin
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)', lineHeight: 1.3 }}>
                  Semua akses, harga &amp; analitik
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--teal-600)', marginTop: '4px', fontWeight: 600 }}>
                  admin / admin123
                </div>
              </button>

              {/* Button Pegawai */}
              <button
                type="button"
                onClick={() => handleQuickLogin('pegawai')}
                disabled={isSubmitting}
                style={{
                  background: 'var(--blue-50)',
                  border: '1px solid var(--blue-200)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--blue-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--blue-200)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '1rem' }}>👩‍💼</span>
                  <span style={{ fontWeight: 700, fontSize: '0.857rem', color: '#1e40af' }}>
                    Pegawai
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-600)', lineHeight: 1.3 }}>
                  Kasir POS, Resep &amp; Gudang
                </div>
                <div style={{ fontSize: '0.68rem', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>
                  pegawai / pegawai123
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
