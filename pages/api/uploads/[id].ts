import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { storage } from '@/lib/firebase';
import { ref, deleteObject } from 'firebase/storage';

async function deleteFileFromFirebase(url: string) {
  try {
    // Extract the path from the Firebase Storage URL
    const storageUrl = new URL(url);
    const path = decodeURIComponent(storageUrl.pathname.split('/o/')[1].split('?')[0]);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('Successfully deleted file:', path);
  } catch (error) {
    console.error('Error deleting file from Firebase:', error);
    // Don't throw the error, just log it
    // This way, if one file fails to delete, we still try to delete the others
  }
}

async function deleteUploadFiles(upload: any) {
  const deletePromises = [];

  // Delete all images
  if (upload.images?.length) {
    for (const image of upload.images) {
      if (image.url) {
        deletePromises.push(deleteFileFromFirebase(image.url));
      }
    }
  }

  // Delete all videos
  if (upload.videos?.length) {
    for (const video of upload.videos) {
      if (video.url) {
        deletePromises.push(deleteFileFromFirebase(video.url));
      }
    }
  }

  // Wait for all deletions to complete
  await Promise.all(deletePromises);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log('Received request for ID:', id, 'Method:', req.method);
  
  if (!id || typeof id !== 'string') {
    console.log('Invalid ID format:', id);
    return res.status(400).json({ message: 'Missing or invalid id' });
  }

  let client;
  try {
    client = await connectToDatabase();
    const db = client.db('sosbeauty');
    const uploads = db.collection('uploads');

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
      console.log('Converted ID to ObjectId:', objectId);
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    if (req.method === 'GET') {
      const doc = await uploads.findOne({ _id: objectId });
      console.log('GET request result:', doc ? 'Found document' : 'No document found');
      if (!doc) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'PATCH') {
      try {
        const { coordinates } = req.body;

        const result = await uploads.updateOne(
          { _id: objectId },
          { $set: { coordinates } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Upload not found' });
        }

        return res.status(200).json({ message: 'Coordinates updated successfully' });
      } catch (error) {
        console.error('Error updating coordinates:', error);
        return res.status(500).json({ message: 'Error updating coordinates' });
      }
    }

    if (req.method === 'DELETE') {
      console.log('Attempting to find upload for deletion:', objectId);
      // Get the upload document first
      const upload = await uploads.findOne({ _id: objectId });
      console.log('Found upload for deletion:', upload ? 'Yes' : 'No');
      
      if (!upload) {
        console.log('Upload not found for deletion');
        return res.status(404).json({ message: 'Upload not found' });
      }

      console.log('Deleting upload document...');
      // Delete the document
      const result = await uploads.deleteOne({ _id: objectId });
      console.log('Delete result:', result.deletedCount > 0 ? 'Success' : 'Failed');
      
      if (result.deletedCount > 0) {
        console.log('Deleting files from Firebase...');
        // Delete files from Firebase after successful deletion
        await deleteUploadFiles(upload);
        console.log('Files deleted successfully');
        return res.status(200).json({ message: 'Upload and files deleted successfully' });
      }

      console.log('Failed to delete upload document');
      return res.status(404).json({ message: 'Failed to delete upload' });
    }

    console.log('Method not allowed:', req.method);
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 