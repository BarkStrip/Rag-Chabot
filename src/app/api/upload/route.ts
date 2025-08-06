import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

// Required to avoid Next.js from parsing the request body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseFormData(req);

    const file = files.pdf?.[0];
    if (!file || !file.filepath) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const extractedText = await extractTextWithPdftotext(file.filepath);

    // Clean up the temp file
    await fs.unlink(file.filepath);

    return NextResponse.json({ text: extractedText });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}

// --------------------------
// 📦 Parse FormData using formidable
function parseFormData(req: NextRequest): Promise<{ fields: any; files: any }> {
  const form = new IncomingForm({
    uploadDir: os.tmpdir(), // Save files to temp directory
    keepExtensions: true,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// --------------------------
// 🧠 Run pdftotext -layout
async function extractTextWithPdftotext(filePath: string): Promise<string> {
  const cmd = `pdftotext -layout "${filePath}" -`; // Output to stdout
  const { stdout } = await execAsync(cmd);
  return stdout;
}