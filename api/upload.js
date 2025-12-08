import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Folder, X-Document-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get and decode URI-encoded headers
    let filename = req.headers['x-filename'];
    let folder = req.headers['x-folder'] || 'documents';
    let documentType = req.headers['x-document-type'] || 'document';

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Try to decode URI-encoded values
    try {
      filename = decodeURIComponent(filename);
    } catch (e) {
      // If decoding fails, use as-is
    }
    try {
      folder = decodeURIComponent(folder);
    } catch (e) {
      // If decoding fails, use as-is
    }
    try {
      documentType = decodeURIComponent(documentType);
    } catch (e) {
      // If decoding fails, use as-is
    }

    // Helper function to sanitize path segments
    const sanitizePath = (str, allowDot = false) => {
      const pattern = allowDot ? /[^a-zA-Z0-9._-]/g : /[^a-zA-Z0-9_-]/g;
      return str
        .replace(pattern, '_')      // Replace invalid chars with underscore
        .replace(/_{2,}/g, '_')     // Collapse multiple underscores
        .replace(/^[^a-zA-Z0-9]+/, '') // Remove leading non-alphanumeric
        .replace(/[^a-zA-Z0-9]+$/, ''); // Remove trailing non-alphanumeric
    };

    // Create a unique path for the file
    const timestamp = Date.now();
    const sanitizedFilename = sanitizePath(filename, true) || 'file';
    const sanitizedFolder = sanitizePath(folder) || 'documents';
    const sanitizedDocumentType = sanitizePath(documentType) || 'document';
    const blobPath = `hexagon-rfp/${sanitizedDocumentType}/${sanitizedFolder}/${timestamp}-${sanitizedFilename}`;

    console.log('Upload path details:', {
      originalFilename: filename,
      sanitizedFilename,
      folder,
      sanitizedFolder,
      documentType,
      sanitizedDocumentType,
      blobPath
    });

    // Read the request body as a buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Upload to Vercel Blob
    const blob = await put(blobPath, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      filename: filename,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Upload error details:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message,
      details: error.name || 'Unknown error'
    });
  }
}
