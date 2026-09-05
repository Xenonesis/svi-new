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
export function formatReceiptDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (match) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const year = match[1];
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = match[3];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return dateStr;
}

export function buildReceiptWhatsAppMessage(receipt: SavedReceipt, siteUrl = ''): string {
  const d = receipt.form_data || ({} as SavedReceipt['form_data']);
  const clientName = d.name
    ? d.salutation
      ? `${d.salutation} ${d.name}`.trim()
      : d.name
    : 'Valued Client';
  const amountVal = parseFloat(d.amount || '0') || 0;
  const formattedAmount = amountVal.toLocaleString('en-IN', {
    maximumFractionDigits: amountVal % 1 === 0 ? 0 : 2,
  });

  const formattedDate = formatReceiptDate(d.date);

  const plotInfo = d.plotNo
    ? ` towards Plot ${d.plotNo}${d.plotSize ? ` (${d.plotSize} Sq. Yds.)` : ''}`
    : '';
  const refInfo = d.refId ? ` (Ref ID: ${d.refId.trim()})` : '';

  const officialWebsite = siteUrl || 'https://www.sviinfrasolutions.com';

  const lines: string[] = [
    `*PAYMENT RECEIPT ACKNOWLEDGEMENT*`,
    `*SVI Infra Solutions Pvt. Ltd.*`,
    `────────────────────────`,
    ``,
    `Dear ${clientName},`,
    ``,
    `Greetings from *SVI Infra Solutions*.`,
    `We gratefully acknowledge the receipt of your payment of *₹${formattedAmount}*${plotInfo}${refInfo}.`,
    ``,
    `*RECEIPT SUMMARY*`,
    `• *Receipt No:* #${d.receiptNo || 'N/A'}`,
  ];

  if (d.refId) {
    lines.push(`• *Ref ID:* ${d.refId.trim()}`);
  }

  lines.push(`• *Date:* ${formattedDate}`);
  lines.push(`• *Amount Paid:* ₹${formattedAmount}`);

  if (d.plotNo) {
    lines.push(`• *Unit / Plot:* Plot ${d.plotNo}${d.plotSize ? ` (${d.plotSize} Sq. Yds.)` : ''}`);
  }

  lines.push(`• *Payment Mode:* ${d.paymentMethod || 'UPI'}`);

  if (d.paymentRef) {
    lines.push(`• *Transaction / UTR:* ${d.paymentRef.trim()}`);
  }

  if (d.drawnOn) {
    lines.push(`• *Bank:* ${d.drawnOn.trim()}`);
  }

  lines.push(`• *Status:* Confirmed & Received`);
  lines.push(``);
  lines.push(`────────────────────────`);
  lines.push(
    `*Note:* Your official computer-generated receipt has been booked in our records. For any assistance or queries regarding your booking, please feel free to reach out to us.`
  );
  lines.push(``);
  lines.push(`*Helpline:* +91 73000 07643`);
  lines.push(`*Website:* ${officialWebsite}`);
  lines.push(``);
  lines.push(`*SVI Infra Solutions Pvt. Ltd.*`);

  return lines.join('\n');
}

export function buildWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = cleanIndianPhoneNumber(phone);
  const targetPhone = cleanPhone ? `91${cleanPhone}` : '';
  const encoded = encodeURIComponent(message);
  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}
