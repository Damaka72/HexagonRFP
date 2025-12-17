import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prefix, cursor, limit } = req.query;

    const options = {
      prefix: prefix || 'hexagon-rfp/',
      limit: parseInt(limit) || 100,
    };

    if (cursor) {
      options.cursor = cursor;
    }

    const { blobs, cursor: nextCursor, hasMore } = await list(options);

    // Transform blob data for easier consumption
    const files = blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      // Extract filename from pathname
      filename: blob.pathname.split('/').pop(),
      // Extract folder from pathname
      folder: blob.pathname.split('/').slice(0, -1).join('/'),
    }));

    return res.status(200).json({
      success: true,
      files,
      cursor: nextCursor,
      hasMore,
      total: files.length,
    });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({
      error: 'List failed',
      message: error.message
    });
  }
}
