'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/pos', label: 'Kasir POS' },
    { href: '/prescription', label: 'Pengeluaran Resep' },
    { href: '/inventory', label: 'Katalog Obat' },
    { href: '/warehouse', label: 'Barang Datang' },
    { href: '/expiry', label: 'Kedaluwarsa' },
    { href: '/pricing', label: 'Harga & Import' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="top-navbar">
      {/* Brand & Store Name */}
      <div className="navbar-brand">
        <div className="navbar-store-name">APOTEK SEHAT SENTOSA</div>
        <div className="navbar-store-tag">Sistem Terpadu POS &amp; Resep</div>
      </div>

      {/* Nav Links Bar */}
      <nav className="navbar-links">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const isPrescription = link.href === '/prescription';

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link ${active ? 'navbar-link-active' : ''} ${
                isPrescription ? 'navbar-link-prescription' : ''
              }`}
            >
              <span>{link.label}</span>
              {isPrescription && <span className="navbar-rx-badge">Rx</span>}
            </Link>
          );
        })}
      </nav>

      {/* Right Side Status */}
      <div className="navbar-status">
        <span className="navbar-status-dot" />
        <span className="navbar-status-text">Kasir &amp; Resep Online</span>
      </div>
    </header>
  );
}
