export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCoupon(rate: number | undefined): string {
  if (rate === undefined) return '—';
  return `${(rate * 100).toFixed(2)}% p.a.`;
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatCurrency(amount: number | undefined, currency: string): string {
  if (amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    active: 'status-active',
    upcoming: 'status-upcoming',
    matured: 'status-matured',
    knocked_in: 'status-knocked-in',
    knocked_out: 'status-knocked-out',
    early_redeemed: 'status-early-redeemed',
  };
  return map[status] ?? 'status-active';
}
