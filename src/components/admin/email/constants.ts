import { Check, Clock, FileText, Star, Trophy, Gift } from 'lucide-react';

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
  {
    id: 'registration_acknowledgment',
    name: 'Property Registration Acknowledgment',
    subject: 'Property Registration Received: {{firstName}} - Submission {{submissionId}}',
    category: 'Onboarding',
    icon: FileText,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Registration Received</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">REGISTRATION RECEIVED</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a2744;font-size:22px;margin:0 0 16px;">Dear {{firstName}} {{lastName}},</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 24px;">Thank you for registering with SVI Infra Solutions. We are pleased to acknowledge receipt of your property registration inquiry details.</p>
          
          <div style="background-color:#f9f9f9;color:#333333;padding:20px;border-radius:8px;margin:24px 0;border-left:4px solid #D4AF37;">
            <h3 style="margin-top:0;color:#1a2744;font-size:15px;border-bottom:1px solid #eee;padding-bottom:8px;">Submission Details</h3>
            <table width="100%" style="border-collapse:collapse;font-size:13px;line-height:2.0;">
              <tr><td style="font-weight:bold;width:40%;">Submission ID:</td><td>{{submissionId}}</td></tr>
              <tr><td style="font-weight:bold;">Project Name:</td><td>{{project}}</td></tr>
              <tr><td style="font-weight:bold;">Property Type & Size:</td><td>{{propertyType}} ({{propertySize}})</td></tr>
              <tr><td style="font-weight:bold;">Assigned Advisor:</td><td>{{advisorName}}</td></tr>
              <tr><td style="font-weight:bold;">Payment Plan:</td><td>{{paymentPlan}}</td></tr>
              <tr><td style="font-weight:bold;">Registration Amount:</td><td>INR {{schemeAmount}}</td></tr>
            </table>
          </div>

          <p style="color:#555;line-height:1.7;">Our property experts are reviewing your preferences and will contact you shortly.</p>
          <p style="color:#555;line-height:1.7;">If you have any questions or require modifications to your submission, feel free to contact support at <a href="mailto:{{adminEmail}}" style="color:#D4AF37;text-decoration:none;">{{adminEmail}}</a>.</p>
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
    id: 'contact_notification',
    name: 'Contact Form Notification (Admin)',
    subject: 'New Contact Form: {{subject}}',
    category: 'Admin Notifications',
    icon: FileText,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Contact Form Alert</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#1a2744;padding:30px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:24px;margin:0;font-family:Georgia,serif;">New Contact Submission</h1>
        </td></tr>
        <tr><td style="padding:35px;">
          <table width="100%" style="border-collapse:collapse;font-size:14px;line-height:2.0;margin-bottom:20px;">
            <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;width:30%;">Name:</td><td style="padding:10px;">{{name}}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Email:</td><td style="padding:10px;">{{email}}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:10px;font-weight:bold;">Phone:</td><td style="padding:10px;">{{phone}}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Subject:</td><td style="padding:10px;">{{subject}}</td></tr>
          </table>
          <p style="font-weight:bold;margin:20px 0 10px;color:#1a2744;">Submitted Message:</p>
          <div style="background:#f5f5f5;padding:15px;border-radius:6px;font-style:italic;color:#555;">
            {{message}}
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:11px;margin:0;">SVI Infra Automated System Notification</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'grievance_acknowledgment',
    name: 'Grievance Acknowledgment (Admin)',
    subject: 'New Grievance #{{ticketId}}: {{subject}}',
    category: 'Support Alerts',
    icon: Clock,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Grievance Submitted</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#c9a84c,#b08f36);padding:30px;text-align:center;">
          <h1 style="color:#ffffff;font-size:24px;margin:0;font-family:Georgia,serif;">Grievance Logged</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;font-size:12px;">Ticket ID: {{ticketId}}</p>
        </td></tr>
        <tr><td style="padding:35px;">
          <h2 style="color:#1a2744;font-size:18px;margin:0 0 15px;">Dear Admin / Support Team,</h2>
          <p style="color:#555;line-height:1.7;">A new client grievance ticket has been logged into the portal.</p>
          <table width="100%" style="border-collapse:collapse;font-size:13px;line-height:2.0;margin:20px 0;">
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;width:30%;">Client Name:</td><td style="padding:8px;">{{name}}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Email / Phone:</td><td style="padding:8px;">{{email}} / {{phone}}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;">Category:</td><td style="padding:8px;">{{category}}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Subject:</td><td style="padding:8px;">{{subject}}</td></tr>
          </table>
          <p style="font-weight:bold;margin-top:20px;color:#1a2744;">Issue Description:</p>
          <div style="background:#f5f5f5;padding:15px;border-radius:6px;color:#555;font-style:italic;">
            {{description}}
          </div>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:11px;margin:0;">SVI Infra Automated Support Desk</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'lucky_draw_winner',
    name: 'Lucky Draw Winner Congratulations',
    subject: '🏆 Congratulations! You Won the {{lottery_name}} Lucky Draw!',
    category: 'Lottery',
    icon: Trophy,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Congratulations — Lucky Draw Winner!</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#c9a84c,#f0d080,#b08f36);padding:48px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🏆</div>
          <h1 style="margin:0;font-size:32px;font-weight:800;color:#0a0a0f;">Congratulations!</h1>
          <p style="margin:10px 0 0;font-size:15px;color:#3a2800;font-weight:600;">You are the winner of {{lottery_name}}</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">Dear <strong>{{name}}</strong>,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">We are thrilled to announce that you have been selected as the <strong>Grand Prize Winner</strong> of the <strong>{{lottery_name}}</strong> lucky draw! 🎊</p>
          <div style="background:linear-gradient(135deg,#fef9ec,#fffbe8);border:2px solid #c9a84c;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:11px;color:#b08f36;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;font-weight:700;">🎫 Winning Ticket</div>
            <div style="font-size:28px;font-weight:800;color:#0a0a0f;font-family:monospace;">{{ticket_number}}</div>
          </div>
          <div style="background:#f8f8ff;border:1px solid #e0e0f0;border-radius:12px;padding:24px;margin-bottom:24px;">
            <div style="font-size:11px;color:#1a2744;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;font-weight:700;text-align:center;">🏡 Your Plot Allotment Details</div>
            <table width="100%" style="border-collapse:collapse;">
              <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:45%;">Plot No.</td><td style="padding:12px 16px;color:#555;font-size:16px;font-weight:700;">{{plot_no}}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Square Yards</td><td style="padding:12px 16px;color:#555;font-size:16px;font-weight:700;">{{square_yards}} Sq. Yds.</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Project</td><td style="padding:12px 16px;color:#555;">{{project_name}}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Draw Date</td><td style="padding:12px 16px;color:#555;">{{draw_date}}</td></tr>
            </table>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">Our team will contact you shortly to coordinate the formal documentation and handover process. Please keep this email for your records.</p>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">Thank you for being a valued member of the SVI Infra family. Congratulations once again! 🌟</p>
          <div style="text-align:center;margin-top:32px;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">View Your Plot Details</a>
          </div>
        </td></tr>
        <tr><td style="background:#fef9ec;padding:24px 40px;text-align:center;border-top:1px solid #f0d080;">
          <p style="margin:0;font-size:12px;color:#888;">© 2025 SVI Infra Solutions | Official Lucky Draw Portal</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'lucky_draw_plot_allotment',
    name: 'Lucky Draw Winner - Plot Allotment',
    subject: '🏡 Plot Allotment Confirmation – {{lottery_name}} | Plot No. {{plot_no}}',
    category: 'Lottery',
    icon: Gift,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Plot Allotment Confirmation</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a2744,#2d4080);padding:40px;text-align:center;">
          <h1 style="color:#D4AF37;font-size:28px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:13px;letter-spacing:2px;">PLOT ALLOTMENT CONFIRMATION</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="background:#e8f5e9;border-left:4px solid #4caf50;padding:16px;border-radius:4px;margin-bottom:24px;">
            <p style="margin:0;color:#2e7d32;font-weight:bold;">✓ Plot Successfully Allotted via Lucky Draw</p>
          </div>
          <h2 style="color:#1a2744;margin:0 0 24px;">Dear {{name}},</h2>
          <p style="color:#555;line-height:1.7;margin:0 0 24px;">Congratulations on winning the <strong>{{lottery_name}}</strong> lucky draw! We are pleased to confirm the allotment of your plot. Please find the details below:</p>
          <div style="background:linear-gradient(135deg,#fef9ec,#fffbe8);border:2px solid #c9a84c;border-radius:12px;padding:24px;margin-bottom:24px;">
            <h3 style="margin:0 0 16px;color:#1a2744;font-size:16px;text-align:center;">🏡 Plot Allotment Details</h3>
            <table width="100%" style="border-collapse:collapse;">
              <tr style="background:rgba(255,255,255,0.5);"><td style="padding:14px 16px;font-weight:bold;color:#1a2744;width:45%;border-bottom:1px solid #f0d080;">Plot No.</td><td style="padding:14px 16px;color:#0a0a0f;font-size:18px;font-weight:800;border-bottom:1px solid #f0d080;">{{plot_no}}</td></tr>
              <tr><td style="padding:14px 16px;font-weight:bold;color:#1a2744;border-bottom:1px solid #f0d080;">Size (Square Yards)</td><td style="padding:14px 16px;color:#0a0a0f;font-size:18px;font-weight:800;border-bottom:1px solid #f0d080;">{{square_yards}} Sq. Yds.</td></tr>
              <tr style="background:rgba(255,255,255,0.5);"><td style="padding:14px 16px;font-weight:bold;color:#1a2744;border-bottom:1px solid #f0d080;">Project / Scheme</td><td style="padding:14px 16px;color:#555;border-bottom:1px solid #f0d080;">{{project_name}}</td></tr>
              <tr><td style="padding:14px 16px;font-weight:bold;color:#1a2744;border-bottom:1px solid #f0d080;">Winning Ticket</td><td style="padding:14px 16px;color:#555;font-family:monospace;font-weight:700;border-bottom:1px solid #f0d080;">{{ticket_number}}</td></tr>
              <tr style="background:rgba(255,255,255,0.5);"><td style="padding:14px 16px;font-weight:bold;color:#1a2744;border-bottom:1px solid #f0d080;">Lucky Draw Date</td><td style="padding:14px 16px;color:#555;border-bottom:1px solid #f0d080;">{{draw_date}}</td></tr>
              <tr><td style="padding:14px 16px;font-weight:bold;color:#1a2744;">Allotment Status</td><td style="padding:14px 16px;"><span style="background:#4caf50;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;">CONFIRMED</span></td></tr>
            </table>
          </div>
          <div style="background:#f8f8ff;border:1px solid #e0e0f0;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h3 style="margin:0 0 12px;color:#1a2744;font-size:15px;">📋 Next Steps</h3>
            <ol style="margin:0;padding-left:20px;color:#555;line-height:2;">
              <li>Our team will contact you within 48 hours for documentation.</li>
              <li>Please keep your winning ticket number for reference.</li>
              <li>Visit our office with valid ID proof for verification.</li>
              <li>Complete the registration formalities to finalize allotment.</li>
            </ol>
          </div>
          <p style="color:#555;line-height:1.7;margin:0 0 16px;">For any queries, contact us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;text-decoration:none;">hr.sviinfrasolutions@gmail.com</a></p>
          <div style="text-align:center;margin-top:32px;">
            <a href="{{portal_url}}" style="background:#D4AF37;color:#1a2744;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">View on Portal</a>
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
    id: 'lucky_draw_winner_family',
    name: 'Lucky Draw Winner - Family Notification',
    subject: '🎊 Great News! {{name}} Won a Plot in {{lottery_name}}!',
    category: 'Lottery',
    icon: Star,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Winner Family Notification</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#c9a84c,#f0d080,#b08f36);padding:40px;text-align:center;">
          <div style="font-size:42px;margin-bottom:12px;">🎊</div>
          <h1 style="color:#0a0a0f;font-size:26px;margin:0;font-family:Georgia,serif;">SVI Infra Solutions</h1>
          <p style="color:#3a2800;margin:8px 0 0;font-size:14px;letter-spacing:1px;font-weight:600;">LUCKY DRAW WINNER ANNOUNCEMENT</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">Dear Family / Well-Wisher,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;">We are delighted to share that <strong>{{name}}</strong> has won the <strong>{{lottery_name}}</strong> lucky draw conducted by SVI Infra Solutions!</p>
          <div style="background:linear-gradient(135deg,#fef9ec,#fffbe8);border:2px solid #c9a84c;border-radius:12px;padding:24px;margin-bottom:24px;">
            <div style="text-align:center;margin-bottom:16px;">
              <div style="font-size:36px;">🏆</div>
              <div style="font-size:20px;font-weight:800;color:#1a2744;margin-top:8px;">{{name}}</div>
              <div style="font-size:12px;color:#b08f36;letter-spacing:0.1em;margin-top:4px;">GRAND PRIZE WINNER</div>
            </div>
            <table width="100%" style="border-collapse:collapse;border-top:1px solid #f0d080;padding-top:16px;">
              <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;width:45%;">Plot No.</td><td style="padding:12px 16px;color:#0a0a0f;font-size:16px;font-weight:700;">{{plot_no}}</td></tr>
              <tr style="background:rgba(255,255,255,0.5);"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Size</td><td style="padding:12px 16px;color:#0a0a0f;font-size:16px;font-weight:700;">{{square_yards}} Sq. Yds.</td></tr>
              <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Project</td><td style="padding:12px 16px;color:#555;">{{project_name}}</td></tr>
              <tr style="background:rgba(255,255,255,0.5);"><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Ticket No.</td><td style="padding:12px 16px;color:#555;font-family:monospace;font-weight:700;">{{ticket_number}}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:bold;color:#1a2744;">Draw Date</td><td style="padding:12px 16px;color:#555;">{{draw_date}}</td></tr>
            </table>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">This is a moment of joy and celebration! The plot has been officially allotted and our team will be reaching out soon for the next steps.</p>
          <p style="margin:0;font-size:14px;color:#444;line-height:1.7;">For any inquiries, please contact us at <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#D4AF37;text-decoration:none;">hr.sviinfrasolutions@gmail.com</a></p>
        </td></tr>
        <tr><td style="background:#fef9ec;padding:24px;text-align:center;border-top:1px solid #f0d080;">
          <p style="margin:0;font-size:12px;color:#888;">© 2025 SVI Infra Solutions | Official Lucky Draw Portal</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  },
];
