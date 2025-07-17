// Currency utility for Southeast Asian currencies

export interface Currency {
  code: string
  name: string
  symbol: string
  locale: string
  decimalPlaces: number
}

// Southeast Asian currencies
export const CURRENCIES: Record<string, Currency> = {
  IDR: {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    locale: 'id-ID',
    decimalPlaces: 0
  },
  THB: {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    locale: 'th-TH',
    decimalPlaces: 2
  },
  VND: {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    locale: 'vi-VN',
    decimalPlaces: 0
  },
  MYR: {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    locale: 'ms-MY',
    decimalPlaces: 2
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    locale: 'en-SG',
    decimalPlaces: 2
  },
  PHP: {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    locale: 'en-PH',
    decimalPlaces: 2
  },
  BND: {
    code: 'BND',
    name: 'Brunei Dollar',
    symbol: 'B$',
    locale: 'ms-BN',
    decimalPlaces: 2
  },
  MMK: {
    code: 'MMK',
    name: 'Myanmar Kyat',
    symbol: 'K',
    locale: 'my-MM',
    decimalPlaces: 0
  },
  KHR: {
    code: 'KHR',
    name: 'Cambodian Riel',
    symbol: '៛',
    locale: 'km-KH',
    decimalPlaces: 0
  },
  LAK: {
    code: 'LAK',
    name: 'Lao Kip',
    symbol: '₭',
    locale: 'lo-LA',
    decimalPlaces: 0
  }
}

// Default currency
export const DEFAULT_CURRENCY = 'IDR'

/**
 * Get currency information by code
 */
export function getCurrency(code: string): Currency {
  return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY]
}

/**
 * Get all available currencies as array for dropdowns
 */
export function getCurrencyOptions(): Array<{ value: string; label: string }> {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`
  }))
}

/**
 * Format currency value using the appropriate locale and currency
 */
export function formatCurrencyValue(
  value: number, 
  currencyCode: string = DEFAULT_CURRENCY, 
  short: boolean = false
): string {
  // Handle NaN, undefined, null, and invalid numbers
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    value = 0
  }

  const currency = getCurrency(currencyCode)

  // Short format for charts (K, M, B notation)
  if (short) {
    if (value >= 1000000000) {
      return `${currency.symbol}${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${currency.symbol}${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${currency.symbol}${(value / 1000).toFixed(1)}K`
    }
    return `${currency.symbol}${value}`
  }

  // Use Intl.NumberFormat for proper locale formatting
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(value)
  } catch (error) {
    // Fallback to manual formatting if locale is not supported
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(value)
    return `${currency.symbol}${formattedNumber}`
  }
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  return getCurrency(currencyCode).symbol
}

/**
 * Check if currency code is valid
 */
export function isValidCurrency(code: string): boolean {
  return code in CURRENCIES
}

/**
 * Parse currency string to number (removes currency symbols and formatting)
 */
export function parseCurrencyValue(value: string): number {
  return Number(value.replace(/[^\d.-]/g, ''))
}
