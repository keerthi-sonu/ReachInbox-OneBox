import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
dotenv.config();

const imapConfig = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT),
  tls: true,
};

const checkEmails = () => {
  return new Promise<void>((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      console.log('✅ Connected to IMAP successfully');

      imap.openBox('INBOX', true, (err, box) => {
        if (err) return reject(err);

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
          imap.end();
          resolve();
        });
      });
    });

    imap.once('error', (err) => reject(err));
    imap.once('end', () => console.log('IMAP connection closed'));
    imap.connect();
  });
};

checkEmails().catch((err) => console.error('❌ Error fetching emails:', err));
