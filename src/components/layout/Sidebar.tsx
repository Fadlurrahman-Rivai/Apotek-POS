'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  adminOnly?: boolean;
}

// SVG icons matching the exact iconography in the reference screenshot
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="8" rx="1.5" />
      <rect x="11" y="2" width="7" height="5" rx="1.5" />
      <rect x="2" y="12" width="7" height="6" rx="1.5" />
      <rect x="11" y="9" width="7" height="9" rx="1.5" />
    </svg>
  ),
  pos: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="14" rx="2" />
      <line x1="2" y1="8" x2="18" y2="8" />
      <line x1="8" y1="8" x2="8" y2="17" />
    </svg>
  ),
  inventory: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" />
      <path d="M3 6l7 4" />
      <path d="M17 6l-7 4" />
      <line x1="10" y1="10" x2="10" y2="18" />
    </svg>
  ),
  warehouse: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10L10 4l7 6" />
      <rect x="4" y="10" width="12" height="7" rx="1" />
      <line x1="8" y1="13" x2="12" y2="13" />
    </svg>
  ),
  barangDatang: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17h12" />
      <path d="M10 3v10" />
      <path d="M6 9l4 4 4-4" />
    </svg>
  ),
  prescription: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="2" />
      <line x1="7" y1="6" x2="13" y2="6" />
      <line x1="7" y1="9" x2="13" y2="9" />
      <line x1="7" y1="12" x2="10" y2="12" />
    </svg>
  ),
  expiry: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7.5" />
      <line x1="10" y1="6" x2="10" y2="10" />
      <line x1="10" y1="10" x2="13" y2="12" />
    </svg>
  ),
  pricing: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="3" x2="10" y2="17" />
      <path d="M13 5.5H8.5a2 2 0 000 4h3a2 2 0 010 4H7" />
    </svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="19" y2="6" />
      <line x1="3" y1="11" x2="19" y2="11" />
      <line x1="3" y1="16" x2="19" y2="16" />
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  ),
};

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: icons.dashboard },
  { href: '/pos', label: 'Kasir POS', icon: icons.pos },
  { href: '/inventory', label: 'Katalog Obat', icon: icons.inventory },
  { href: '/gudang', label: 'Gudang', icon: icons.warehouse },
  { href: '/warehouse', label: 'Barang Datang', icon: icons.barangDatang },
  { href: '/prescription', label: 'Pengeluaran Resep', icon: icons.prescription, badge: 'Rx' },
  { href: '/expiry', label: 'Kedaluwarsa', icon: icons.expiry },
  { href: '/pricing', label: 'Harga & Import', icon: icons.pricing, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Pegawai hanya melihat menu operasional, menu khusus admin disembunyikan
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu navigasi"
      >
        {icons.menu}
      </button>

      {/* Overlay for mobile view */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Header Branding — Apotek POS & Sistem Kasir */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <div className="sidebar-title">Apotek POS</div>
              <div className="sidebar-subtitle">Sistem Kasir</div>
            </div>
          </div>
          <button
            className="sidebar-close-mobile"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            {icons.close}
          </button>
        </div>

        {/* Navigation Links — Horizontal Flex layout (Icon + Text) */}
        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge sidebar-badge-teal">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(20, 184, 166, 0.2)',
                      color: 'var(--teal-300)',
                      marginLeft: 'auto',
                      marginRight: '6px',
                    }}
                  >
                    Admin
                  </span>
                )}
                <span className="sidebar-active-indicator" />
              </Link>
            );
          })}
        </nav>

        {/* Footer Info & User Profile */}
        <div className="sidebar-footer" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.2rem' }}>{user.avatar || (user.role === 'ADMIN' ? '👨‍⚕️' : '👩‍💼')}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '120px',
                    }}
                    title={user.name}
                  >
                    {user.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: user.role === 'ADMIN' ? 'rgba(13, 148, 136, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                        color: user.role === 'ADMIN' ? 'var(--teal-300)' : '#93c5fd',
                        border: user.role === 'ADMIN' ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title="Keluar dari akun"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17H4a2 2 0 01-2-2V5a2 2 0 012-2h3M13 14l4-4-4-4M17 10H7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-400)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="sidebar-status-dot" />
              <span>Sistem Kasir Aktif</span>
            </div>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
