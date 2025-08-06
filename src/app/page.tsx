"use client"; // Ensures this component runs on the client side (required for using React hooks in Next.js App Router)

import React, { useState } from 'react';


const App: React.FC = () => {
  // State to hold the URL of the uploaded PDF file
  const [pdfBlob, setPdfUrl] = useState<string | null>(null);

  // Handles file selection from the input
  const handleFileChange = async ( event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

      
    // Only proceed if a PDF file is selected
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append("pdf", file);

      // Clean up previous blob URL before assigning a new one
      if (pdfBlob) {
        URL.revokeObjectURL(pdfBlob);
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
    <div className="min-h-screen g-gray-700"> 
    <div className="flex space bg-gray-700 px-0 py-4">
        {/* Section 1 : File upload and display */}
        <div className="w-1/2 bg-gray-700 px-4 py-2 ">
            <div className="bg-gray-800 px-4 py-2">
                <div className="mb-0">
                    <div className="flex items-center justify-between">
                        <h1 className="mb-0 text-xl font-large text-gray-400 dark:text-gray-400">PDF Viewer</h1>
                        {/* Custom styled file input button */}
                        <div className="flex items-center space-x-1">
                            <label className="cursor-pointer text-sm bg-blue-900 hover:bg-blue-950 text-gray-200  py-1 px-3 rounded-sm transition-colors duration-20 inline-flex items-center">
                                <svg className="w-5 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            {pdfBlob && (
                            <button 
                                onClick={() => {
                                    URL.revokeObjectURL(pdfBlob);
                                    setPdfUrl(null);
                                }}
                                className="text-sm bg-red-900 hover:bg-red-950 text-gray-200 py-1 px-3 rounded-sm transition-colors duration-20"
                                >
                                Clear PDF
                            </button>
                            )}
                        </div>

                        

                    </div>
                </div>
            </div>
            <div className="w-full h-[80vh]">
            {pdfBlob && (
            <embed
                src={pdfBlob}
                type="application/pdf"
                width="100%"
                height="100%"
                className="border-0"
            />
            )}
            </div>
        </div>
        {/* Section 2 :  Display ChatBot */}
        <div className="w-1/2 bg-gray-700 px-4 py-2">
            <div className="bg-gray-800 px-4 py-2">
                <h1 className="text-xl font-large text-gray-400 dark:text-gray-400">Chat</h1>
            </div>
            <div className="w-full h-[80vh]">
                PlaceHolderText
            </div>
        </div>
        
        
    </div>
    </div>
  );
};

export default App;
