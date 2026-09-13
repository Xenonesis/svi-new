const fs = require('fs');
const path = require('path');

const ganeshChaturthiHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>गणेश चतुर्थी की हार्दिक शुभकामनाएँ - SVI Infra Solutions</title>
</head>
<body style="margin:0;padding:0;background-color:#070d18;font-family:'Segoe UI',Roboto,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#070d18;padding:40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.35);border:1px solid #e2d2a4;">

          <!-- Top Gold Accent Line -->
          <tr>
            <td style="background:linear-gradient(90deg,#99742a 0%,#D4AF37 35%,#fff0b3 50%,#D4AF37 65%,#99742a 100%);height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="background:linear-gradient(145deg,#0a1526 0%,#13223f 50%,#0e1b33 100%);padding:42px 30px 36px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.3);">
              <!-- Official SVI Logo -->
              <div style="text-align:center;margin-bottom:20px;">
                <img src="https://www.sviinfrasolutions.com/logo.png" alt="SVI Infra Solutions Pvt. Ltd." width="145" style="display:inline-block;max-width:145px;height:auto;border:0;" />
              </div>

              <!-- Auspicious Festive Pill Badge -->
              <table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 16px;">
                <tr>
                  <td style="background:rgba(212,175,55,0.14);border:1px solid #D4AF37;border-radius:24px;padding:6px 20px;text-align:center;">
                    <span style="color:#f7e7a9;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">॥ श्री गणेशाय नमः ॥</span>
                  </td>
                </tr>
              </table>

              <h1 style="color:#ffffff;font-size:25px;margin:0;font-family:Georgia,serif;font-weight:700;letter-spacing:0.3px;line-height:1.4;">गणेश चतुर्थी की हार्दिक शुभकामनाएँ</h1>
              <p style="color:#e0be63;font-size:13.5px;margin:10px 0 0;font-weight:500;letter-spacing:0.8px;text-transform:uppercase;">Happy Ganesh Chaturthi &bull; SVI Infra Solutions</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:38px 34px 28px;background-color:#ffffff;">
              <!-- Personal Greeting -->
              <p style="color:#0f172a;font-size:16px;margin:0 0 18px;font-weight:700;">
                आदरणीय <span>{{name}}</span> जी,
              </p>

              <!-- Main Wishing Highlight Box -->
              <div style="background:linear-gradient(135deg,#fffdf7 0%,#fef9ec 100%);border:1px solid #ecd89f;border-left:4px solid #D4AF37;border-radius:10px;padding:18px 22px;margin-bottom:24px;">
                <p style="margin:0;color:#855800;font-size:15px;line-height:1.75;font-weight:700;">
                  SVI Infra Solutions Pvt. Ltd. की ओर से आप सभी को गणेश चतुर्थी की हार्दिक शुभकामनाएँ।
                </p>
              </div>

              <!-- Core Spiritual Message -->
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px 24px;margin-bottom:24px;">
                <p style="color:#334155;font-size:14.5px;line-height:1.85;margin:0 0 16px;">
                  विघ्नहर्ता भगवान श्री गणेश आपके जीवन में सुख, समृद्धि, सफलता और नई ऊर्जा लेकर आएँ। आपके सभी कार्य निर्विघ्न पूर्ण हों और आपका परिवार सदैव खुशहाल रहे।
                </p>
                <p style="color:#334155;font-size:14.5px;line-height:1.85;margin:0;">
                  आइए, इस पावन अवसर पर भगवान गणेश का आशीर्वाद लेकर नई शुरुआत और नई उपलब्धियों की ओर कदम बढ़ाएँ।
                </p>
              </div>

              <!-- Auspicious Chant Banner -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:26px 0;background:linear-gradient(135deg,#0a1526 0%,#182645 100%);border-radius:12px;border:1px solid #c9a84c;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <div style="color:#fcd34d;font-size:20px;font-weight:800;letter-spacing:1px;font-family:Georgia,serif;">
                      ॥ गणपति बप्पा मोरया! ॥
                    </div>
                    <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:6px;letter-spacing:0.5px;">
                      मंगलमूर्ति श्री गणेश आपके घर-परिवार में शांति और ऐश्वर्य का संचार करें
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 3 Festive Blessings Bento Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:26px 0 20px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <!-- Card 1 -->
                  <td width="32%" style="background:#fcfcfd;border:1px solid #e2e8f0;border-radius:10px;padding:16px 12px;text-align:center;vertical-align:top;">
                    <div style="color:#b08f36;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">सुख एवं समृद्धि</div>
                    <div style="color:#475569;font-size:12px;line-height:1.5;">जीवन और घर में स्थायी खुशहाली व संपन्नता</div>
                  </td>
                  <td width="2%" style="font-size:0;line-height:0;">&nbsp;</td>
                  <!-- Card 2 -->
                  <td width="32%" style="background:#fcfcfd;border:1px solid #e2e8f0;border-radius:10px;padding:16px 12px;text-align:center;vertical-align:top;">
                    <div style="color:#b08f36;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">निर्विघ्न प्रगति</div>
                    <div style="color:#475569;font-size:12px;line-height:1.5;">हर लक्ष्य व निवेश में बिना बाधा सफलता</div>
                  </td>
                  <td width="2%" style="font-size:0;line-height:0;">&nbsp;</td>
                  <!-- Card 3 -->
                  <td width="32%" style="background:#fcfcfd;border:1px solid #e2e8f0;border-radius:10px;padding:16px 12px;text-align:center;vertical-align:top;">
                    <div style="color:#b08f36;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">शुभ नई शुरुआत</div>
                    <div style="color:#475569;font-size:12px;line-height:1.5;">सपनों के आशियाने की ओर बढ़ता मजबूत कदम</div>
                  </td>
                </tr>
              </table>

              <!-- Appreciation & Relationship Note -->
              <p style="color:#64748b;font-size:13px;line-height:1.75;margin:22px 0 20px;">
                SVI परिवार का अभिन्न हिस्सा बनने और हम पर निरंतर विश्वास जताने के लिए हम आपके अत्यंत आभारी हैं। विघ्नहर्ता आपके प्रत्येक संकल्प को सिद्धि प्रदान करें।
              </p>

              <!-- Warm Corporate Sign-off -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;padding-top:18px;border-top:1px solid #f1f5f9;">
                <tr>
                  <td>
                    <p style="margin:0;color:#64748b;font-size:12.5px;">सादर एवं सस्नेह शुभकामनाएँ,</p>
                    <p style="margin:4px 0 0;color:#0f172a;font-size:15px;font-weight:800;">टीम SVI इंफ्रा सॉल्यूशंस प्राइवेट लिमिटेड</p>
                    <p style="margin:2px 0 0;color:#94a3b8;font-size:11.5px;">Team SVI Infra Solutions Pvt. Ltd.</p>
                  </td>
                </tr>
              </table>

              <!-- Action Link / Portal Visit -->
              <div style="text-align:center;margin:32px 0 10px;">
                <a href="https://www.sviinfrasolutions.com" style="background:linear-gradient(135deg,#c9a84c 0%,#D4AF37 50%,#b08f36 100%);color:#0a1526;padding:13px 34px;border-radius:28px;text-decoration:none;font-weight:800;font-size:12.5px;display:inline-block;letter-spacing:0.6px;box-shadow:0 4px 14px rgba(212,175,55,0.3);text-transform:uppercase;">Visit SVI Infra Solutions</a>
                <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;">Building Landmarks &bull; Transforming Futures</p>
              </div>
            </td>
          </tr>

          <!-- Helpdesk Bar -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;font-size:12px;color:#64748b;text-align:center;">
              <strong style="color:#0f172a;">संपर्क सूत्र / Helpdesk:</strong> <a href="tel:+919214014579" style="color:#0f172a;text-decoration:none;font-weight:700;">+91 92140 14579</a> &bull; <a href="mailto:hr.sviinfrasolutions@gmail.com" style="color:#b08f36;text-decoration:none;font-weight:600;">hr.sviinfrasolutions@gmail.com</a>
            </td>
          </tr>

        </table>
        <!-- End Main Card -->

        <!-- Legal Corporate Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;padding:24px 20px;text-align:center;">
          <tr>
            <td style="text-align:center;">
              <p style="color:#94a3b8;font-size:12px;font-weight:700;margin:0 0 4px;">SVI Infra Solutions Pvt. Ltd.</p>
              <p style="color:#64748b;font-size:11px;margin:0 0 8px;line-height:1.5;">
                Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309<br/>
                Official Website: <a href="https://www.sviinfrasolutions.com" style="color:#b08f36;text-decoration:none;font-weight:600;">www.sviinfrasolutions.com</a>
              </p>
              <p style="color:#475569;font-size:10px;margin:0;line-height:1.4;">
                शुभकामना संदेश &bull; Wishing you peace, health, and prosperity on Ganesh Chaturthi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const newTemplate = {
  id: "ganesh_chaturthi_wishes",
  name: "Ganesh Chaturthi Wishes",
  subject: "गणेश चतुर्थी की हार्दिक शुभकामनाएँ | Happy Ganesh Chaturthi – SVI Infra Solutions",
  category: "Greetings",
  icon: "Star",
  html: ganeshChaturthiHtml
};

const templatesPath = path.join(__dirname, '../src/data/email-templates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

// Check if already exists
const existingIndex = templates.findIndex(t => t.id === 'ganesh_chaturthi_wishes');
if (existingIndex >= 0) {
  templates[existingIndex] = newTemplate;
  console.log('Updated existing ganesh_chaturthi_wishes template.');
} else {
  templates.push(newTemplate);
  console.log('Added new ganesh_chaturthi_wishes template.');
}

fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
console.log('Successfully saved to email-templates.json. Total templates:', templates.length);
