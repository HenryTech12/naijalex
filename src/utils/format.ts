export const formatNaira = (amount: number): string =>
  `₦${amount.toLocaleString('en-NG')}`;
