import { requireAuth, getSupabaseClient } from '../_utils/supabase.js';

/**
 * POST /api/projects/create - Create a new project
 *
 * Body:
 * - name: Project name (required)
 * - startDate: Project start date (optional, default: 2025-12-08)
 * - goLiveDate: Go-live date (optional, default: 2026-09-01)
 *
 * Returns:
 * - success: boolean
 * - project: Created project object
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication
        const user = await requireAuth(req, res);
        if (!user) return;

        const supabase = getSupabaseClient(req);
        const {
            name = 'HexagonRFP Project',
            startDate = '2025-12-08',
            goLiveDate = '2026-09-01'
        } = req.body;

        // Create new project
        const { data: project, error: createError } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                name: name,
                start_date: startDate,
                go_live_date: goLiveDate
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating project:', createError);
            return res.status(500).json({
                error: 'Failed to create project',
                message: createError.message
            });
        }

        // Create default project_data for the new project
        const { error: dataError } = await supabase
            .from('project_data')
            .insert({
                user_id: user.id,
                project_id: project.id,
                tasks: [],
                vendors: [],
                risks: [],
                milestones: [],
                evaluation: [],
                stakeholders: [],
                raci_activities: [],
                documents: [],
                decisions: [],
                meetings: [],
                meeting_notes: [],
                uploaded_files: {},
                vendor_scores: {},
                current_filter: 'all',
                current_vendor_filter: 'all',
                theme: 'light',
                version: 1
            });

        if (dataError) {
            console.error('Error creating project data:', dataError);
            // Note: Project was created but data initialization failed
            // This is not critical, data will be created on first save
        }

        return res.status(200).json({
            success: true,
            project: {
                id: project.id,
                name: project.name,
                startDate: project.start_date,
                goLiveDate: project.go_live_date,
                createdAt: project.created_at
            }
        });

    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
