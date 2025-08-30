// components/FontSelector.jsx
import React from "react";

export default function FontSelector({ onChange }) {
  const options = [
    { label: "Sans", cls: "font-sans" },
    { label: "Serif", cls: "font-serif" },
    { label: "Handwriting", cls: "font-handwriting" },
  ];

  return (
    <select onChange={(e)=>onChange(e.target.value)} className="border rounded px-2 py-1">
      {options.map((o)=> <option key={o.cls} value={o.cls}>{o.label}</option>)}
    </select>
  );
}
