// components/CoverEditor.jsx
import React, { forwardRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const CoverEditor = forwardRef(({ initialContent }, ref) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "<p></p>",
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent]);

  // expose a simple API to parent via ref
  React.useImperativeHandle(ref, () => ({
    getHTML: () => editor.getHTML(),
    getText: () => editor.getText(),
  }));

  return <EditorContent editor={editor} />;
});

CoverEditor.displayName = "CoverEditor";
export default CoverEditor;
