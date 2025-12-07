import { del } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate that the URL is from our blob store
    if (!url.includes('blob.vercel-storage.com') && !url.includes('public.blob.vercel-storage.com')) {
      return res.status(400).json({ error: 'Invalid blob URL' });
    }

    await del(url);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      deletedUrl: url,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: 'Delete failed',
      message: error.message
    });
  }
}
