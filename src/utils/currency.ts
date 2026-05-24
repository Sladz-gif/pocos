export const getCurrencySymbol = (code: string = 'GHS') => {
  const symbols: Record<string, string> = {
    GHS: '₵',
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
  };
  return symbols[code] || code;
};

export const formatPrice = (price: number, code: string = 'GHS') => {
  const symbol = getCurrencySymbol(code);
  return `${symbol}${price.toLocaleString()}`;
};
