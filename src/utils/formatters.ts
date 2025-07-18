import { formatCurrencyValue, DEFAULT_CURRENCY, parseCurrencyValue } from '@/lib/utils/currencyUtils'
import { useBusinessStore } from '@/lib/stores/businessStore'

export function formatCurrency(value: number, currency?: string, short: boolean = false): string {
  const currentCurrency = currency || useBusinessStore.getState().currentBusiness?.currency || DEFAULT_CURRENCY
  return formatCurrencyValue(value, currentCurrency, short)
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