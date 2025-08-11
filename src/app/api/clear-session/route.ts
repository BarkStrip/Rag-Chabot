import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { session_id } = await req.json();

        if (!session_id) {
            return NextResponse.json({ error: "session_id is required" }, { status: 400 });
        }

        console.log(`🗑️ Clearing embeddings for session: ${session_id}`);

        // Delete all documents for this session
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .eq('session_id', session_id)
            .select('id');

        if (error) {
            console.error('Session cleanup error:', error);
            return NextResponse.json({ 
                error: error.message,
                success: false 
            }, { status: 500 });
        }

        const deletedCount = data?.length || 0;
        console.log(`✅ Cleared ${deletedCount} documents for session: ${session_id}`);

        return NextResponse.json({
            success: true,
            deletedCount,
            session_id
        });

    } catch (error: unknown) {
        console.error("Clear session API error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Failed to clear session data",
            success: false
        }, { status: 500 });
    }
}