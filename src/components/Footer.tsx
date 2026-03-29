'use client';

import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';

export default function Footer() {
  const { lang } = useLanguage();

  const sources = [
    { name: "HKEX News", url: "https://www.hkexnews.hk" },
    { name: "SGX", url: "https://www.sgx.com" },
    { name: "UBS SP Portal", url: "https://www.ubs.com" },
    { name: "Bloomberg", url: "https://www.bloomberg.com" },
  ];

  return (
    <footer className="border-t border-zinc-800/80 mt-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[#c8a97e] text-lg font-light tracking-[0.15em]">SP</span>
              <span className="w-px h-4 bg-zinc-700" />
              <span className="text-zinc-400 text-xs tracking-widest uppercase">Tracker</span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
              {t("footer.disclaimer", lang)}
            </p>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-zinc-300 text-sm font-medium mb-4">{t("footer.sources", lang)}</h4>
            <div className="flex flex-col gap-2">
              {sources.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 text-xs hover:text-[#c8a97e] transition-colors">
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-zinc-300 text-sm font-medium mb-4">{t("footer.updated", lang)}</h4>
            <p className="text-zinc-500 text-xs">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-zinc-600 text-xs mt-6">© 2026 SP Tracker. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
