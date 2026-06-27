import api from './api';

export const toolCategories = {
  pdf: {
    name: 'PDF Tools',
    icon: 'PDF',
    tools: [
      { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF files to editable DOCX documents.', icon: 'PDF' },
      { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert DOCX documents to polished PDF files.', icon: 'DOC' },
      { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Turn spreadsheets into shareable PDF documents.', icon: 'XLS' },
      { id: 'pdf-to-ppt', name: 'PDF to PowerPoint', description: 'Convert PDF pages into editable PPTX slides.', icon: 'PPT' },
      { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', description: 'Export presentations as secure PDF files.', icon: 'PPT' },
      { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert PDF pages to high-quality JPG images.', icon: 'JPG' },
      { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Combine images into a clean PDF document.', icon: 'JPG' },
      { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDF files into one document.', icon: 'PDF' },
      { id: 'split-pdf', name: 'Split PDF', description: 'Extract selected pages from a PDF file.', icon: 'PDF' },
      { id: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size while preserving quality.', icon: 'ZIP', hasSettings: true },
      { id: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate PDF pages clockwise or counterclockwise.', icon: 'ROT' },
      { id: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password protection from PDFs you own.', icon: 'KEY' },
      { id: 'protect-pdf', name: 'Protect PDF', description: 'Add password protection to PDF files.', icon: 'SEC', hasSettings: true },
      { id: 'pdf-to-html', name: 'PDF to HTML', description: 'Convert PDF content into HTML documents.', icon: 'WEB' },
      { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Create PDF files from HTML pages.', icon: 'WEB' },
      { id: 'sign-pdf', name: 'Sign PDF', description: 'Add a signature to your PDF document.', icon: 'SIG' },
      { id: 'watermark-pdf', name: 'Watermark PDF', description: 'Apply text or image watermarks to PDFs.', icon: 'WM' },
      { id: 'ocr-pdf', name: 'OCR PDF', description: 'Extract searchable text from scanned PDFs.', icon: 'OCR' },
    ],
  },
  image: {
    name: 'Image Tools',
    icon: 'IMG',
    tools: [
      { id: 'jpg-to-png', name: 'JPG to PNG', description: 'Convert JPG images to PNG format.', icon: 'JPG' },
      { id: 'png-to-jpg', name: 'PNG to JPG', description: 'Convert PNG images to JPG format.', icon: 'PNG' },
      { id: 'webp-to-jpg', name: 'WebP to JPG', description: 'Convert WebP images to JPG format.', icon: 'WEBP' },
      { id: 'jpg-to-webp', name: 'JPG to WebP', description: 'Convert JPG images to modern WebP format.', icon: 'WEBP' },
      { id: 'compress-image', name: 'Compress Image', description: 'Reduce image size without losing clarity.', icon: 'ZIP', hasSettings: true },
      { id: 'resize-image', name: 'Resize Image', description: 'Change image dimensions by width and height.', icon: 'SIZE', hasSettings: true },
      { id: 'crop-image', name: 'Crop Image', description: 'Crop images to a selected area.', icon: 'CROP' },
      { id: 'rotate-image', name: 'Rotate Image', description: 'Rotate images in seconds.', icon: 'ROT' },
      { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images into PDF documents.', icon: 'PDF' },
      { id: 'heic-to-jpg', name: 'HEIC to JPG', description: 'Convert HEIC photos to JPG format.', icon: 'HEIC' },
    ],
  },
  video: {
    name: 'Video Tools',
    icon: 'VID',
    tools: [
      { id: 'compress-video', name: 'Compress Video', description: 'Reduce video size for sharing.', icon: 'ZIP', hasSettings: true },
      { id: 'mp4-to-avi', name: 'MP4 to AVI', description: 'Convert MP4 videos to AVI format.', icon: 'MP4' },
      { id: 'avi-to-mp4', name: 'AVI to MP4', description: 'Convert AVI videos to MP4 format.', icon: 'AVI' },
      { id: 'video-to-gif', name: 'Video to GIF', description: 'Create animated GIFs from video files.', icon: 'GIF' },
      { id: 'trim-video', name: 'Trim Video', description: 'Cut video files to the exact segment you need.', icon: 'CUT', hasSettings: true },
      { id: 'video-to-mp3', name: 'Video to MP3', description: 'Extract audio tracks from video files.', icon: 'MP3' },
      { id: 'mkv-to-mp4', name: 'MKV to MP4', description: 'Convert MKV videos to MP4 format.', icon: 'MKV' },
    ],
  },
  audio: {
    name: 'Audio Tools',
    icon: 'AUD',
    tools: [
      { id: 'mp3-to-wav', name: 'MP3 to WAV', description: 'Convert MP3 audio to WAV format.', icon: 'MP3' },
      { id: 'wav-to-mp3', name: 'WAV to MP3', description: 'Convert WAV audio to MP3 format.', icon: 'WAV' },
      { id: 'compress-audio', name: 'Compress Audio', description: 'Reduce audio file size quickly.', icon: 'ZIP', hasSettings: true },
      { id: 'trim-audio', name: 'Trim Audio', description: 'Cut audio clips to the right length.', icon: 'CUT', hasSettings: true },
      { id: 'm4a-to-mp3', name: 'M4A to MP3', description: 'Convert M4A audio to MP3 format.', icon: 'M4A' },
      { id: 'ogg-to-mp3', name: 'OGG to MP3', description: 'Convert OGG audio to MP3 format.', icon: 'OGG' },
    ],
  },
  archive: {
    name: 'Archive Tools',
    icon: 'ZIP',
    tools: [
      { id: 'zip-files', name: 'Create ZIP', description: 'Compress files into a ZIP archive.', icon: 'ZIP' },
      { id: 'unzip-files', name: 'Extract ZIP', description: 'Extract files from ZIP archives.', icon: 'ZIP' },
      { id: 'rar-to-zip', name: 'RAR to ZIP', description: 'Convert RAR archives to ZIP format.', icon: 'RAR' },
      { id: '7z-to-zip', name: '7Z to ZIP', description: 'Convert 7Z archives to ZIP format.', icon: '7Z' },
      { id: 'tar-to-zip', name: 'TAR to ZIP', description: 'Convert TAR archives to ZIP format.', icon: 'TAR' },
    ],
  },
};

export const getAllTools = () => {
  return Object.values(toolCategories).flatMap((category) =>
    category.tools.map((tool) => ({ ...tool, category: category.name }))
  );
};

export const getToolById = (toolId) => {
  return getAllTools().find((tool) => tool.id === toolId);
};

export const getToolsByCategory = (categoryKey) => {
  return toolCategories[categoryKey]?.tools || [];
};

const toolService = {
  async convertFile(toolId, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tool', toolId);

    Object.keys(options).forEach((key) => {
      formData.append(key, options[key]);
    });

    const response = await api.post('/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getHistory(page = 1, perPage = 10) {
    const response = await api.get('/conversions', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  async getConversion(id) {
    const response = await api.get(`/conversions/${id}`);
    return response.data;
  },

  async downloadFile(conversionId) {
    const response = await api.get(`/conversions/${conversionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteConversion(id) {
    const response = await api.delete(`/conversions/${id}`);
    return response.data;
  },

  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addFavorite(toolId) {
    const response = await api.post('/favorites', { tool_id: toolId });
    return response.data;
  },

  async removeFavorite(toolId) {
    const response = await api.delete(`/favorites/${toolId}`);
    return response.data;
  },
};

export default toolService;
