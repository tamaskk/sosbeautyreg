import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const { password } = req.body;
  if (password === 'admin123') {
    res.status(200).json({ token: 'dummy_token (stub)' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
}; 