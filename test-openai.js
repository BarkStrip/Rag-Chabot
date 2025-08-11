#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function testOpenAICredentials() {
    console.log('Testing OpenAI API credentials...\n');

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('❌ OPENAI_API_KEY not found in .env.local');
        process.exit(1);
    }

    console.log('✓ API Key found:', apiKey.substring(0, 20) + '...');

    try {
        // Test with a simple API call to list models (minimal quota usage)
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }3
        });

        console.log('Status:', response.status, response.statusText);

        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ API Key is VALID and has quota available');
            console.log('Available models count:', data.data?.length || 0);

            // Check if embedding model is available
            const hasEmbeddingModel = data.data?.some(model =>
                model.id.includes('text-embedding')
            );
            console.log('Text embedding models available:', hasEmbeddingModel ? '✅' : '❌');

        } else if (response.status === 401) {
            console.log('❌ API Key is INVALID or EXPIRED');
            const errorData = await response.json();
            console.log('Error:', errorData.error?.message || 'Authentication failed');

        } else if (response.status === 429) {
            console.log('⚠️  API Key is VALID but QUOTA EXCEEDED');
            const errorData = await response.json();
            console.log('Error:', errorData.error?.message || 'Rate limit/quota exceeded');
            console.log('💡 Solution: Add credits at https://platform.openai.com/account/billing');

        } else {
            console.log('❓ Unexpected response');
            const errorData = await response.json().catch(() => ({}));
            console.log('Error:', errorData.error?.message || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ Network or other error:', error.message);
    }
}

testOpenAICredentials();