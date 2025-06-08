import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    const messages = db.collection('messages');

    // Create message document
    const messageDoc = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
      read: false
    };

    // Save to database
    await messages.insertOne(messageDoc);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 