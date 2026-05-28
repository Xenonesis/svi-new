import { Check, Clock, FileText, Star } from 'lucide-react';

export const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to SVI Infra Solutions!',
    category: 'Onboarding',
    icon: Star,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">WELCOME ABOARD</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a2744;font-size:22px;margin:0 0 16px;">Hello {{name}},</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 24px;">Thank you for choosing SVI Infra Solutions. We are delighted to have you as part of our growing family of property owners.</p>
          <p style="color:#555;line-height:1.7;margin:0 0 32px;">Your journey towards owning your dream property starts here. Our team is committed to making this experience seamless and rewarding for you.</p>
          <div style="text-align:center;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Access Your Portal</a>
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions · All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'payment',
    name: 'Payment Confirmation',
    subject: 'Payment Received – {{property_name}}',
    category: 'Transactions',
    icon: Check,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Confirmation</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">PAYMENT CONFIRMED</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:16px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#2e7d32;font-weight:bold;">✓ Payment Successfully Received</p>
          </div>
          <h2 style="color:#1a2744;margin:0 0 24px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">We have received your payment for <strong>{{property_name}}</strong>.</p>
          <table width="100%" style="border-collapse:collapse;margin:24px 0;">
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:40%;">Amount Paid</td><td style="padding:12px 16px;color:#555;">₹{{amount}}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Payment Date</td><td style="padding:12px 16px;color:#555;">{{date}}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Receipt No.</td><td style="padding:12px 16px;color:#555;">{{receipt_no}}</td></tr>
          </table>
          <p style="color:#555;line-height:1.7;">Please keep this email for your records. A detailed receipt will be sent separately.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'reminder',
    name: 'Payment Reminder',
    subject: 'Payment Due Reminder – {{property_name}}',
    category: 'Reminders',
    icon: Clock,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Payment Reminder</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">PAYMENT REMINDER</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="background:#fff8e1;border-left:4px solid #ffc107;padding:16px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#f57c00;font-weight:bold;">⚠ Payment Due on {{due_date}}</p>
          </div>
          <h2 style="color:#1a2744;margin:0 0 16px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">This is a friendly reminder that your installment payment for <strong>{{property_name}}</strong> is due on <strong>{{due_date}}</strong>.</p>
          <table width="100%" style="border-collapse:collapse;margin:24px 0;">
            <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:40%;">Amount Due</td><td style="padding:12px 16px;color:#555;">₹{{amount}}</td></tr>
            <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Due Date</td><td style="padding:12px 16px;color:#f57c00;font-weight:bold;">{{due_date}}</td></tr>
          </table>
          <p style="color:#555;line-height:1.7;">Please make the payment before the due date to avoid any late fees. Contact us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;">hr.sviinfrasolutions@gmail.com</a> if you need assistance.</p>
          <div style="text-align:center;margin-top:32px;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">Pay Now</a>
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'contact_reply',
    name: 'Contact Form Reply',
    subject: 'Re: {{original_subject}} – SVI Infra Solutions',
    category: 'Support',
    icon: FileText,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Contact Reply</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a2744;margin:0 0 16px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;">Thank you for contacting SVI Infra Solutions. We have received your inquiry and our team is reviewing it.</p>
          <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:24px 0;border-left:3px solid #D4AF37;">
            <p style="margin:0;color:#666;font-size:13px;font-style:italic;">Your message: "{{original_message}}"</p>
          </div>
          <p style="color:#555;line-height:1.7;">{{reply_message}}</p>
          <p style="color:#555;line-height:1.7;">If you have any further questions, feel free to reach us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;">hr.sviinfrasolutions@gmail.com</a> or call us at <strong>+91 XXXXX XXXXX</strong>.</p>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:24px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">© 2025 SVI Infra Solutions</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
];
