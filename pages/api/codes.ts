import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

function generateRandomCode(): string {
  console.log('Generating random code...');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log('Generated code:', code);
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Codes API called with method:', req.method);
  
  if (req.method !== 'GET' && req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    if (req.method === 'POST') {
      console.log('POST request body:', req.body);
      const { email, usageLimit } = req.body;
      
      console.log('Connecting to database...');
      client = await connectToDatabase();
      const db = client.db('sosbeauty');
      
      const doc = { email, code: generateRandomCode(), usageLimit, createdAt: new Date(), usedCount: 0 };
      console.log('Inserting document:', doc);
      
      await db.collection("codes").insertOne(doc);
      console.log('Document inserted successfully');
      
      const createdCode = await db.collection('codes').findOne({ email });
      console.log('Retrieved created code:', createdCode);

      res.status(200).json(createdCode);
    } else {
      console.log('Processing GET request...');
      client = await connectToDatabase();
      const db = client.db('sosbeauty');
      
      console.log('Fetching codes from database...');
      const codes = await db.collection('codes')
        .find({}, { projection: { email: 1, code: 1, usedCount: 1, usageLimit: 1, _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      console.log('Retrieved codes:', codes);
      
      res.status(200).json(codes);
    }
  } catch (error) {
    console.error('Error in codes handler:', error);
    res.status(500).json({ message: 'Failed to process request', error });
  } finally {
    if (client) {
      console.log('Closing database connection...');
      await client.close();
      console.log('Database connection closed');
    }
  }
}