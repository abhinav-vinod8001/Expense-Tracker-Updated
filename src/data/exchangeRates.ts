// Exchange rates to Indian Rupees (INR)
// Note: In a real application, these would be fetched from a live API
export const exchangeRates: Record<string, number> = {
  '$': 83.25,    // USD to INR
  '₹': 1,        // INR to INR
  '€': 90.15,    // EUR to INR
  '£': 105.50,   // GBP to INR
  '¥': 0.56,     // JPY to INR
  'C$': 61.75,   // CAD to INR
  'A$': 54.80,   // AUD to INR
  '₩': 0.063,    // KRW to INR
  '₽': 0.91,     // RUB to INR
};

export const convertToINR = (amount: number, fromCurrency: string): number => {
  const rate = exchangeRates[fromCurrency] || 1;
  return amount * rate;
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // First convert to INR, then to target currency
  const inrAmount = convertToINR(amount, fromCurrency);
  const targetRate = exchangeRates[toCurrency] || 1;
  return inrAmount / targetRate;
};

export const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrency = (amount: number, currency: string): string => {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const currencyNames: Record<string, string> = {
  '$': 'US Dollar (USD)',
  '₹': 'Indian Rupee (INR)',
  '€': 'Euro (EUR)',
  '£': 'British Pound (GBP)',
  '¥': 'Japanese Yen (JPY)',
  'C$': 'Canadian Dollar (CAD)',
  'A$': 'Australian Dollar (AUD)',
  '₩': 'South Korean Won (KRW)',
  '₽': 'Russian Ruble (RUB)',
};