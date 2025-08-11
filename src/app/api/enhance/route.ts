// app/api/enhance/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const { chunks } = await req.json();

        if (!chunks || !Array.isArray(chunks)) {
            return NextResponse.json({ error: "Invalid chunks data" }, { status: 400 });
        }

        // Extract text content from LangChain Document objects
        const textChunks = chunks.map((chunk: any) => chunk.pageContent || chunk);

        // Filter out empty or invalid chunks
        const validChunks = textChunks.filter((chunk: any) => 
            typeof chunk === 'string' && chunk.trim().length > 0
        );

        if (validChunks.length === 0) {
            return NextResponse.json({ error: "No valid text chunks found" }, { status: 400 });
        }

        const embeddings = [];
        const batchSize = 20;

        for (let i = 0; i < validChunks.length; i += batchSize) {
            const batch = validChunks.slice(i, i + batchSize);
            const res = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: batch
            });
            embeddings.push(...res.data.map(e => e.embedding));

            // Log full embeddings to your server console
            res.data.forEach((e, idx) => {
                console.log("Chunk:", batch[idx]);
                console.log("Embedding length:", e.embedding.length);
                console.log("First 5 values:", e.embedding.slice(0, 5));
            });
        }

        // TODO: store embeddings in vector DB
        return NextResponse.json({ success: true, count: embeddings.length });
    } catch (error: unknown) {
        console.error("Enhance API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error occurred" }, 
            { status: 500 }
        );
    }
}
