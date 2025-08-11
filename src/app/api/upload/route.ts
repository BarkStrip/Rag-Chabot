import { NextRequest } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: "application/pdf" });

    // Load the PDF document
    const loader = new WebPDFLoader(fileBlob);
    const documents = await loader.load(); // This returns an array of Document objects

    // Instantiate the text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,     // Max number of characters per chunk (default is 1000)
      chunkOverlap: 200,  // Number of characters each chunk overlaps with the previous (default is 200)
      separators: ["\n\n", "\n", " ", ""], // Hierarchy of separators to split on (default)
    });

    // Split the documents into chunks
    const chunks = await textSplitter.splitDocuments(documents);

    // Return chunk texts (or you could return metadata or length)
    return Response.json({ documents, chunks });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message || "Unexpected error" }),
        { status: 500 }
      );
    }
  }
}
