/* Description:

Semantic search engine: the retrieval component of the RAG system that 
finds relevant PDF chunks for user queries
*/

import { supabase, Document } from './supabase'
import { createEmbedding } from './openai'

export async function searchSimilarDocuments(
  query: string,
  matchThreshold: number = 0.5,
  matchCount: number = 5
): Promise<Document[]> {
  try {
    // Create query embedding
    const queryEmbedding = await createEmbedding(query)
    
    // Search for similar documents
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Error searching documents:', error)
    throw error
  }
}