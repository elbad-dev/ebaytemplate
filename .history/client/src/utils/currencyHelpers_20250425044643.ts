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
  'ZAR': 'R'
};

export function getCurrencySymbol(currency: string): string {
  const upperCurrency = currency.toUpperCase();
  return currencySymbols[upperCurrency] || upperCurrency;
}