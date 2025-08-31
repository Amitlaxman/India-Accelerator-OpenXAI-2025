// File: app/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';

// Define the structure for the task object we'll receive from the API
interface PrioritizedTask {
  task: string;
  priority: 'Urgent & Important' | 'Important, Not Urgent' | 'Urgent, Not Important' | 'Not Urgent, Not Important';
  reason: string;
}

// A mapping to get colors for different priorities
const priorityColors: { [key: string]: string } = {
  'Urgent & Important': 'var(--p1-color)',
  'Important, Not Urgent': 'var(--p2-color)',
  'Urgent, Not Important': 'var(--p3-color)',
  'Not Urgent, Not Important': 'var(--p4-color)',
};

export default function Home() {
  const [tasksInput, setTasksInput] = useState('');
  const [prioritizedTasks, setPrioritizedTasks] = useState<PrioritizedTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePrioritize = async () => {
    if (!tasksInput.trim()) {
      setError('Please enter some tasks to prioritize.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPrioritizedTasks([]);

    try {
      const response = await axios.post<PrioritizedTask[]>('/api/prioritize', {
        tasks: tasksInput,
      });

      // --- FIX IS HERE ---
      // Check if the response data is an array before setting the state
      if (Array.isArray(response.data)) {
        setPrioritizedTasks(response.data);
      } else {
        // If it's not an array, it's an unexpected response. Treat it as an error.
        setError('The AI returned an invalid format. Please try again.');
        console.error("API did not return an array:", response.data);
      }
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main>
      <h1>✨ Task Priority Sorter</h1>
      <p>Let AI organize your to-do list by urgency and importance.</p>

      <textarea
        value={tasksInput}
        onChange={(e) => setTasksInput(e.target.value)}
        placeholder="Enter your tasks, one per line...&#10;e.g.&#10;Finish hackathon project report&#10;Book flight tickets for vacation&#10;Reply to non-urgent emails&#10;Watch the new season of that show"
        disabled={isLoading}
      />

      <button onClick={handlePrioritize} disabled={isLoading}>
        {isLoading ? 'Prioritizing...' : 'Prioritize Tasks'}
      </button>

      {error && <p style={{ color: 'var(--p1-color)', marginTop: '1rem' }}>{error}</p>}

      <div className="task-list">
        {prioritizedTasks.map((item, index) => (
          <div
            key={index}
            className="task-card"
            style={{ borderLeftColor: priorityColors[item.priority] }}
          >
            <h3>{item.task}</h3>
            <p style={{ color: priorityColors[item.priority] }}>{item.priority}</p>
            <p style={{ color: '#a0a0a0', fontStyle: 'italic', marginTop: '0.5rem' }}>"{item.reason}"</p>
          </div>
        ))}
      </div>
    </main>
  );
}