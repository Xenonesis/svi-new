import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export function cleanIndianPhoneNumber(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhoneNumber(phone: string): boolean {
  const cleaned = cleanIndianPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function buildReceiptWhatsAppMessage(receipt: SavedReceipt, siteUrl = ''): string {
  const d = receipt.form_data || ({} as SavedReceipt['form_data']);
  const clientName = d.name
    ? d.salutation
      ? `${d.salutation} ${d.name}`.trim()
      : d.name
    : 'Valued Customer';
  const amountVal = parseFloat(d.amount || '0') || 0;
  const formattedAmount = amountVal.toLocaleString('en-IN', {
    maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
  });
  const plotInfo = d.plotNo
    ? `towards Plot ${d.plotNo}${d.plotSize ? ` (${d.plotSize} Sq. Yds.)` : ''}`
    : '';
  const refInfo = d.refId ? ` (Ref ID: ${d.refId})` : '';
  const baseUrl =
    siteUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.sviinfrasolutions.com');
  const receiptLink = `${baseUrl}/admin/payment-receipts`;

  return (
    `Dear ${clientName},\n\n` +
    `Greetings from *SVI Infra Solutions*.\n` +
    `We gratefully acknowledge receipt of your payment of *₹${formattedAmount}* ${plotInfo}${refInfo}.\n\n` +
    `📄 *Receipt Details:*\n` +
    `• *Receipt No:* #${d.receiptNo || 'N/A'}\n` +
    `• *Date:* ${d.date || 'N/A'}\n` +
    `• *Payment Mode:* ${d.paymentMethod || 'UPI'}` +
    (d.paymentRef ? ` (Ref: ${d.paymentRef})` : '') +
    `\n\n` +
    `View or download your receipt here:\n` +
    `${receiptLink}\n\n` +
    `For any assistance or queries regarding your booking, please feel free to reach out to us.\n\n` +
    `*SVI Infra Solutions Team*`
  );
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = cleanIndianPhoneNumber(phone);
  const targetPhone = cleanPhone ? `91${cleanPhone}` : '';
  const encoded = encodeURIComponent(message);
  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
