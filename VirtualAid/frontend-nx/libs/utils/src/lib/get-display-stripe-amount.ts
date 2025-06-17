export function getDisplayStripeAmount(currency: string, amount: number) {
  if (currency.toLowerCase() === 'EUR') {
    return `${(amount / 100).toFixed(2)}`;
  }
  return `\u20ac ${amount}`;
}

export default getDisplayStripeAmount;
