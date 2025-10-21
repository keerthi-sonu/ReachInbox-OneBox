import fetch from 'cross-fetch';
import dotenv from 'dotenv';
dotenv.config();

export async function triggerWebhook(email: any) {
  if (!process.env.WEBHOOK_SITE_URL) return;

  await fetch(process.env.WEBHOOK_SITE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(email)
  });
  console.log('🌐 Webhook triggered');
}
