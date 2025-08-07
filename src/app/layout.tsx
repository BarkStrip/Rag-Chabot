import { NextRequest } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

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

    const loader = new WebPDFLoader(fileBlob);
    const document = await loader.load();

    return Response.json({ document });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ error: error.message || "Unexpected error" }),
        { status: 500 }
      );
    }

  }
}