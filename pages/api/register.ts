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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    const { email, categories } = req.body;
    if (!email || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Missing email or categories' });
    }

    const code = generateRandomCode();
    const usageLimit = categories.length;
    const usedCount = 0;

    client = await connectToDatabase();
    const db = client.db("sosbeauty");
    const doc = { email, code, categories, usageLimit, usedCount, createdAt: new Date() };
    await db.collection("codes").insertOne(doc);

    return res.status(200).json({ code, usageLimit, usedCount, message: 'Registration successful.' });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Registration failed', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 