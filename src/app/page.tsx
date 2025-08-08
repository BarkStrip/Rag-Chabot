"use client"; // Ensures this component runs on the client side (required for using React hooks in Next.js App Router)
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Dropdown from '../components/Dropdown'
import PdfViewer from "../components/PDFViewer"
import PdfTextViewer from "@/components/PdfTextViewer";
import PdfChunkViewer from '@/components/PdfChunkViewer';



const options = [
    { label: 'Embedded', value: 'View' },
    { label: 'Text', value: 'SeeText' },
    { label: 'Chunked', value: 'SeeChunk' },
];

const App: React.FC = () => {
    const [leftWidth, setLeftWidth] = useState<number>(33.33); // Start with 1/3 width
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null); // State to hold the URL of the uploaded PDF file
    const [textArray, setTextArray] = useState<unknown[] | null>(null);
    const [chunksArray, setChunksArray] = useState<unknown[] | null>(null);
    const [selectedView, setSelectedView] = useState<string>('View'); // default is 'Embedded'


    useEffect(() => {
        console.log("textArray changed:", textArray);
    }, [textArray]); // Runs when textArray changes

    const handleSelect = (value: string) => {
        console.log('You selected:', value);
        setSelectedView(value);
    };

    // Handles file selection from the input
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];


        // Only proceed if a PDF file is selected
        if (file && file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setTextArray(data.documents);
            setChunksArray(data.chunks);



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

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                console.log("Unmount cleanup: revoking blob URL");
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // Cleanup on tab close/reload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pdfUrl) {
                console.log("Before unload cleanup: revoking blob URL");
                URL.revokeObjectURL(pdfUrl);
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [pdfUrl]);

    // Define a type guard
    const isPdfWithContent = (item: unknown): item is { pageContent: string } => {
        return typeof item === 'object' &&
            item !== null &&
            'pageContent' in item &&
            typeof (item as { pageContent: unknown }).pageContent === 'string';
    };

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;

        // Calculate percentage, constrain between 10% and 90%
        const newLeftWidth = Math.min(Math.max((mouseX / containerWidth) * 100, 10), 90);
        setLeftWidth(newLeftWidth);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global mouse event listeners when dragging
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="w-full h-full bg-gray-800  overflow-hidden shadow-lg">
            <div
                ref={containerRef}
                className="flex h-full bg-gray-700"
            >
                {/* Left Panel */}
                <div
                    className="bg-gray-700 px-9 py-9 flex items-center justify-center border-r border-gray-600"
                    style={{ width: `${leftWidth}%` }}
                >

                    {/* Overlay to prevent embedded content from interfering with drag */}
                    {isDragging && (
                        <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent" />
                    )}

                    {/* Section 1 : File upload and display */}
                    <div className="w-full h-full bg-gray-700  ">
                        <div className="bg-gray-800 px-4 py-2">
                            <div className="mb-0">
                                <div className="flex items-center justify-between overflow-hidden">
                                    <Dropdown
                                        options={options}
                                        value={selectedView}
                                        onSelect={setSelectedView}
                                    />
                                    {/* Custom styled file input button */}
                                    <div className="flex items-center space-x-1">
                                        <label className="cursor-pointer text-sm bg-[#2c4875] hover:bg-[#233a5e] text-gray-200  py-1 px-2 rounded-sm transition-colors duration-20 inline-flex items-center">
                                            <svg className="w-5 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            New PDF
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
                                                    setTextArray(null)
                                                    setChunksArray(null)
                                                    setPdfUrl(null);
                                                }}
                                                className="text-sm bg-gray-600 hover:bg-gray-700  text-gray-200 py-1 px-2 rounded-sm transition-colors duration-20"
                                            >
                                                Clear PDF
                                            </button>
                                        )}
                                    </div>



                                </div>
                            </div>
                        </div>
                        <div className="w-full h-[80vh]">
                            {selectedView === 'View' && pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
                            {selectedView === "View" && (!pdfUrl) && (
                                <div className="p-4 text-gray-500 italic">Upload pdf to see embedded view.</div>
                            )}
                            {selectedView === "SeeText" &&
                                textArray &&
                                textArray.length > 0 &&
                                isPdfWithContent(textArray[0]) && (
                                    <PdfTextViewer
                                        pages={textArray.map((page) => ({
                                            pageContent: (page as { pageContent: string }).pageContent,
                                        }))}
                                    />


                                )}
                            {selectedView === "SeeText" && (!textArray || textArray.length === 0) && (
                                <div className="p-4 text-gray-500 italic">Upload pdf to see extracted text.</div>
                            )}
                            {selectedView === "SeeChunk" &&
                                chunksArray &&
                                chunksArray.length > 0 &&
                                isPdfWithContent(chunksArray[0]) && (
                                    <PdfChunkViewer
                                        chunks={chunksArray.map((chunk) => ({
                                            pageContent: (chunk as { pageContent: string }).pageContent,
                                        }))}
                                    />

                                )}

                            {selectedView === "SeeChunk" && (!chunksArray || chunksArray.length === 0) && (
                                <div className="p-4 text-gray-500 italic">Upload pdf to see content chunked.</div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Resizable Divider */}
                <div
                    className={`w-1 bg-gray-500 cursor-col-resize hover:bg-gray-400 transition-colors relative group ${isDragging ? 'bg-blue-400' : ''
                        }`}
                    onMouseDown={handleMouseDown}
                >
                    {/* Visual indicator */}
                    <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-400 group-hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Drag handle dots */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col space-y-1">
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div
                    className="bg-gray-700 px-9 py-9 flex items-center justify-center overflow-hidden"
                    style={{ width: `${100 - leftWidth}%` }}
                >
                    {/* Overlay to prevent content from interfering with drag */}
                    {isDragging && (
                        <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent" />
                    )}

                    {/* Section 2 :  Display ChatBot */}
                    <div className="w-full h-full overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 overflow-hidden">
                            <div className="text-xl font- text-gray-400 dark:text-gray-400">
                                Chat
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};



export default App;
