// src/app/api/generate-cover/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("resume") as File | null;
    const jobDesc = formData.get("jobDesc") as string;

    let resumeText = "";

    if (file && file.type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      resumeText = pdfData.text;
    }

    // Call Ollama
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: `Write a professional cover letter based on the following job description:\n\n${jobDesc}\n\nAnd this resume:\n\n${resumeText}`,
      }),
    });

    const ollamaData = await ollamaRes.json();

    return NextResponse.json({ coverLetter: ollamaData.response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
