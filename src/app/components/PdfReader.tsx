"use client"; // Ensures this component runs on the client side (required for using React hooks in Next.js App Router)

import React, { useState } from 'react';
import PdfViewer from './PdfViewer';
import TextExtractor from './TextExtractor';
import pdfToText from 'react-pdftotext'


const PdfReader: React.FC = () => {
  // State to hold the URL of the uploaded PDF file
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Handles file selection from the input
  const handleFileChange = async ( event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

      
    // Only proceed if a PDF file is selected
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append("pdf", file);

      // Clean up previous blob URL before assigning a new one
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      // Create a temporary object URL 
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      // Show an alert if the uploaded file is not a PDF
      alert('Please upload a valid PDF file.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* File upload section with styled button */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload PDF Document
        </label>
        <div className="flex items-center space-x-4">
          {/* Custom styled file input button */}
          <label className="cursor-pointer bg-blue-900 hover:bg-blue-950 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose PDF File
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange}
              className="hidden" // Hide the default file input
            />
          </label>
          
          {/* Clear button to remove current PDF */}
          {pdfUrl && (
            <button 
              onClick={() => {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
              }}
              className="bg-red-900 hover:bg-red-950 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Clear PDF
            </button>
          )}
        </div>
      </div>

      {/* Display PDF */}
      {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}

    </div>
  );
};

export default PdfReader;
