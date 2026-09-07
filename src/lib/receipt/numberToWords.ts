/**
 * Pure function to convert a monetary number to words in the Indian numbering system
 * (Crores, Lakhs, Thousands, Hundreds, tens, teens, ones, decimals) ending in "Only".
 *
 * @param num - String or number to convert (e.g. "2100", "16042", "100000")
 * @returns Words representation ending with "Only", or empty string if invalid/zero
 */
export function numberToWords(num: string | number): string {
  if (num === undefined || num === null) return '';
  const str = String(num).trim();
  if (!str || str === '0') return '';

  const numValue = parseFloat(str);
  if (isNaN(numValue) || numValue <= 0) return '';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertLessThanOneThousand = (n: number): string => {
    let result = '';

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred';
      n %= 100;
      if (n > 0) result += ' ';
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += ' ';
    }

    if (n >= 10 && n < 20) {
      result += teens[n - 10];
      n = 0;
    }

    if (n > 0 && n < 10) {
      result += ones[n];
    }

    return result;
  };

  let integerPart = Math.floor(numValue);
  const decimalPart = Math.round((numValue - integerPart) * 100);

  let words = '';

  if (integerPart === 0) {
    words = 'Zero';
  } else {
    if (integerPart >= 10000000) {
      words += convertLessThanOneThousand(Math.floor(integerPart / 10000000)) + ' Crore';
      integerPart %= 10000000;
      if (integerPart > 0) words += ' ';
    }

    if (integerPart >= 100000) {
      words += convertLessThanOneThousand(Math.floor(integerPart / 100000)) + ' Lakh';
      integerPart %= 100000;
      if (integerPart > 0) words += ' ';
    }

    if (integerPart >= 1000) {
      words += convertLessThanOneThousand(Math.floor(integerPart / 1000)) + ' Thousand';
      integerPart %= 1000;
      if (integerPart > 0) words += ' ';
    }

    if (integerPart > 0) {
      words += convertLessThanOneThousand(integerPart);
    }
  }

  words += ' Rupees';

  if (decimalPart > 0) {
    words += ' and ' + convertLessThanOneThousand(decimalPart) + ' Paise';
  }

  words += ' Only';

  return words;
}
