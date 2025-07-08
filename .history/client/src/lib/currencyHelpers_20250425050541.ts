/**
 * Maps currency codes to their symbols
 */
const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
  'CNY': '¥',
  'SEK': 'kr',
  'NZD': 'NZ$',
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