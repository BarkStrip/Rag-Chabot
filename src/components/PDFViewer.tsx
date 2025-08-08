import React from "react";

type PdfViewerProps = {
    pdfUrl: string | null;
};

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
    if (!pdfUrl) return null;

    return (
        <embed
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="border-0"
        />
    );
};

export default PdfViewer;