import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase client for server-side operations
 * Uses service role key for admin operations
 */
export function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Get Supabase client with user context from request
 * Extracts JWT token from Authorization header
 */
export function getSupabaseClient(req) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Extract JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Token will be automatically validated by Supabase
        supabase.auth.setSession({
            access_token: token,
            refresh_token: '' // Not needed for API calls
        });
    }

    return supabase;
}

/**
 * Get authenticated user from request
 * Returns user object or null if not authenticated
 */
export async function getAuthenticatedUser(req) {
    try {
        const supabase = getSupabaseClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        return null;
    }
}

/**
 * Verify user is authenticated and return user object
 * Throws 401 error if not authenticated
 */
export async function requireAuth(req, res) {
    const user = await getAuthenticatedUser(req);

    if (!user) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource'
        });
        return null;
    }

    return user;
}

/**
 * Get user's default project ID or create one if it doesn't exist
 */
export async function getOrCreateDefaultProject(supabase, userId) {
    // Check if user has any projects
    const { data: projects, error: fetchError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

    if (fetchError) {
        throw new Error(`Failed to fetch projects: ${fetchError.message}`);
    }

    // If user has a project, return the first one
    if (projects && projects.length > 0) {
        return projects[0].id;
    }

    // Create default project
    const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
            user_id: userId,
            name: 'HexagonRFP Project',
            start_date: '2025-12-08',
            go_live_date: '2026-09-01'
        })
        .select()
        .single();

    if (createError) {
        throw new Error(`Failed to create project: ${createError.message}`);
    }

    return newProject.id;
}
