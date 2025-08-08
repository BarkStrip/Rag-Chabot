# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server with Turbopack
- **Build**: `npm run build` - Creates production build
- **Linting**: `npm run lint` - Runs ESLint checks
- **Start production**: `npm start` - Runs the production server

## Architecture Overview

This is a RAG (Retrieval-Augmented Generation) chatbot application built with Next.js 15 that processes PDF documents and enables Q&A functionality.

### Core Structure

- **Frontend**: Next.js App Router with TypeScript, Tailwind CSS, and React 19
- **PDF Processing**: LangChain community loaders with document chunking via RecursiveCharacterTextSplitter
- **AI Integration**: OpenAI GPT models with text embeddings
- **Database**: Supabase with pgvector for vector similarity search
- **UI Components**: Custom resizable panels with drag-and-drop functionality

### Key Application Flow

1. **PDF Upload** (`/api/upload/route.ts`): Handles file uploads, extracts text using WebPDFLoader, and chunks content with 1000-character chunks and 200-character overlap
2. **Document Processing**: Text is split into manageable chunks for embedding and vector storage
3. **Multi-View Interface**: Split-panel UI with three viewing modes:
   - Embedded PDF viewer using browser's native PDF rendering
   - Text extraction display with search functionality
   - Chunked content visualization

### Component Architecture

- **Main App** (`src/app/page.tsx`): Manages split-panel layout with resizable dividers, file handling, and view state
- **PDF Components**: 
  - `PDFViewer`: Native browser PDF embedding
  - `PdfTextViewer`: Text extraction with search highlighting
- **UI Components**: `Dropdown` for view selection

### Environment Configuration

Required environment variables (copy from `env.sample` to `.env.local`):
- `OPENAI_API_KEY`: OpenAI API access
- `SUPABASE_URL`: Supabase project URL  
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Technical Notes

- Uses TypeScript with strict mode enabled
- Tailwind CSS for styling with dark theme
- Custom type definitions in `src/types/`
- Path alias `@/*` maps to `src/*`
- Blob URL management with proper cleanup for PDF file handling
- Client-side state management for resizable panels and file processing