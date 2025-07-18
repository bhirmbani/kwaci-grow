import { formatCurrencyValue, DEFAULT_CURRENCY, parseCurrencyValue } from '@/lib/utils/currencyUtils'

export function formatCurrency(value: number, currency: string = DEFAULT_CURRENCY, short: boolean = false): string {
  return formatCurrencyValue(value, currency, short)
}

export function formatNumber(value: number, locale: string = 'id-ID'): string {
  // Handle NaN, undefined, null, and invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return new Intl.NumberFormat(locale).format(0)
  }

  return new Intl.NumberFormat(locale).format(value)
}

export function parseCurrency(value: string): number {
  return parseCurrencyValue(value)
}