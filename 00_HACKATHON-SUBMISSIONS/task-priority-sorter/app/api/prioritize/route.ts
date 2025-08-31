// File: app/api/prioritize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { tasks } = await req.json();

  if (!tasks || typeof tasks !== 'string' || tasks.trim() === '') {
    return NextResponse.json({ error: 'Task list cannot be empty.' }, { status: 400 });
  }

  // The prompt is good. The issue is in how we parse the response.
  const prompt = `
    You are an expert productivity assistant. Your task is to analyze a list of tasks and categorize them using the Eisenhower Matrix.
    Your response MUST be a single, valid JSON object with a key named "tasks", which contains an array of task objects.

    For each task object in the array, you MUST provide three keys:
    1. "task": The original task name.
    2. "priority": This MUST be one of the following four specific strings:
        - "Urgent & Important"
        - "Important, Not Urgent"
        - "Urgent, Not Important"
        - "Not Urgent, Not Important"
    3. "reason": A brief, non-empty string (around 10-15 words) explaining WHY you chose that priority.

    Here is a perfect example of the required output format:
    {
      "tasks": [
        {
          "task": "Prepare for tomorrow's client meeting",
          "priority": "Urgent & Important",
          "reason": "This has an immediate deadline and is crucial for business success."
        }
      ]
    }

    Now, process the following tasks:
    ---
    ${tasks}
    ---
  `;

  try {
    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt: prompt,
      stream: false,
      format: 'json',
    });

    const rawResponse = ollamaResponse.data.response;
    console.log("--- Raw AI Response ---");
    console.log(rawResponse);
    console.log("-----------------------");
    
    // --- FINAL FIX: PARSE THE OBJECT AND EXTRACT THE ARRAY ---
    try {
      const parsedData = JSON.parse(rawResponse);

      // Check if the data is an object AND has a 'tasks' property that is an array.
      if (parsedData && Array.isArray(parsedData.tasks)) {
        // Success! This is the format we're getting. Return the nested array.
        return NextResponse.json(parsedData.tasks);
      }
      // Add a fallback in case the AI ever sends a raw array correctly.
      else if (Array.isArray(parsedData)) {
        return NextResponse.json(parsedData);
      }
      else {
        console.error("Parsed JSON is not in the expected format { tasks: [...] }.");
        return NextResponse.json({ error: "AI returned valid JSON, but it was missing the expected 'tasks' array." }, { status: 500 });
      }
    } catch (parseError) {
      console.error('Failed to parse the response as JSON:', parseError);
      return NextResponse.json({ error: 'The AI returned a non-JSON response.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error connecting to Ollama:', error);
    return NextResponse.json({ error: 'Failed to connect to the AI model. Is Ollama running?' }, { status: 500 });
  }
}