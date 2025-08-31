import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3",
        prompt: "Write a cover letter for a software engineer role."
      }),
      headers: { "Content-Type": "application/json" }
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
      const { done, value } = await reader!.read();
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
