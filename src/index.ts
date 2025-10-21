import express from 'express';
import dotenv from 'dotenv';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';

dotenv.config();

const app = express();
app.use(express.json());

const imapConfig = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT),
  tls: true,
};

// Function to start IMAP and print emails
const startImapSync = () => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('✅ Connected to IMAP successfully');

    imap.openBox('INBOX', true, (err, box) => {
      if (err) throw err;

      // Fetch all emails
      const fetch = imap.seq.fetch('1:*', { bodies: '' });
      fetch.on('message', async (msg) => {
        msg.on('body', async (stream) => {
          const parsed = await simpleParser(stream);
          console.log('----------------------------------');
          console.log('From:', parsed.from?.text);
          console.log('Subject:', parsed.subject);
          console.log('Date:', parsed.date);
          console.log('Text body:', parsed.text?.slice(0, 100));
        });
      });

      fetch.once('end', () => {
        console.log('📬 Finished fetching emails');
      });

      console.log('📡 Listening for new emails...');
    });
  });

  imap.once('error', (err) => console.error('❌ IMAP Error:', err));
  imap.once('end', () => console.log('IMAP connection closed'));
  imap.connect();
};

// Start Express server and IMAP sync
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startImapSync();
});
