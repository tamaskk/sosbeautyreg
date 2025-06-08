import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    // Connect to the database
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    const messages = db.collection('messages');

    if (req.method === 'GET') {
      // Get all messages, sorted by date (newest first)
      const allMessages = await messages
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(allMessages);
    } 
    
    if (req.method === 'PATCH') {
      const { id, read } = req.body;

      if (!id || typeof read !== 'boolean') {
        return res.status(400).json({ message: 'Missing or invalid parameters' });
      }

      const result = await messages.updateOne(
        { _id: new ObjectId(id) },
        { $set: { read } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      return res.status(200).json({ message: 'Message updated successfully' });
    } 
    
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid id' });
      }

      const result = await messages.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Message not found' });
      }

      return res.status(200).json({ message: 'Message deleted successfully' });
    }
  } catch (error) {
    console.error('Error handling messages:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    });
  }
} 