import { requireAuth, getSupabaseClient, getOrCreateDefaultProject } from '../_utils/supabase.js';

/**
 * GET /api/data/export - Export user's project data as JSON
 *
 * Query params:
 * - projectId (optional): Project ID to export
 *
 * Returns:
 * - success: boolean
 * - data: Complete appState object
 * - exportedAt: timestamp of export
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
        const { projectId } = req.query;

        // Get project ID
        const targetProjectId = projectId || await getOrCreateDefaultProject(supabase, user.id);

        // Fetch project data
        const { data: projectData, error: fetchError } = await supabase
            .from('project_data')
            .select('*')
            .eq('user_id', user.id)
            .eq('project_id', targetProjectId)
            .single();

        if (fetchError) {
            console.error('Error fetching data for export:', fetchError);
            return res.status(500).json({
                error: 'Failed to export data',
                message: fetchError.message
            });
        }

        // Convert to appState format
        const appState = {
            tasks: projectData.tasks || [],
            vendors: projectData.vendors || [],
            risks: projectData.risks || [],
            milestones: projectData.milestones || [],
            evaluation: projectData.evaluation || [],
            stakeholders: projectData.stakeholders || [],
            raciActivities: projectData.raci_activities || [],
            documents: projectData.documents || [],
            decisions: projectData.decisions || [],
            meetings: projectData.meetings || [],
            meetingNotes: projectData.meeting_notes || [],
            uploadedFiles: projectData.uploaded_files || {},
            vendorScores: projectData.vendor_scores || {},
            currentFilter: projectData.current_filter || 'all',
            currentVendorFilter: projectData.current_vendor_filter || 'all',
            calendarMonth: projectData.calendar_month,
            meetingCalendarMonth: projectData.meeting_calendar_month,
            theme: projectData.theme || 'light',
            startDate: '2025-12-08',
            goLiveDate: '2026-09-01'
        };

        return res.status(200).json({
            success: true,
            data: appState,
            exportedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
