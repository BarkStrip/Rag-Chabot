// app/api/enhance/route.ts - Optimized for FREE TIER
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SERVICE CAPACITY limits (internal - don't expose to users)
const SERVICE_LIMITS = {
    MAX_REQUESTS_PER_MINUTE: 3,
    DELAY_BETWEEN_REQUESTS: 25000, // 25 seconds between requests
    MAX_CHUNKS_PER_REQUEST: 20, // Process 20 chunks at a time for reliability
    RETRY_DELAY: 60000, // 1 minute retry delay for actual errors
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const makeEmbeddingRequest = async (batch: string[]): Promise<any> => {
    try {
        console.log(`Making embedding request for ${batch.length} chunks`);

        return await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: batch
        });
    } catch (error: any) {
        console.error(`Request failed:`, error.message);

        // For service capacity limits, don't retry - just fail fast and let the outer loop handle delays
        if (error.status === 429) {
            throw new Error(`Processing capacity exceeded. Current service limits reached.`);
        }

        throw error;
    }
};

export async function POST(req: Request) {
    try {
        const { chunks } = await req.json();

        if (!chunks || !Array.isArray(chunks)) {
            return NextResponse.json({ error: "Invalid chunks data" }, { status: 400 });
        }

        // Extract and validate text content
        const textChunks = chunks
            .map((chunk: any) => chunk.pageContent || chunk)
            .filter((chunk: any) => typeof chunk === 'string' && chunk.trim().length > 0);

        if (textChunks.length === 0) {
            return NextResponse.json({ error: "No valid text chunks found" }, { status: 400 });
        }

        // Process a limited number of chunks to ensure reliable processing
        const maxChunksToProcess = 15; // Reasonable limit for current service capacity
        const chunksToProcess = textChunks.slice(0, maxChunksToProcess);

        if (textChunks.length > maxChunksToProcess) {
            console.log(`Info: Processing ${maxChunksToProcess} of ${textChunks.length} chunks in this batch`);
        }

        console.log(`Processing ${chunksToProcess.length} chunks with enhanced processing`);

        // Create small batches for reliable processing
        const batches = [];
        for (let i = 0; i < chunksToProcess.length; i += SERVICE_LIMITS.MAX_CHUNKS_PER_REQUEST) {
            batches.push(chunksToProcess.slice(i, i + SERVICE_LIMITS.MAX_CHUNKS_PER_REQUEST));
        }

        console.log(`Created ${batches.length} batches for processing`);

        const embeddings = [];
        const startTime = Date.now();

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];

            console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} chunks)`);
            console.log(`⏱️ Estimated time remaining: ${((batches.length - i - 1) * SERVICE_LIMITS.DELAY_BETWEEN_REQUESTS / 1000).toFixed(0)}s`);

            try {
                const res = await makeEmbeddingRequest(batch);
                embeddings.push(...res.data.map(e => e.embedding));

                console.log(`✅ Batch ${i + 1} completed. Total embeddings: ${embeddings.length}`);

                // Mandatory processing delay to ensure reliability
                if (i < batches.length - 1) {
                    console.log(`⏳ Processing next batch in ${SERVICE_LIMITS.DELAY_BETWEEN_REQUESTS / 1000}s...`);
                    await delay(SERVICE_LIMITS.DELAY_BETWEEN_REQUESTS);
                }

            } catch (error: any) {
                console.error(`❌ Batch ${i + 1} failed:`, error.message);

                // For service limits, stop processing and return what we have
                if (error.message.includes('Rate limit exceeded')) {
                    return NextResponse.json({
                        success: embeddings.length > 0,
                        count: embeddings.length,
                        processedChunks: embeddings.length,
                        totalChunks: chunksToProcess.length,
                        error: "Processing capacity reached",
                        message: "Successfully processed some chunks. Try processing fewer chunks at once for better results.",
                        partialResults: true
                    }, { status: 429 });
                }

                throw error;
            }
        }

        const totalTime = (Date.now() - startTime) / 1000;
        console.log(`✅ All batches completed in ${totalTime}s`);

        return NextResponse.json({
            success: true,
            count: embeddings.length,
            processedChunks: embeddings.length,
            totalChunks: textChunks.length,
            processingTime: totalTime,
            batchesProcessed: batches.length,
            note: textChunks.length > maxChunksToProcess ?
                `Processed ${maxChunksToProcess} chunks in this batch. Submit remaining chunks separately for continued processing.` :
                undefined
        });

    } catch (error: unknown) {
        console.error("Enhance API error:", error);

        return NextResponse.json({
            error: error instanceof Error ? error.message : "Processing error occurred",
            message: "Unable to process embeddings at this time. Please try again with fewer chunks."
        }, { status: 500 });
    }
}