import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'smartdoc/documents',
  resourceType: 'auto' | 'raw' | 'image' = 'auto',
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary keys are missing in local dev, provide a simulated fallback
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      console.warn('⚠️ Cloudinary credentials missing. Returning local fallback URL.');
      return resolve({
        public_id: `mock_${Date.now()}_${filename || 'file'}`,
        secure_url: `https://res.cloudinary.com/demo/raw/upload/v1/smartdoc/${filename || 'document.pdf'}`,
        bytes: fileBuffer.length,
        format: filename?.split('.').pop() || 'pdf',
      } as UploadApiResponse);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload returned empty result'));
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'raw' = 'image') => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
    return { result: 'ok' };
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
