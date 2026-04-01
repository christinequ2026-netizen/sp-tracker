'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();

  const navLinks = [
    { label: t("nav.home", lang), href: '/' },
    { label: t("nav.products", lang), href: '/products' },
    { label: t("nav.education", lang), href: '/education' },
    { label: t("nav.issuers", lang), href: '#' },
    { label: t("nav.exchanges", lang), href: '#' },
    { label: t("nav.analytics", lang), href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-md">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#c8a97e]/60 to-transparent" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-[#c8a97e] text-xl font-light tracking-[0.15em]">SP</span>
            <span className="hidden sm:block w-px h-5 bg-zinc-700" />
            <span className="hidden sm:block text-zinc-400 text-xs tracking-widest uppercase">Tracker</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors tracking-wide">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-700/50 hover:border-[#c8a97e]/40 transition-all group">
              <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 tracking-wider font-medium">
                {lang === "zh" ? "EN" : "中"}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-live" />
              <span className="text-[11px] text-emerald-400 tracking-widest uppercase font-medium">
                {t("header.live", lang)}
              </span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors">
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 pt-3 pb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="h-px bg-zinc-800/80" />
    </header>
  );
}
