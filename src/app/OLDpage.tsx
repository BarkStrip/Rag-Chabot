'use client'

import { useState } from 'react'

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUploadPDF = async () => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Fetch the hardcoded PDF file from public folder
      const response = await fetch('/sample.pdf')
      if (!response.ok) {
        throw new Error('Failed to fetch sample.pdf')
      }
      
      const pdfBlob = await response.blob()
      
      // Create FormData and append the PDF
      const formData = new FormData()
      formData.append('file', pdfBlob, 'sample.pdf')
      
      // Send to your API
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const uploadResult = await uploadResponse.json()
      
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Upload failed')
      }
      
      setResult(uploadResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>PDF RAG System</h1>
      
      <button 
        onClick={handleUploadPDF}
        disabled={isProcessing}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isProcessing ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isProcessing ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessing ? 'Processing PDF...' : 'Upload sample.pdf'}
      </button>
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336',
          borderRadius: '5px',
          color: '#d32f2f'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          border: '1px solid #4caf50',
          borderRadius: '5px'
        }}>
          <h3>Success!</h3>
          <p><strong>Chunks processed:</strong> {result.chunksProcessed}</p>
          <p><strong>Documents created:</strong> {result.documents?.length || 0}</p>
          <details>
            <summary>View full result</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}