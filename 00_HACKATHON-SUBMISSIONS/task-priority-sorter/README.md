PrioritAI ✨

🎯 The Problem It Solves
In our daily lives, we're often faced with an overwhelming list of tasks, leading to decision paralysis. It's difficult to distinguish between what's truly important and what's just "noise." PrioritAI solves this by automating the prioritization process using the Eisenhower Matrix, allowing users to overcome procrastination and focus their energy on tasks that deliver the most impact.

✨ Features
AI-Powered Task Sorting: Leverages a local Llama 3 model via Ollama to analyze and categorize tasks into four priority levels.

Eisenhower Matrix Categories: Sorts tasks into "Urgent & Important," "Important, Not Urgent," "Urgent, Not Important," and "Not Urgent, Not Important."

Detailed Reasoning: The AI provides a brief justification for why each task was assigned its priority.

Dynamic & Animated UI: A beautiful, immersive landing page with an animated starfield background created with HTML5 Canvas.

Smooth Transitions: Features a "warp drive" effect and smooth scrolling for a polished user experience.

Responsive Design: A fully responsive interface that looks great on all devices.

📸 Screenshot
🛠️ Technologies Used
Frontend: Next.js (App Router), React, TypeScript

Styling: CSS Modules, Google Fonts (Plus Jakarta Sans)

Animation: HTML5 Canvas for the starfield effect

AI Model: Llama 3

Local AI Server: Ollama

Deployment: Vercel / Netlify

🧗 Challenges Faced
The primary challenge was ensuring consistent and valid JSON output from the Llama 3 model. The model would occasionally return malformed data or wrap the JSON in conversational text. This was overcome through:

Advanced Prompt Engineering: Iteratively refining the prompt to be extremely specific about the required output format.

Robust Backend Parsing: Implementing resilient backend logic to parse the AI's response, including fallbacks and specific error handling for malformed JSON.

⚙️ Getting Started (Local Development)
Follow these instructions to get the project running on your local machine.

Prerequisites
Node.js: v18.0 or later

Ollama: Make sure Ollama is installed and running on your machine. You can download it from ollama.com.

Installation
Pull the Llama 3 Model:
Open your terminal and run the following command to download the Llama 3 model:

ollama pull llama3

Clone the Repository:

git clone [https://github.com/your-username/prioritai.git](https://github.com/your-username/prioritai.git)
cd prioritai

Install Dependencies:

npm install

Run the Development Server:
Make sure Ollama is running in the background. Then, start the Next.js app:

npm run dev

Open the App:
Navigate to http://localhost:3000 in your browser to see the application.