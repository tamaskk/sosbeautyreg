import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Missing code parameter' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    
    const result = await db.collection('codes').deleteOne({ code });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.status(200).json({ message: 'Code deleted successfully' });
  } catch (error) {
    console.error('Error deleting code:', error);
    res.status(500).json({ message: 'Failed to delete code' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 