import { requireAuth, getSupabaseClient, getOrCreateDefaultProject } from '../_utils/supabase.js';

/**
 * POST /api/data/import - Import data from backup/export
 *
 * Body:
 * - projectId (optional): Project ID to import into
 * - data: Complete appState object to import
 * - createBackup (optional): Create backup before import (default: true)
 *
 * Returns:
 * - success: boolean
 * - imported: boolean
 * - backupId: ID of backup created (if createBackup was true)
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
        const { projectId, data, createBackup = true } = req.body;

        if (!data) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Data is required for import'
            });
        }

        // Get project ID
        const targetProjectId = projectId || await getOrCreateDefaultProject(supabase, user.id);

        let backupId = null;

        // Create backup of existing data if requested
        if (createBackup) {
            const { data: existingData } = await supabase
                .from('project_data')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_id', targetProjectId)
                .single();

            if (existingData) {
                const { data: backup, error: backupError } = await supabase
                    .from('data_backups')
                    .insert({
                        user_id: user.id,
                        project_id: targetProjectId,
                        backup_data: existingData,
                        backup_type: 'pre-import'
                    })
                    .select()
                    .single();

                if (!backupError && backup) {
                    backupId = backup.id;
                }
            }
        }

        // Convert imported data to database format
        const dbData = {
            tasks: data.tasks || [],
            vendors: data.vendors || [],
            risks: data.risks || [],
            milestones: data.milestones || [],
            evaluation: data.evaluation || [],
            stakeholders: data.stakeholders || [],
            raci_activities: data.raciActivities || [],
            documents: data.documents || [],
            decisions: data.decisions || [],
            meetings: data.meetings || [],
            meeting_notes: data.meetingNotes || [],
            uploaded_files: data.uploadedFiles || {},
            vendor_scores: data.vendorScores || {},
            current_filter: data.currentFilter || 'all',
            current_vendor_filter: data.currentVendorFilter || 'all',
            calendar_month: data.calendarMonth || '2025-12-01',
            meeting_calendar_month: data.meetingCalendarMonth || '2025-12-01',
            theme: data.theme || 'light'
        };

        // Upsert the data (insert or update)
        const { error: upsertError } = await supabase
            .from('project_data')
            .upsert({
                user_id: user.id,
                project_id: targetProjectId,
                ...dbData,
                version: 1
            }, {
                onConflict: 'project_id'
            });

        if (upsertError) {
            console.error('Error importing data:', upsertError);
            return res.status(500).json({
                error: 'Failed to import data',
                message: upsertError.message
            });
        }

        return res.status(200).json({
            success: true,
            imported: true,
            backupId: backupId,
            projectId: targetProjectId
        });

    } catch (error) {
        console.error('Import error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
