import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jobDesc = formData.get("jobDesc") as string;
    const resumeFile = formData.get("resume") as File;

    if (!jobDesc || !resumeFile) {
      return NextResponse.json({ error: "Missing job description or resume" }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const resumeText = buffer.toString("utf-8"); // quick fallback (you can still use pdf-parse if needed)

    const prompt = `
Generate a professional cover letter based on this job description and resume:

Job Description:
${jobDesc}

Resume:
${resumeText}
    `;

    // 🔹 Call Ollama REST API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1", // change if using mistral/gemma/etc
        prompt,
      }),
    });

    // Ollama streams text, but we’ll grab full text
    const data = await response.json();

    return NextResponse.json({ coverLetter: data.response });
  } catch (err) {
    console.error("Error generating cover letter:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
