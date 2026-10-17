export function formatRelativeAge(ageMinutes: number, locale: string): string {
  const minutes = Math.max(0, Math.floor(Number.isFinite(ageMinutes) ? ageMinutes : 0));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'short' });

  if (minutes < 60) return formatter.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, 'hour');
  return formatter.format(-Math.floor(hours / 24), 'day');
}

export function getAgeStatusColor(ageMinutes: number): string {
  if (ageMinutes <= 60) return 'var(--status-green, #16866A)';
  if (ageMinutes <= 180) return 'var(--risk-moderate, #d97706)';
  return 'var(--risk-severe, #dc2626)';
}
