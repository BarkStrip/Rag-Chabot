/* Description: 

core PDF ingestion pipeline - it orchestrates the entire process of 
converting a PDF into searchable vectors. 
*/

import pdf from 'pdf-parse'
import { createEmbedding } from './openai'
import { supabase } from './supabase'
import { chunkText, cleanText } from './textUtils'

export async function processPDF(buffer: Buffer, filename: string) {
  try {
    // Extract text from PDF
    const data = await pdf(buffer)
    const cleanedText = cleanText(data.text)
    
    // Split into chunks
    const chunks = await chunkText(cleanedText)
    
    // Process each chunk
    const processedChunks = []
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Create embedding
      const embedding = await createEmbedding(chunk)
      
      // Prepare document data
      const documentData = {
        content: chunk,
        metadata: {
          filename,
          chunk_index: i,
          total_chunks: chunks.length,
        },
        embedding,
      }
      
      processedChunks.push(documentData)
    }
    
    // Insert into Supabase
    const { data: insertedDocs, error } = await supabase
      .from('documents')
      .insert(processedChunks)
      .select()
    
    if (error) throw error
    
    return {
      success: true,
      chunksProcessed: chunks.length,
      documents: insertedDocs,
    }
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw error
  }
}