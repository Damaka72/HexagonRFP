import { requireAuth, getSupabaseClient, getOrCreateDefaultProject } from '../_utils/supabase.js';

/**
 * POST /api/data/save - Save user's project data to cloud
 *
 * Body:
 * - projectId (optional): Project ID to save to
 * - data: Complete appState object to save
 * - isPartial (optional): If true, only update provided fields
 *
 * Returns:
 * - success: boolean
 * - version: New version number
 * - lastModified: timestamp of save
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
        if (!user) return; // requireAuth already sent 401 response

        const supabase = getSupabaseClient(req);
        const { projectId, data, isPartial = false } = req.body;

        if (!data) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Data is required'
            });
        }

        // Get project ID (use provided or get/create default)
        const targetProjectId = projectId || await getOrCreateDefaultProject(supabase, user.id);

        console.log(`Saving data for user ${user.id}, project ${targetProjectId}`);

        // Convert appState to database format
        const dbData = convertAppStateToDb(data);

        // Check if project_data already exists
        const { data: existing, error: fetchError } = await supabase
            .from('project_data')
            .select('id, version')
            .eq('user_id', user.id)
            .eq('project_id', targetProjectId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing data:', fetchError);
            return res.status(500).json({
                error: 'Database error',
                message: fetchError.message
            });
        }

        let result;

        if (existing) {
            // Update existing record
            const updateData = isPartial ? dbData : {
                ...dbData,
                version: (existing.version || 0) + 1,
                last_modified: new Date().toISOString()
            };

            const { data: updated, error: updateError } = await supabase
                .from('project_data')
                .update(updateData)
                .eq('user_id', user.id)
                .eq('project_id', targetProjectId)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating data:', updateError);
                return res.status(500).json({
                    error: 'Failed to save data',
                    message: updateError.message
                });
            }

            result = updated;
        } else {
            // Create new record
            const { data: created, error: createError } = await supabase
                .from('project_data')
                .insert({
                    user_id: user.id,
                    project_id: targetProjectId,
                    ...dbData,
                    version: 1
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating data:', createError);
                return res.status(500).json({
                    error: 'Failed to save data',
                    message: createError.message
                });
            }

            result = created;
        }

        return res.status(200).json({
            success: true,
            version: result.version,
            lastModified: result.last_modified,
            projectId: targetProjectId
        });

    } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

/**
 * Convert appState format to database format
 */
function convertAppStateToDb(appState) {
    return {
        // Core data collections (convert camelCase to snake_case for DB)
        tasks: appState.tasks || [],
        vendors: appState.vendors || [],
        risks: appState.risks || [],
        milestones: appState.milestones || [],
        evaluation: appState.evaluation || [],
        stakeholders: appState.stakeholders || [],
        raci_activities: appState.raciActivities || [],
        documents: appState.documents || [],
        decisions: appState.decisions || [],
        meetings: appState.meetings || [],
        meeting_notes: appState.meetingNotes || [],
        uploaded_files: appState.uploadedFiles || {},
        vendor_scores: appState.vendorScores || {},

        // UI state
        current_filter: appState.currentFilter || 'all',
        current_vendor_filter: appState.currentVendorFilter || 'all',
        calendar_month: appState.calendarMonth || '2025-12-01',
        meeting_calendar_month: appState.meetingCalendarMonth || '2025-12-01',
        theme: appState.theme || 'light'
    };
}
