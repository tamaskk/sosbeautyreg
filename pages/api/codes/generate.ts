import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

function generateRandomCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    const { email, categories, usageLimit, codeLength } = req.body;
    
    if (!email || !categories || !usageLimit) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const code = generateRandomCode(codeLength || 8);
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    
    const result = await db.collection('codes').insertOne({
      email,
      code,
      categories,
      usageLimit: parseInt(usageLimit),
      usedCount: 0,
      createdAt: new Date(),
      isCustomGenerated: true
    });

    res.status(200).json({ 
      message: 'Code generated successfully',
      code,
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ message: 'Failed to generate code' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 