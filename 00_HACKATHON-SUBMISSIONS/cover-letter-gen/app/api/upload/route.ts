// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { generateWithLLama } from "../../../lib/llama";

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "/uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

function parseForm(req: NextRequest) {
  const form = new formidable.IncomingForm({ uploadDir: UPLOAD_DIR, keepExtensions: true });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req);
    const resumeFile = (files as any).resume;
    if (!resumeFile) return NextResponse.json({ error: "No resume uploaded" }, { status: 400 });

    const data = fs.readFileSync(resumeFile.filepath);
    const parsed = await pdfParse(data);
    const resumeText = parsed.text || "";

    const jobdesc = fields.jobdesc || fields.jobDesc || "";

    const prompt = `
You are an assistant that writes short, professional cover letters tailored to a job posting.
Resume:
${resumeText}

Job description:
${jobdesc}

Generate a polite, concise cover letter addressed to the hiring manager. Keep it under 400 words. Include: 1) opening sentence referencing role, 2) 2-3 lines connecting experience to role, 3) closing.
Return the letter as plain text (no additional commentary).
`;

    const generated = await generateWithLLama(prompt);
    const simpleHTML = `<div><p>${generated.replace(/\n/g, "</p><p>")}</p></div>`;

    return NextResponse.json({ generated: simpleHTML, raw: generated });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
