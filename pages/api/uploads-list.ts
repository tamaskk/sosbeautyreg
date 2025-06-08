import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    
    // Get all uploads with all fields
    const uploads = await db.collection('uploads')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Found uploads:', uploads.map(u => ({ id: u._id, success: u.success })));
    
    res.status(200).json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ message: 'Failed to fetch uploads', error });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 