// src/elasticService.ts
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ node: process.env.ELASTIC_URL });

// Function to index a parsed email
export const indexEmail = async (parsed: any) => {
  try {
    await client.index({
      index: 'emails', // Elasticsearch index name
      body: {
        from: parsed.from?.text,
        subject: parsed.subject,
        date: parsed.date,
        text: parsed.text,
      },
    });
    console.log('✅ Email indexed in Elasticsearch:', parsed.subject);
  } catch (err) {
    console.error('❌ Elasticsearch indexing error:', err);
  }
};
