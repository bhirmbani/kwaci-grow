export function formatCurrency(value: number): string {
  // Handle NaN, undefined, null, and invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(0)
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatNumber(value: number): string {
  // Handle NaN, undefined, null, and invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return new Intl.NumberFormat('id-ID').format(0)
  }

  return new Intl.NumberFormat('id-ID').format(value)
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[^\d]/g, ''))
}