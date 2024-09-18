// components/TaskDetails.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function TaskDetails({ task, onClose, onSave }) {
  const [taskName, setTaskName] = useState(task.name);
  const [notes, setNotes] = useState(task.notes || '');
  const [repeatFrequency, setRepeatFrequency] = useState({ number: 0, period: 'Never' });
  const [priority, setPriority] = useState(task.priority || 'Low');

  const handleSave = () => {
    onSave({
      ...task,
      name: taskName,
      notes,
      repeatFrequency,
      priority,
    });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'overlay') {
      onClose();
    }
  };

  return (
    <div
      id="overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: 0 }} 
        exit={{ x: '100%' }} 
        transition={{ duration: 0.5 }} 
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-auto p-6 m-4 overflow-auto"
      >
        <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl" onClick={onClose}>×</button>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            <input 
              type="text" 
              value={taskName} 
              onChange={(e) => setTaskName(e.target.value)} 
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none"
              placeholder="Task Name"
            />
          </h2>
          <div className="mb-6">
            <label className="block font-medium mb-2">Notes:</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200"
              placeholder="Add your notes here..."
            />
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">Repeats:</label>
            <div className="flex items-center">
              <input 
                type="number" 
                min="1" 
                value={repeatFrequency.number} 
                onChange={(e) => setRepeatFrequency({ ...repeatFrequency, number: e.target.value })} 
                className="border border-gray-300 p-1 w-16 mr-2 rounded-lg focus:ring focus:ring-blue-200"
              />
              <select 
                value={repeatFrequency.period} 
                onChange={(e) => setRepeatFrequency({ ...repeatFrequency, period: e.target.value })}
                className="border border-gray-300 p-2 rounded-lg focus:ring focus:ring-blue-200"
              >
                <option value="Never">Never</option>
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">Priority:</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full focus:ring focus:ring-blue-200"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex justify-between mt-8">
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
              onClick={() => onSave(null)}
            >
              Delete Task
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-300"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
