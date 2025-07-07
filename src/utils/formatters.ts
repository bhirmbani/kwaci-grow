export function formatCurrency(value: number, short: boolean = false): string {
  // Handle NaN, undefined, null, and invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(0)
  }

  // Short format for charts (K, M, B notation)
  if (short) {
    if (value >= 1000000000) {
      return `Rp${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `Rp${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `Rp${(value / 1000).toFixed(1)}K`
    }
    return `Rp${value}`
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