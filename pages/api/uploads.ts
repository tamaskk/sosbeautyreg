import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import formidable, { Fields, Files, Part } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;

// Use system's temporary directory
const tempUploadsDir = path.join(os.tmpdir(), 'sosbeauty-uploads');

// Ensure the upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(tempUploadsDir, { recursive: true });
    console.log('Upload directory created/verified at:', tempUploadsDir);
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Nem sikerült létrehozni a feltöltési könyvtárat. Kérjük, próbálja újra később.');
  }
}

async function uploadToFirebase(file: formidable.File, folder: string): Promise<{ url: string; filename: string; originalName: string; size: number; type: string | null }> {
  try {
    const ext = path.extname(file.originalFilename || '');
    const filename = `${uuidv4()}${ext}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    // Read the file
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Upload to Firebase
    const metadata = {
      contentType: file.mimetype || undefined,
    };
    
    await uploadBytes(storageRef, fileBuffer, metadata);
    const url = await getDownloadURL(storageRef);
    
    // Clean up the temporary file
    try {
      await fs.unlink(file.filepath);
      console.log('Temporary file cleaned up:', file.filepath);
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
      // Don't throw the error, just log it
    }
    
    return {
      url,
      filename,
      originalName: file.originalFilename || '',
      size: file.size,
      type: file.mimetype,
    };
  } catch (error) {
    console.error('Firebase upload error:', error);
    // Clean up the temporary file even if upload fails
    try {
      await fs.unlink(file.filepath);
      console.log('Temporary file cleaned up after error:', file.filepath);
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file after error:', cleanupError);
    }
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let client;
  try {
    console.log('Starting file upload process...');

    // Ensure upload directory exists before proceeding
    await ensureUploadDir();

    const form = formidable({
      uploadDir: tempUploadsDir,
      keepExtensions: true,
      maxFileSize: MAX_VIDEO_SIZE,
      filter: (part: Part) => {
        const isAllowed = part.mimetype?.startsWith('image/') || part.mimetype?.startsWith('video/') || false;
        console.log('File type check:', { filename: part.originalFilename, mimetype: part.mimetype, isAllowed });
        return isAllowed;
      },
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        }
        console.log('Parsed form data:', { fields, files });
        resolve([fields, files]);
      });
    });

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('sosbeauty');

    const category = fields.category?.[0];

    // Validate file counts and sizes
    const imageFiles = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];
    const videoFiles = Array.isArray(files.videos) ? files.videos : files.videos ? [files.videos] : [];

    console.log('File counts:', { 
      images: imageFiles.length, 
      videos: videoFiles.length,
      maxImages: MAX_IMAGES,
      maxVideos: MAX_VIDEOS
    });

    if (imageFiles.length > MAX_IMAGES) {
      return res.status(400).json({ message: `Maximum ${MAX_IMAGES} képet lehet feltölteni` });
    }

    if (videoFiles.length > MAX_VIDEOS) {
      return res.status(400).json({ message: `Maximum ${MAX_VIDEOS} videót lehet feltölteni` });
    }

    // Validate file sizes
    for (const file of imageFiles as formidable.File[]) {
      if (file.size > MAX_IMAGE_SIZE) {
        console.error('Image too large:', { 
          filename: file.originalFilename, 
          size: file.size, 
          maxSize: MAX_IMAGE_SIZE 
        });
        return res.status(400).json({ 
          message: `A ${file.originalFilename} túl nagy (maximum ${MAX_IMAGE_SIZE / (1024 * 1024)}MB)` 
        });
      }
    }

    for (const file of videoFiles as formidable.File[]) {
      if (file.size > MAX_VIDEO_SIZE) {
        console.error('Video too large:', { 
          filename: file.originalFilename, 
          size: file.size, 
          maxSize: MAX_VIDEO_SIZE 
        });
        return res.status(400).json({ 
          message: `A ${file.originalFilename} túl nagy (maximum ${MAX_VIDEO_SIZE / (1024 * 1024)}MB)` 
        });
      }
    }

    console.log('Starting Firebase uploads...');

    // Upload files to Firebase Storage
    const uploadPromises = [
      ...(imageFiles as formidable.File[]).map(file => uploadToFirebase(file, 'images')),
      ...(videoFiles as formidable.File[]).map(file => uploadToFirebase(file, 'videos')),
    ];

    const uploadedFiles = await Promise.all(uploadPromises);
    const images = uploadedFiles.slice(0, imageFiles.length);
    const videos = uploadedFiles.slice(imageFiles.length);

    console.log('Files uploaded successfully:', { 
      imagesCount: images.length, 
      videosCount: videos.length 
    });

    // Create upload document
    const upload = {
      name: fields.name?.[0] || '',
      email: fields.email?.[0] || '',
      phone: fields.phone?.[0] || '',
      instagram: fields.instagram?.[0] || '',
      facebook: fields.facebook?.[0] || '',
      tiktok: fields.tiktok?.[0] || '',
      category: category || '',
      minPrice: fields.minPrice?.[0] || '',
      maxPrice: fields.maxPrice?.[0] || '',
      country: fields.country?.[0] || '',
      city: fields.city?.[0] || '',
      postalCode: fields.postalCode?.[0] || '',
      street: fields.street?.[0] || '',
      houseNumber: fields.houseNumber?.[0] || '',
      levelDoor: fields.levelDoor?.[0] || '',
      coordinates: fields.latitude?.[0] && fields.longitude?.[0] ? {
        lat: parseFloat(fields.latitude[0] || '0'),
        lng: parseFloat(fields.longitude[0] || '0')
      } : null,
      images: images.map((image, index) => ({
        ...image,
        isMain: index === parseInt(fields.mainImageIndex?.[0] || '0')
      })),
      videos,
      success: false,
      createdAt: new Date(),
    };

    console.log('Saving upload to database...');

    // Save upload to database
    const result = await db.collection('uploads').insertOne(upload);

    console.log('Upload process completed successfully');

    res.status(200).json({ message: 'Upload successful', id: result.insertedId });
  } catch (error: any) {
    console.error('Upload error:', error);

    res.status(500).json({ 
      message: error.message || 'A feltöltés sikertelen',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 