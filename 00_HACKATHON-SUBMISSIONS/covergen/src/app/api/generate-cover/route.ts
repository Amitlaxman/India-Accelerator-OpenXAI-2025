import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;

    const formData = await req.formData();
    const file = formData.get("resume") as File; // 👈 keep "resume"

    if (!file) {
      return NextResponse.json({ error: "Resume file missing" }, { status: 400 });
    }

    // Convert uploaded File → Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from resume
    const data = await pdf(buffer);
    const resumeText = data.text || "";

    // Get job description
    const jobDesc = formData.get("jobDesc") as string;
    if (!jobDesc) {
      return NextResponse.json({ error: "Job description missing" }, { status: 400 });
    }

    // Build prompt for Ollama
    const prompt = `
You are an assistant that writes professional cover letters.
Use the following job description and resume to generate a personalized cover letter:

Job Description:
${jobDesc}

Resume:
${resumeText}

Format the cover letter properly with:
- Applicant name at top
- Business letter format (date, address, greeting, body, closing)
- End with "Sincerely," + applicant name
`;

    // Call Ollama API
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mistral:7b-instruct",
        prompt,
      }),
    });

    if (!response.ok || !response.body) {
      const errMsg = await response.text();
      console.error("Ollama error:", errMsg);
      return NextResponse.json({ error: "Ollama failed" }, { status: 500 });
    }

    // Stream Ollama JSON output
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n").filter((l) => l.trim())) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            result += parsed.response;
          }
        } catch {
          // Ignore non-JSON lines
        }
      }
    }

    return NextResponse.json({ coverLetter: result.trim() });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
