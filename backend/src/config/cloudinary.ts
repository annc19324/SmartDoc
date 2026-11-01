import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from './env.js';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Saves file locally in uploads/documents directory as fallback
 */
const saveFileLocally = (fileBuffer: Buffer, filename?: string): UploadApiResponse => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = filename?.split('.').pop() || 'pdf';
  const cleanName = filename ? path.basename(filename) : `document_${Date.now()}.${ext}`;
  const uniqueName = `${Date.now()}-${cleanName.replace(/\s+/g, '_')}`;
  const filePath = path.join(uploadsDir, uniqueName);

  fs.writeFileSync(filePath, fileBuffer);

  return {
    public_id: `local_${uniqueName}`,
    secure_url: `/uploads/documents/${uniqueName}`,
    url: `/uploads/documents/${uniqueName}`,
    bytes: fileBuffer.length,
    format: ext,
  } as UploadApiResponse;
};

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'smartdoc/documents',
  resourceType: 'auto' | 'raw' | 'image' = 'auto',
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve) => {
    // 1. If Cloudinary credentials are missing or placeholder, use local fallback directly
    if (
      !env.CLOUDINARY_CLOUD_NAME ||
      !env.CLOUDINARY_API_KEY ||
      env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name' ||
      !env.CLOUDINARY_API_SECRET
    ) {
      console.warn('ℹ️ Cloudinary credentials not configured. Saving document locally.');
      return resolve(saveFileLocally(fileBuffer, filename));
    }

    // 2. Attempt Cloudinary upload stream
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.warn(
              `⚠️ Cloudinary upload failed (${error.message}). Switching to local fallback storage automatically so the AI pipeline continues seamlessly.`
            );
            return resolve(saveFileLocally(fileBuffer, filename));
          }
          if (!result) {
            return resolve(saveFileLocally(fileBuffer, filename));
          }
          resolve(result);
        }
      );

      (uploadStream as any).end(fileBuffer);
    } catch (streamErr: any) {
      console.warn('⚠️ Cloudinary stream exception:', streamErr.message);
      resolve(saveFileLocally(fileBuffer, filename));
    }
  });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'raw' = 'image') => {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    publicId.startsWith('local_')
  ) {
    return { result: 'ok' };
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
