/* Description:

Converts text chunks into dense vector representations (embeddings) 
that capture semantic meaning, enabling similarity-based retrieval. 

Role PDF Processing: When uploading PDFs → chunk text → call this 
function → store embeddings in Supabase table
*/

import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  
  return response.data[0].embedding
}