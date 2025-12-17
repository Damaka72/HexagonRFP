import { del } from '@vercel/blob';
import { getAuthenticatedUser } from './_utils/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in to delete files' });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate that the URL is from our blob store
    if (!url.includes('blob.vercel-storage.com') && !url.includes('public.blob.vercel-storage.com')) {
      return res.status(400).json({ error: 'Invalid blob URL' });
    }

    // Verify the file belongs to this user (URL should contain user.id)
    if (!url.includes(`/${user.id}/`)) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to delete this file' });
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
