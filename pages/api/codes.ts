import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    if (req.method === 'POST') {
      const { email, usageLimit } = req.body;
      client = await connectToDatabase();
      const db = client.db('sosbeauty');
      const doc = { email, code: generateRandomCode(), usageLimit, createdAt: new Date(), usedCount: 0 };
      await db.collection("codes").insertOne(doc);
      const createdCode = await db.collection('codes').findOne({ email });

      res.status(200).json(createdCode);
    } else {
      client = await connectToDatabase();
      const db = client.db('sosbeauty');
      const codes = await db.collection('codes')
        .find({}, { projection: { email: 1, code: 1, usedCount: 1, usageLimit: 1, _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      res.status(200).json(codes);
    }
  } catch (error) {
    console.error('Error in codes handler:', error);
    res.status(500).json({ message: 'Failed to process request', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 