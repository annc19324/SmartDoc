/**
 * Utility functions for formatting file types, sizes, dates
 */

export const formatFileType = (fileType?: string): string => {
  if (!fileType) return 'DOC';
  const lower = fileType.toLowerCase();
  if (lower.includes('pdf')) return 'PDF';
  if (
    lower.includes('word') ||
    lower.includes('docx') ||
    lower.includes('officedocument') ||
    lower.includes('msword') ||
    lower.includes('doc')
  ) {
    return 'DOCX';
  }
  if (lower.includes('plain') || lower.includes('txt')) return 'TXT';
  if (lower.includes('markdown') || lower.includes('md')) return 'MD';
  if (lower.includes('jpeg') || lower.includes('jpg')) return 'JPG';
  if (lower.includes('png')) return 'PNG';
  if (lower.includes('webp')) return 'WEBP';
  if (lower.includes('image')) return 'IMG';
  
  const parts = fileType.split('/');
  const sub = parts[1] || parts[0];
  if (sub.length > 5) {
    if (sub.includes('presentation') || sub.includes('powerpoint')) return 'PPTX';
    if (sub.includes('sheet') || sub.includes('excel')) return 'XLSX';
    return 'DOC';
  }
  return sub.toUpperCase();
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
