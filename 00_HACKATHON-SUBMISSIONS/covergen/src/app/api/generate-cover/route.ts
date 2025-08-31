declare module "pdf-parse/lib/pdf-parse.js" {
  import { Buffer } from "buffer";

  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    text: string;
    version: string;
  }

  function pdf(buffer: Buffer | Uint8Array, options?: any): Promise<PDFInfo>;

  export default pdf;
}
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("resume") as File;
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
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mistral:7b-instruct",
        prompt
      }),
      headers: { "Content-Type": "application/json" }
    });

    // Handle fetch errors before reading stream
    if (!response.ok || !response.body) {
      const errMsg = await response.text();
      console.error("Ollama error:", errMsg);
      return NextResponse.json({ error: "Ollama failed" }, { status: 500 });
    }

    // Stream response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            result += parsed.response;
          }
        } catch (err) {
          console.error("Failed to parse line:", line, err);
        }
      }
    }

    return NextResponse.json({ coverLetter: result.trim() });

  } catch (err) {
    console.error("Error generating cover letter:", err);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
