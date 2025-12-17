import { requireAuth, getSupabaseClient } from '../_utils/supabase.js';

/**
 * GET /api/projects/list - List all user's projects
 *
 * Returns:
 * - success: boolean
 * - projects: Array of project objects
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const supabase = getSupabaseClient(req);

        // Fetch user's projects with last modified date from project_data
        const { data: projects, error: fetchError } = await supabase
            .from('projects')
            .select(`
                id,
                name,
                start_date,
                go_live_date,
                created_at,
                updated_at,
                project_data (
                    last_modified
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Error fetching projects:', fetchError);
            return res.status(500).json({
                error: 'Failed to fetch projects',
                message: fetchError.message
            });
        }

        // Format the response
        const formattedProjects = (projects || []).map(project => ({
            id: project.id,
            name: project.name,
            startDate: project.start_date,
            goLiveDate: project.go_live_date,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            lastModified: project.project_data?.[0]?.last_modified || project.updated_at
        }));

        return res.status(200).json({
            success: true,
            projects: formattedProjects
        });

    } catch (error) {
        console.error('List projects error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
