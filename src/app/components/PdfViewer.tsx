"use client";

import React from 'react';

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Viewer</h3>
      </div>
      <div className="w-full h-[80vh]">
        <embed
          src={pdfUrl}               // Source is the object URL of the uploaded file
          type="application/pdf"     // MIME type
          width="100%"               // Full width
          height="100%"              // Full height of container
          className="border-0"       // Remove default border
        />
      </div>
    </div>
  );
};

export default PdfViewer; 