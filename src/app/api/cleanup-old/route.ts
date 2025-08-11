import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Calculate the cutoff time (48 hours ago)
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 48);
        const cutoffISO = cutoffTime.toISOString();

        console.log(`🗑️ Cleaning up embeddings older than: ${cutoffISO}`);

        // Delete all documents older than 48 hours
        const { data, error } = await supabase
            .from('documents')
            .delete()
            .lt('created_at', cutoffISO)
            .select('id, session_id, created_at');

        if (error) {
            console.error('Old embeddings cleanup error:', error);
            return NextResponse.json({ 
                error: error.message,
                success: false 
            }, { status: 500 });
        }

        const deletedCount = data?.length || 0;
        const uniqueSessions = new Set(data?.map(doc => doc.session_id) || []).size;
        
        console.log(`✅ Cleaned up ${deletedCount} old documents from ${uniqueSessions} sessions`);

        return NextResponse.json({
            success: true,
            deletedCount,
            uniqueSessionsAffected: uniqueSessions,
            cutoffTime: cutoffISO,
            message: `Successfully cleaned up ${deletedCount} embeddings older than 48 hours`
        });

    } catch (error: unknown) {
        console.error("Cleanup old embeddings API error:", error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : "Failed to cleanup old embeddings",
            success: false
        }, { status: 500 });
    }
}