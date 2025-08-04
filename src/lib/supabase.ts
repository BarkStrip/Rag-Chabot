/* Description:

Sets up the connection to Supabase, which serves as both the database and 
vector store for the RAG implementation. 
*/

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface Document {
  id: number
  content: string
  metadata: any
  similarity?: number
} 