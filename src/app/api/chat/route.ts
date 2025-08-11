import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const { message } = await req.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        console.log('🤖 Generating chat response for:', message.substring(0, 50) + '...');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions. Keep responses conversational and informative."
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