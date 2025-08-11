## 🚀 Features
- RAG implementation with OpenAI embeddings
- Vector search with Supabase pgvector
- Streaming responses with Vercel AI SDK
- PDF processing and chunking
- Modern Next.js 14 app directory

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-3.5-turbo, text-embedding-3-small
- **Database**: Supabase (PostgreSQL + pgvector)
- **Deployment**: Vercel

## 📱 Try It Live
https://barekstripling-chabot.vercel.app/

## 🗄️ Database Setup

This project uses Supabase with the pgvector extension for vector similarity search. Run the following SQL commands in your Supabase SQL Editor to set up the database schema:

### 1. Enable pgvector Extension
```sql
-- Enable the pgvector extension
create extension if not exists vector;
```

### 2. Create Documents Table
```sql
-- Create documents table
create table documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(512),
  created_at timestamp with time zone default now()
);
```

### 3. Create Similarity Search Index
```sql
-- Create index for similarity search
create index on documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 4. Create Similarity Search Function
```sql
-- Create function for similarity search
create or replace function match_documents (
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;
```

### Database Schema Explanation
- **documents**: Main table storing PDF chunks and their vector embeddings
- **embedding**: 512-dimensional vector using OpenAI's text-embedding-3-small model
- **match_documents()**: Function for semantic similarity search using cosine distance
- **ivfflat index**: Optimized index for fast vector similarity queries

## 🔧 Environment Setup

Create a `.env.local` file with:
```env
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
