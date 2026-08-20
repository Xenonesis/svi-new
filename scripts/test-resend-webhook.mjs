import { createHmac } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';

const SECRET = process.env.RESEND_WEBHOOK_SECRET || 'whsec_TEST';
const PORT = process.env.PORT || 3000;
const RAW_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;
const url = new URL(RAW_URL);

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

const transport = url.protocol === 'https:' ? https : http;

const req = transport.request(
  {
    hostname: url.hostname,
    port: Number(url.port) || (url.protocol === 'https:' ? 443 : 80),
    path: '/api/webhooks/resend/incoming',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'svix-id': `msg_${Date.now()}`,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('status:', res.statusCode);
      console.log('body:', data);
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  }
);

req.on('error', (err) => {
  console.error('Request failed:', err.message);
  process.exit(1);
});

req.write(body);
req.end();
