export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);
}
