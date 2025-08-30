// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    const { html, signature, fontClass } = await req.json();

    const documentHTML = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: Arial, sans-serif; padding: 48px; color: #111827; }
            .font-sans { font-family: 'Inter', Arial, sans-serif; }
            .font-serif { font-family: 'Georgia', 'Times New Roman', serif; }
            .font-handwriting { font-family: 'Dancing Script', cursive; }
            p { margin: 0 0 10px 0; line-height: 1.45; }
            .signature { margin-top: 30px; }
            img.signature-img { max-width: 200px; height: auto; }
          </style>
        </head>
        <body class="${fontClass || "font-sans"}">
          <div id="content">
            ${html}
            ${signature ? `<div class="signature"><img class="signature-img" src="${signature}" /></div>` : ""}
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(documentHTML, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ 
      format: "A4", 
      printBackground: true, 
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" } 
    });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
      },
    });

  } catch (err: any) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed", details: err.message }, { status: 500 });
  }
}
