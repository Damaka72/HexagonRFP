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
    const filename = req.headers['x-filename'];
    const folder = req.headers['x-folder'] || 'documents';
    const documentType = req.headers['x-document-type'] || 'document'; // 'document' or 'meeting-note'

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Create a unique path for the file
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Sanitize folder and documentType to prevent pattern validation errors
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-]/g, '_');
    const sanitizedDocumentType = documentType.replace(/[^a-zA-Z0-9-]/g, '_');
    const blobPath = `hexagon-rfp/${sanitizedDocumentType}/${sanitizedFolder}/${timestamp}-${sanitizedFilename}`;

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
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}
