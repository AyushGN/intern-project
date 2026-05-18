import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Upload image to Supabase Storage
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { type = 'products' } = req.body; // 'products' or 'avatars'
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${type}/${userId}-${Date.now()}${fileExt}`;

    // Read file from disk
    const fileBuffer = fs.readFileSync(req.file.path);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    // Delete temp file
    fs.unlinkSync(req.file.path);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    res.status(200).json({
      message: 'File uploaded successfully',
      url: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error('Upload Image Error:', error.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
