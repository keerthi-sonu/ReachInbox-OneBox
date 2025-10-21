import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { Client } from '@elastic/elasticsearch';

dotenv.config();

// Elasticsearch client
const client = new Client({ node: process.env.ELASTIC_URL });

// IMAP config
const imapConfig = {
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT),
  tls: true,
};

// Function to index email in Elasticsearch
const indexEmail = async (email: any) => {
  try {
    await client.index({
      index: 'emails',
      document: {
        from: email.from?.text,
        subject: email.subject,
        date: email.date,
        body: email.text,
      },
    });
    console.log('✅ Indexed email:', email.subject);
  } catch (err) {
    console.error('❌ Error indexing email:', err);
  }
};

export const startImapSync = () => {
  return new Promise<void>((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      console.log('✅ Connected to IMAP successfully');

      imap.openBox('INBOX', false, (err, box) => {
        if (err) return reject(err);

        // Listen for new emails
        imap.on('mail', () => {
          const fetch = imap.seq.fetch(`${box.messages.total}:*`, { bodies: '' });

          fetch.on('message', async (msg) => {
            msg.on('body', async (stream) => {
              try {
                const parsed = await simpleParser(stream);
                console.log('----------------------------------');
                console.log('New Email:');
                console.log('From:', parsed.from?.text);
                console.log('Subject:', parsed.subject);
                console.log('Date:', parsed.date);
                console.log('Text body:', parsed.text?.slice(0, 100));

                // Index email in Elasticsearch
                await indexEmail(parsed);
              } catch (err) {
                console.error('❌ Error parsing email:', err);
              }
            });
          });
        });

        console.log('📡 Listening for new emails...');
        resolve();
      });
    });

    imap.once('error', (err) => reject(err));
    imap.once('end', () => console.log('IMAP connection closed'));
    imap.connect();
  });
};
