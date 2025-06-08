import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import JSZip from 'jszip';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid id' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    const uploads = db.collection('uploads');

    // Get the upload document
    const upload = await uploads.findOne({ _id: new ObjectId(id) });
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Create a new zip file
    const zip = new JSZip();
    const folder = zip.folder(`${upload.name}_${upload._id}`);

    if (!folder) {
      throw new Error('Failed to create zip folder');
    }

    // Download and add images
    if (upload.images?.length) {
      for (let i = 0; i < upload.images.length; i++) {
        const image = upload.images[i];
        try {
          const response = await axios.get(image.url, { responseType: 'arraybuffer' });
          const extension = image.filename.split('.').pop() || 'jpg';
          const prefix = image.isMain ? 'main_' : '';
          folder.file(`${prefix}image_${i + 1}.${extension}`, response.data);
        } catch (error) {
          console.error(`Failed to download image ${i + 1}:`, error);
        }
      }
    }

    // Download and add videos
    if (upload.videos?.length) {
      for (let i = 0; i < upload.videos.length; i++) {
        const video = upload.videos[i];
        try {
          const response = await axios.get(video.url, { responseType: 'arraybuffer' });
          const extension = video.filename.split('.').pop() || 'mp4';
          folder.file(`video_${i + 1}.${extension}`, response.data);
        } catch (error) {
          console.error(`Failed to download video ${i + 1}:`, error);
        }
      }
    }

    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${upload.name}_media.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // Send the zip file
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error creating zip file:', error);
    res.status(500).json({ message: 'Failed to create zip file' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 