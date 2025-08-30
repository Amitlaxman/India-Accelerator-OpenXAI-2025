// components/SignaturePad.jsx
import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

export default function SignaturePadComp({ getDataUrl }) {
  const canvasRef = useRef(null);
  const sigRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = 150 * devicePixelRatio;
    canvas.getContext("2d").scale(devicePixelRatio, devicePixelRatio);

    sigRef.current = new SignaturePad(canvas, { backgroundColor: "rgba(0,0,0,0)" });
  }, []);

  function saveSignature() {
    if (!sigRef.current) return;
    if (sigRef.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    const dataURL = sigRef.current.toDataURL("image/png");
    getDataUrl(dataURL);
    alert("Signature saved! It will be appended to the PDF.");
  }

  function clearSig() {
    sigRef.current?.clear();
    getDataUrl(null);
  }

  return (
    <div>
      <div className="w-full border rounded">
        <canvas ref={canvasRef} style={{ width: "100%", height: 150 }} />
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={saveSignature} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
        <button onClick={clearSig} className="px-3 py-1 rounded border">Clear</button>
      </div>
    </div>
  );
}
