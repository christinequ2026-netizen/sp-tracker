'use client';

import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';
import type { DashboardStats } from '@/types';

interface Props {
  stats: DashboardStats;
}

export default function StatsPanel({ stats }: Props) {
  const { lang } = useLanguage();

  const items = [
    { label: t("stats.total", lang), value: stats.totalProducts.toLocaleString(), accent: false },
    { label: t("stats.today", lang), value: `+${stats.newToday}`, accent: true },
    { label: t("stats.week", lang), value: `+${stats.newThisWeek}`, accent: false },
    { label: t("stats.avgCoupon", lang), value: `${(stats.avgCoupon * 100).toFixed(1)}%`, accent: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-[#111113] border border-zinc-800/60 rounded-xl px-5 py-4 hover:border-zinc-700/80 transition-colors">
          <p className="text-zinc-500 text-xs tracking-wider uppercase mb-2">{item.label}</p>
          <p className={`text-2xl font-light tracking-tight ${item.accent ? 'text-[#c8a97e]' : 'text-zinc-100'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
