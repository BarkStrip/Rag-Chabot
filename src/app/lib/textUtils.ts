/* Description:

text preprocessing module: prepares raw PDF text for embedding and storage
*/

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// text preprocessing module - it prepares raw PDF text for embedding and storage
export async function chunkText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  })

  const chunks = await splitter.splitText(text)
  return chunks
}

// Normalizes messy PDF text extraction
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}