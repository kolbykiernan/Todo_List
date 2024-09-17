// components/TaskDetails.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function TaskDetails({ task, onClose, onSave }) {
  const [taskName, setTaskName] = useState(task.name);
  const [notes, setNotes] = useState(task.notes || '');
  const [repeatFrequency, setRepeatFrequency] = useState({ number: 1, period: 'Never' });
  const [status, setStatus] = useState(task.status || 'Todo');
  const [priority, setPriority] = useState(task.priority || 'Low');

  const handleSave = () => {
    onSave({
      ...task,
      name: taskName,
      notes,
      repeatFrequency,
      status,
      priority,
    });
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Close if the clicked element is the overlay itself (outside the modal)
    if (e.target.id === 'overlay') {
      onClose();
    }
  };

  return (
    <div
      id="overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
      onClick={handleOverlayClick}
    >
        <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ duration: 1 }} 
            className="bg-white w-2/3 h-3/4 p-4 shadow-lg overflow-auto fixed bottom-0 right-0"
        >
            <button className="absolute top-2 right-2 text-black" onClick={onClose}>x</button>
                <h2 className="text-4xl font-bold mb-4 ml-2 mt-2">
                <input 
                    type="text" 
                    value={taskName} 
                    onChange={(e) => setTaskName(e.target.value)} 
                    className="w-full border-b-2 outline-none"
                />
                </h2>
            <div>
                <label className="block font-semibold mb-2">Notes:</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-2 border mb-4"
                />
            </div>
            <div>
                <label className="block font-semibold mb-2">Repeats:</label>
                <div className="flex items-center mb-4">
                    <input 
                    type="number" 
                    min="1" 
                    value={repeatFrequency.number} 
                    onChange={(e) => setRepeatFrequency({ ...repeatFrequency, number: e.target.value })} 
                    className="border p-1 w-16 mr-2"
                    />
                    <select 
                    value={repeatFrequency.period} 
                    onChange={(e) => setRepeatFrequency({ ...repeatFrequency, period: e.target.value })}
                    className="border p-1"
                    >
                    <option value="Never">Never</option>
                    <option value="Day">Day</option>
                    <option value="Week">Week</option>
                    <option value="Month">Month</option>
                    <option value="Year">Year</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block font-semibold mb-2">Status:</label>
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-1 w-full mb-4"
                >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            </div>
            <div>
                <label className="block font-semibold mb-2">Priority:</label>
                <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="border p-1 w-full mb-4"
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div className="flex justify-between fixed bottom-10">
                <button className="bg-red-500 text-white p-2 ml-4 mr-8 rounded" onClick={() => onSave(null)}>Delete Task</button>
                <button className="bg-blue-500 text-white p-2 pl-6 pr-6 rounded" onClick={handleSave}>Save</button>
            </div>
        </motion.div>
    </div>
  );
}
