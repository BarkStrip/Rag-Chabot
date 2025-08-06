"use client";

import React from 'react';
import pdfToText from 'react-pdftotext'

interface TextExtractorProps {
  pdfUrl: string;
}

      // await fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      //   });

      /* 
        Text extraction attempt but pdfToText removes newlines
        pdfToText(file)
        .then(text => {
          console.log(text);
          console.log(text.split('\n')); })
        .catch(error => console.error("Failed to extract text from pdf"))*/

function extractText(file:File) {
    pdfToText(file)
        .then(text => console.log(text))
        .catch(error => console.error("Failed to extract text from pdf"))
}

const TextExtractor: React.FC<TextExtractorProps> = ({ pdfUrl }) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Extracted Text</h3>
      </div>
      <div className="w-full h-[80vh]">
        <h1 > () </h1>
      </div>
    </div>
  );
};

export default TextExtractor; 