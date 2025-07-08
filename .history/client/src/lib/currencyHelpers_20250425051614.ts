/**
 * Maps currency codes to their symbols
 */
const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CNY': '¥',
  'KRW': '₩',
  'INR': '₹',
  'RUB': '₽',
  'BRL': 'R$',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NZD': 'NZ$',
  'MXN': 'Mex$',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NOK': 'kr',
  'TRY': '₺',
  'ZAR': 'R',
  'PLN': 'zł'
};

/**
 * Get the symbol for a currency code
 * If no symbol is found, returns the currency code
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  const upperCurrency = currency.toUpperCase();
  return currencySymbols[upperCurrency] || upperCurrency;
}

/**
 * Format a number as currency with the given currency code
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl is not supported or currency is invalid
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
}