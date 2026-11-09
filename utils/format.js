export const formatPrice = (n) => '€ ' + Number(n).toLocaleString('en-GB', { maximumFractionDigits: 0 })
