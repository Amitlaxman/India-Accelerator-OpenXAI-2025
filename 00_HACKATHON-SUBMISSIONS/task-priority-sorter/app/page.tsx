// File: app/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import Starfield from '../components/Starfield';

interface PrioritizedTask {
    task: string;
    priority: 'Urgent & Important' | 'Important, Not Urgent' | 'Urgent, Not Important' | 'Not Urgent, Not Important';
    reason: string;
}

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
  const [isHeroExiting, setIsHeroExiting] = useState(false);

  const handlePrioritize = async () => {
    if (!tasksInput.trim()) {
      setError('Please enter some tasks to prioritize.');
      return;
    }
    setIsLoading(true);
    setError('');
    setPrioritizedTasks([]);
    try {
      const response = await axios.post<PrioritizedTask[]>('/api/prioritize', { tasks: tasksInput });
      if (Array.isArray(response.data)) {
        setPrioritizedTasks(response.data);
      } else {
        setError('The AI returned an invalid format. Please try again.');
        console.error("API did not return an array:", response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStartedClick = () => {
  // 1. Start the fast "warp drive" animation
  setIsHeroExiting(true);

  // 2. After a short delay, start scrolling down to the app
  setTimeout(() => {
    document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
  }, 700); // This delay lets the animation play for a bit

  // 3. After a longer delay (when the scroll is likely finished),
  //    set isExiting back to false. This returns the stars to their
  //    normal, slow drift state in the background.
  setTimeout(() => {
    setIsHeroExiting(false);
  }, 1500); // Adjust this duration if your scroll feels longer or shorter
};

  return (
    <>
      <section className="hero-section">
        <Starfield isExiting={isHeroExiting} />

        {/* --- NEW: hero-content-backdrop div --- */}
        <div className="hero-content-backdrop">
          <h1>PrioritAI✨</h1>
          <p>
            Stop guessing. Start doing. Let our intelligent AI analyze your to-do list and organize it by urgency and importance, so you can focus on what truly matters.
          </p>
          <button onClick={handleGetStartedClick} className="cta-button">
            Prioritize My Tasks
          </button>
        </div>
      </section>

      <section id="app-section" className="app-section">
        <h2>Enter Your Tasks</h2>
        <p className="subtitle">Let AI organize your to-do list in seconds.</p>
        <textarea
          value={tasksInput}
          onChange={(e) => setTasksInput(e.target.value)}
          placeholder="Enter your tasks, one per line..."
          disabled={isLoading}
        />
        <button onClick={handlePrioritize} disabled={isLoading} className="prioritize-button">
          {isLoading ? 'Prioritizing...' : 'Get AI-Sorted List'}
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
      </section>
    </>
  );
}