/* Description:

PDF upload API endpoint: the HTTP interface that handles file uploads and 
triggers RAG pipeline.
*/

import { NextRequest } from 'next/server'
import * as pdfjsLib from "pdfjs-dist";

// Use a Node-compatible worker
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function POST(request: NextRequest) {
  try {
    //Form Data Extraction
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    //Validation Layer
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }
    
    //File Processing
    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdfParse(buffer);
    
    return NextResponse.json({ text: data.text })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}