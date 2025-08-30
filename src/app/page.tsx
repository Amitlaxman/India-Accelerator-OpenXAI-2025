"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { jsPDF } from "jspdf";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Paste job description and upload resume to generate cover letter...</p>",
    immediatelyRender: false, // 🚀 FIX: prevents SSR hydration issues
  });

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/generate-cover", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (editor && data.coverLetter) {
      editor.commands.setContent(data.coverLetter);
    }
  };

  const handleDownload = () => {
    if (!editor) return;
    const doc = new jsPDF();
    doc.text(editor.getText(), 10, 10);
    doc.save("cover_letter.pdf");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cover Letter Generator</h1>

      <form onSubmit={handleGenerate} className="space-y-4">
        <textarea
          name="jobDesc"
          placeholder="Paste job description here..."
          className="w-full border rounded p-2"
          required
        />

        <input type="file" name="resume" accept="application/pdf" required />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      </form>

      <div className="border rounded p-4 bg-white shadow">
        {editor && <EditorContent editor={editor} />}
      </div>

      <button
        onClick={handleDownload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Download as PDF
      </button>
    </div>
  );
}
