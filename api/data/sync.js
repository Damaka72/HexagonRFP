import { requireAuth, getSupabaseClient, getOrCreateDefaultProject } from '../_utils/supabase.js';

/**
 * GET /api/data/sync - Load user's project data from cloud
 *
 * Query params:
 * - projectId (optional): Specific project ID to load
 *
 * Returns:
 * - success: boolean
 * - data: Complete appState object
 * - lastModified: timestamp of last update
 * - projectId: ID of the loaded project
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
        if (!user) return; // requireAuth already sent 401 response

        const supabase = getSupabaseClient(req);
        const { projectId } = req.query;

        // Get project ID (use provided or get/create default)
        const targetProjectId = projectId || await getOrCreateDefaultProject(supabase, user.id);

        console.log(`Syncing data for user ${user.id}, project ${targetProjectId}`);

        // Fetch project data
        const { data: projectData, error: fetchError } = await supabase
            .from('project_data')
            .select('*')
            .eq('user_id', user.id)
            .eq('project_id', targetProjectId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching project data:', fetchError);
            return res.status(500).json({
                error: 'Database error',
                message: fetchError.message
            });
        }

        // If no data exists, create default project data
        if (!projectData) {
            console.log('No existing data, creating default project data');

            const defaultData = getDefaultAppState();

            const { data: newProjectData, error: createError } = await supabase
                .from('project_data')
                .insert({
                    user_id: user.id,
                    project_id: targetProjectId,
                    ...defaultData,
                    version: 1
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating project data:', createError);
                return res.status(500).json({
                    error: 'Failed to create project data',
                    message: createError.message
                });
            }

            return res.status(200).json({
                success: true,
                data: convertDbToAppState(newProjectData),
                lastModified: newProjectData.last_modified,
                projectId: targetProjectId,
                isNew: true
            });
        }

        // Return existing data
        return res.status(200).json({
            success: true,
            data: convertDbToAppState(projectData),
            lastModified: projectData.last_modified,
            projectId: targetProjectId,
            isNew: false
        });

    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

/**
 * Convert database format to appState format
 */
function convertDbToAppState(dbData) {
    return {
        // Core data collections
        tasks: dbData.tasks || [],
        vendors: dbData.vendors || [],
        risks: dbData.risks || [],
        milestones: dbData.milestones || [],
        evaluation: dbData.evaluation || [],
        stakeholders: dbData.stakeholders || [],
        raciActivities: dbData.raci_activities || [],
        documents: dbData.documents || [],
        decisions: dbData.decisions || [],
        meetings: dbData.meetings || [],
        meetingNotes: dbData.meeting_notes || [],
        uploadedFiles: dbData.uploaded_files || {},
        vendorScores: dbData.vendor_scores || {},

        // UI state
        currentFilter: dbData.current_filter || 'all',
        currentVendorFilter: dbData.current_vendor_filter || 'all',
        calendarMonth: dbData.calendar_month || new Date('2025-12-01'),
        meetingCalendarMonth: dbData.meeting_calendar_month || new Date('2025-12-01'),
        theme: dbData.theme || 'light',

        // Project configuration (from related project record)
        startDate: new Date('2025-12-08'),
        goLiveDate: new Date('2026-09-01')
    };
}

/**
 * Get default appState for new projects
 */
function getDefaultAppState() {
    return {
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
        calendar_month: '2025-12-01',
        meeting_calendar_month: '2025-12-01',
        theme: 'light'
    };
}
