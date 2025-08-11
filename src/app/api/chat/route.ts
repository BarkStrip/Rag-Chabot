import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

// Cosine similarity function for vector comparison
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { message, session_id } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (!session_id || typeof session_id !== 'string') {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        console.log('🤖 Processing question for session:', session_id);

        // Step 1: Create embedding for user's question
        console.log('📝 Creating question embedding...');
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message
        });

        const questionEmbedding = embeddingResponse.data[0].embedding;

        // Step 2: Get documents for this session first, then perform semantic search
        console.log('🔍 Getting documents for session...');
        const { data: sessionDocs, error: sessionError } = await supabase
            .from('documents')
            .select('id, content, metadata, embedding')
            .eq('session_id', session_id);

        if (sessionError) {
            console.error('Session query error:', sessionError);
            throw new Error('Unable to access document content for your session');
        }

        if (!sessionDocs || sessionDocs.length === 0) {
            console.log('📊 No documents found for session');
            return NextResponse.json({
                response: "I don't have any document content to search through for your session. Please make sure you've uploaded a PDF and created embeddings first."
            });
        }

        console.log(`📊 Session has ${sessionDocs.length} documents to search through`);

        // Step 3: Calculate similarity scores manually for session documents
        console.log('🔍 Analyzing embeddings for each document...');

        const searchResults = sessionDocs
            ?.map((doc: any, index: number) => {
                // Calculate cosine similarity between question and document embeddings
                const docEmbedding = doc.embedding;

                if (!docEmbedding) {
                    console.log(`❌ Doc ${index + 1}: No embedding found`);
                    return null;
                }

                // Handle different embedding formats from Supabase
                let embeddingArray = docEmbedding;
                if (typeof docEmbedding === 'string') {
                    try {
                        embeddingArray = JSON.parse(docEmbedding);
                    } catch (e) {
                        console.log(`❌ Doc ${index + 1}: Failed to parse embedding string`);
                        return null;
                    }
                }

                if (!Array.isArray(embeddingArray) || embeddingArray.length === 0) {
                    console.log(`❌ Doc ${index + 1}: Invalid embedding array`);
                    return null;
                }

                // Validate embedding dimensions match
                if (embeddingArray.length !== questionEmbedding.length) {
                    console.log(`❌ Doc ${index + 1}: Embedding dimension mismatch (${embeddingArray.length} vs ${questionEmbedding.length})`);
                    return null;
                }

                const similarity = cosineSimilarity(questionEmbedding, embeddingArray);
                console.log(`📊 Doc ${index + 1}: similarity = ${similarity.toFixed(4)}`);

                return {
                    id: doc.id,
                    content: doc.content,
                    metadata: doc.metadata,
                    similarity: similarity
                };
            })
            .filter((doc: any) => doc !== null) // Remove null entries
            .filter((doc: any) => doc.similarity > 0.5) // Lower threshold for debugging
            .sort((a: any, b: any) => b.similarity - a.similarity) // Sort by similarity desc
            .slice(0, 5) || []; // Take top 5

        console.log(`📊 Found ${searchResults.length} relevant chunks for session`);

        // Step 4: Build context from search results
        let contextContent = '';
        if (searchResults && searchResults.length > 0) {
            contextContent = searchResults
                .map((result: any, index: number) => `[Chunk ${index + 1}]: ${result.content}`)
                .join('\n\n');
        }

        // Step 5: Create GPT response with context
        const systemPrompt = contextContent
            ? `You are an AI assistant that answers questions about uploaded PDF documents. Use the following document content to answer the user's question accurately and helpfully. If the provided content doesn't contain relevant information to answer the question, say so clearly.

Document Content:
${contextContent}

Instructions:
- Answer based on the provided document content
- Be specific and reference the relevant parts of the document
- If the document doesn't contain the answer, state that clearly
- Keep responses concise but complete`
            : `You are an AI assistant. The user has uploaded a document but no relevant content was found for their question. Let them know that you couldn't find relevant information in their document to answer their question, and suggest they try rephrasing their question or ask about different aspects of their document.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 500,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("No response generated");
        }

        console.log('✅ Chat response generated successfully');

        return NextResponse.json({
            response: response.trim()
        });

    } catch (error: unknown) {
        console.error("Chat API error:", error);

        // Handle specific OpenAI API errors
        if (error instanceof Error) {
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                return NextResponse.json({
                    error: "I'm receiving a lot of requests right now. Please wait a moment and try again."
                }, { status: 429 });
            }

            if (error.message.includes('quota') || error.message.includes('billing')) {
                return NextResponse.json({
                    error: "I'm currently unavailable due to API limits. Please try again later."
                }, { status: 503 });
            }
        }

        return NextResponse.json({
            error: "I encountered an issue while generating a response. Please try asking again."
        }, { status: 500 });
    }
}