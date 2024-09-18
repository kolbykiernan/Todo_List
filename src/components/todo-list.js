import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './sortable';
import { Droppable } from './droppable';
import { TaskDetails } from './task-details';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { AnimatePresence } from 'framer-motion';

export default function TodoList() {
  // Get the window size to use with the Confetti component
  const { width, height } = useWindowSize();
  
  // State to hold the name of a new task to be created
  const [taskName, setTaskName] = useState('');
  
  // Function to get initial tasks, either from localStorage or use default values
  const initialTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks && typeof savedTasks === 'object') {
      const isCorrectFormat = Object.values(savedTasks).every(column => 
        Array.isArray(column) && column.every(task => task && task.id && task.name)
      );
  
      if (isCorrectFormat) {
        return savedTasks; // Use tasks from localStorage if in correct format
      }
    }
    // Default tasks if nothing in localStorage or incorrect format
    return {
      todo: [
        { id: '1', name: 'Meet with Brandon to review project', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '2', name: 'Switch to my MacBook Pro', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' }
      ],
      inProgress: [
        { id: '3', name: 'Connect Stripe to Ecomm Ruby Project', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '4', name: 'Submit Take-Home Project', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' }
      ],
      done: [
        { id: '5', name: 'Interview with Jonathan', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '6', name: 'Interview with Brandon', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '7', name: 'Meeting with Brandon & Aisha', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '8', name: 'Interview with Katie', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' },
        { id: '9', name: 'Interview with Ani', notes: '', repeatFrequency: { number: 0, period: 'Never' }, priority: 'Low' }
      ],
    };
  };
  
  // State to hold tasks, initializing with `initialTasks` function
  const [tasks, setTasks] = useState(initialTasks);
  // State to hold the currently active task being dragged
  const [activeId, setActiveId] = useState(null);
  // State to control the display of confetti when a task is marked done
  const [showConfetti, setShowConfetti] = useState(false);
  // State to hold the currently selected task for editing
  const [selectedTask, setSelectedTask] = useState(null);

  // Labels for the columns
  const columnLabels = {
    todo: 'Todo',
    inProgress: 'In Progress',
    done: 'Done',
  };

  // Effect to load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks && typeof savedTasks === 'object') {
      const isCorrectFormat = Object.values(savedTasks).every(column => 
        Array.isArray(column) && column.every(task => task && task.id && task.name)
      );
      
      if (isCorrectFormat) {
        setTasks(savedTasks);
      } else {
        localStorage.removeItem('tasks');
      }
    }
  }, []);

  // Effect to update localStorage whenever `tasks` state changes
  useEffect(() => {
    console.log('Updating localStorage:', tasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Set up sensors for drag-and-drop using the PointerSensor
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Function to create a new task and initialize it properties
  const onCreateTask = () => {
    if (taskName.trim()) {
      const newTask = {
        id: Date.now().toString(), 
        name: taskName,
        notes: '',
        repeatFrequency: { number: 0, period: 'Never' },
        priority: 'Low'
      };
      setTasks((existingTasks) => ({
        ...existingTasks,
        todo: [...existingTasks.todo, newTask], // Adds task to "todo" column
      }));
      setTaskName(''); 
    }
  };

  // Function called when drag starts
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Function called when drag ends
  const handleDragEnd = (event) => {
    const { active, over } = event;
  
    if (!over) {
      setActiveId(null);
      return;
    }
  
    const fromColumn = active.data.current?.droppableId;
    const toColumn = over.data.current?.droppableId;
  
    if (!fromColumn || !toColumn) {
      setActiveId(null);
      return;
    }

    // Update the tasks state to reflect the drag and drop
    setTasks((existingTasks) => {
      // Remove the task from the origin column
      let updatedFromColumn = existingTasks[fromColumn].filter(
        (task) => task.id !== active.id
      );

      let updatedToColumn;
      
      if (fromColumn === toColumn) {
        // Reorder tasks within the same column
        updatedToColumn = arrayMove(
          existingTasks[toColumn],
          existingTasks[toColumn].findIndex(task => task.id === active.id),
          existingTasks[toColumn].findIndex(task => task.id === over.id)
        );
      } else {
        // Move task to a different column
        let insertionIndex = existingTasks[toColumn].findIndex(task => task.id === over.id);
        if (insertionIndex === -1) {
          insertionIndex = existingTasks[toColumn].length;
        }

        updatedToColumn = [
          ...existingTasks[toColumn].slice(0, insertionIndex),
          existingTasks[fromColumn].find(task => task.id === active.id),
          ...existingTasks[toColumn].slice(insertionIndex),
        ];

        // Show confetti if task is moved to "done"
        if (toColumn === 'done') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000); 
        }
      }

      return {
        ...existingTasks,
        [fromColumn]: updatedFromColumn,
        [toColumn]: updatedToColumn,
      };
    });

    setActiveId(null);
  };

  // Open the task details overlay for editing
  const openTaskDetails = (task, columnId) => {
    setSelectedTask({ ...task, columnId });
  };

  // Save the task details after editing
  const saveTaskDetails = (updatedTask) => {
    setTasks((existingTasks) => {
      const updatedTasks = { ...existingTasks };
      const columnId = updatedTask.columnId;
  
      if (updatedTasks[columnId]) {
        // Find the index of the task to be updated
        const taskIndex = updatedTasks[columnId].findIndex(task => task.id === updatedTask.id);
        if (taskIndex > -1) {
          // Replace the old task with the updated task
          updatedTasks[columnId][taskIndex] = { ...updatedTasks[columnId][taskIndex], ...updatedTask };
        }
      }
  
      console.log('New tasks state after update:', updatedTasks);
      return updatedTasks;
    });
    setSelectedTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 bg-yellow-50 min-h-screen flex justify-center items-center">
        <div className="max-w-5xl w-full">
          <h2 className="text-3xl font-semibold mb-8 text-center">Todo List</h2>
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              className="p-2 border border-gray-300 rounded w-1/2"
            />
            <button
              onClick={onCreateTask}
              className="ml-2 p-2 bg-blue-500 text-white rounded"
            >
              Add Task
            </button>
          </div>

          {/* Render tasks in columns using Droppable and SortableContext components */}
          <div className="flex space-x-6 h-screen mt-10">
          {Object.entries(tasks).map(([columnId, items]) => (
            <Droppable 
              key={columnId} 
              id={columnId} 
              taskCount={items ? items.length : 0} 
              label={columnLabels[columnId]}
            >
              <SortableContext 
                items={items ? items.map(task => task.id) : []} 
                strategy={verticalListSortingStrategy}
              >
                {items && items.map((task, index) => (
                  <SortableItem 
                    key={task.id} 
                    id={task.id} 
                    index={index} 
                    droppableId={columnId}
                    task={task}
                  >
                    <div onClick={() => openTaskDetails(task, columnId)}> 
                      {task.name}
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </Droppable>
          ))}
          </div>
        </div>
        {showConfetti && <Confetti width={width} height={height} />}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetails 
              task={selectedTask} 
              columnId={selectedTask.columnId}
              onClose={() => setSelectedTask(null)} 
              onSave={saveTaskDetails} 
            />
          )}
        </AnimatePresence>
        <DragOverlay>
          {activeId ? (
            (() => {
              let draggedTask;
              for (const column of Object.values(tasks)) {
                draggedTask = column.find(task => task.id === activeId);
                if (draggedTask) break;
              }
              return draggedTask ? (
                <div className="p-2 bg-yellow-200 rounded">{draggedTask.name}</div>
              ) : null;
            })()
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
