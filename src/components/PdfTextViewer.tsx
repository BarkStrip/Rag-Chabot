import React, { useState, useMemo, useRef, useEffect } from "react";

type PdfPage = {
    pageContent: string;
};

type PdfTextViewerProps = {
    pages: PdfPage[];
};

export default function PdfTextViewer({ pages }: PdfTextViewerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const filteredPages = useMemo(() => {
        if (!searchTerm.trim()) return pages;
        return pages.map((page) => ({
            pageContent: highlightMatches(page.pageContent, searchTerm),
        }));
    }, [pages, searchTerm]);

    // Calculate total matches
    const totalMatches = useMemo(() => {
        if (!searchTerm.trim()) return 0;
        return filteredPages.reduce((count, page) => {
            const matches = (page.pageContent.match(/<mark /g) || []).length;
            return count + matches;
        }, 0);
    }, [filteredPages, searchTerm]);

    if (!pages || pages.length === 0) {
        return <div className="text-gray-500 p-4">No pages to display.</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search bar & match count */}
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Search text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 text-sm rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                    <div className="text-gray-300 text-sm">
                        Matches found: {totalMatches}
                    </div>
                )}
            </div>

            {/* PDF pages */}
            <div className="overflow-auto flex-1 space-y-6">
                {filteredPages.map((page, idx) => (
                    <div key={idx} className="relative">
                        {/* Sticky header */}
                        <div className="sticky top-0 bg-gray-800/90 py-1 px-2 z-10 border-b border-gray-700">
                            <h3 className="text-gray-400 font-semibold text-sm">
                                Page {idx + 1}
                            </h3>
                        </div>

                        {/* Page text with top padding to avoid overlap */}
                        <div
                            className="pt-8 text-sm text-gray-200 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: page.pageContent,
                            }}
                        />

                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Highlight matching search terms in text.
 */
function highlightMatches(text: string, term: string) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
    return text.replace(
        regex,
        `<mark class="bg-blue-500 text-black">$1</mark>`
    );
}

/**
 * Escape regex special characters in search term.
 */
function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
