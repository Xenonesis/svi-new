import { createHmac } from 'node:crypto';
import http from 'node:http';

const SECRET = process.env.RESEND_WEBHOOK_SECRET || 'whsec_TEST';
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

const payload = {
  type: 'email.received',
  created_at: new Date().toISOString(),
  data: {
    email_id: `test-${Date.now()}`,
    thread_id: `test-${Date.now()}`,
    subject: 'Manual inbound test',
    from: 'Test User <test@example.com>',
    to: ['inbound@sviiinfrasolutions.com'],
    cc: [],
    bcc: [],
    attachments: [],
    created_at: new Date().toISOString(),
  },
};

const body = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000).toString();
const signedPayload = `${timestamp}.${body}`;
const signature = `v1=${createHmac('sha256', SECRET).update(signedPayload).digest('base64')}`;

const targetUrl = new URL(APP_URL);
const options = {
  hostname: targetUrl.hostname,
  port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
  path: '/api/webhooks/resend/incoming',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'svix-id': `msg_${Date.now()}`,
    'svix-timestamp': timestamp,
    'svix-signature': signature,
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('status:', res.statusCode);
    console.log('body:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  process.exit(1);
});

req.write(body);
req.end();
