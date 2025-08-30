// lib/llama.js
import axios from "axios";

/**
 * generateWithLLama(prompt) -> returns generated string
 * Adjust endpoint / API key as per your LLaMA provider.
 */
export async function generateWithLLama(prompt) {
  // Example: Ollama local HTTP API (adjust if different)
  try {
    // If you're using Ollama local: http://localhost:11434/api/generate
    // Or adapt for whichever llama endpoint you have.
    const url = process.env.LLAMA_ENDPOINT || "http://localhost:11434/api/generate";

    // Ollama expects model name in body or header depending on your set up.
    // Example payload for Ollama:
    const payload = {
      model: process.env.LLAMA_MODEL || "llama2", // change to your model
      prompt,
      max_tokens: 512,
      temperature: 0.2
    };

    const resp = await axios.post(url, payload, {
      timeout: 120000,
      headers: { "Content-Type": "application/json" },
    });

    // Adapt to response shape of your server
    // Ollama-style may return `resp.data`. Here, we'll try several common keys:
    const data = resp.data;
    if (typeof data === "string") return data;
    if (data?.output) return data.output;
    if (data?.text) return data.text;
    if (data?.generated_text) return data.generated_text;
    if (Array.isArray(data?.choices) && data.choices[0]?.text) return data.choices[0].text;

    return JSON.stringify(data).slice(0, 2000);
  } catch (err) {
    console.error("LLama call failed", err?.response?.data || err.message);
    throw new Error("LLama generation failed: " + (err.message || "unknown"));
  }
}
