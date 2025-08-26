// Image optimization utilities for WEBP conversion and performance

export interface ImageOptimizationOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Converts an image to WEBP format with compression
 */
export const convertToWebP = async (
  file: File, 
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  const { quality = 0.8, maxWidth, maxHeight, format = 'webp' } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates image file and returns optimized version
 */
export const optimizeImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ file: Blob; originalSize: number; newSize: number }> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be smaller than 5MB');
  }

  const originalSize = file.size;
  
  // Convert to WEBP with optimization
  const optimizedBlob = await convertToWebP(file, {
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    ...options
  });

  return {
    file: optimizedBlob,
    originalSize,
    newSize: optimizedBlob.size
  };
};

/**
 * Generates responsive image srcset for different screen sizes
 */
export const generateResponsiveImages = async (
  file: File,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): Promise<{ size: number; blob: Blob }[]> => {
  const results = await Promise.all(
    sizes.map(async (size) => {
      const blob = await convertToWebP(file, {
        maxWidth: size,
        quality: 0.8
      });
      return { size, blob };
    })
  );

  return results;
};

/**
 * Creates a placeholder blur image for lazy loading
 */
export const createBlurPlaceholder = async (file: File): Promise<string> => {
  const smallBlob = await convertToWebP(file, {
    maxWidth: 20,
    maxHeight: 20,
    quality: 0.3
  });

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(smallBlob);
  });
};