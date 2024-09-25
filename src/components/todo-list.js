import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, rectIntersection } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './sortable';
import { Droppable } from './droppable';
import { TaskDetails } from './task-details';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { AnimatePresence } from 'framer-motion';

export default function TodoList() {
  const { width, height } = useWindowSize();
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState({
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
  });
  const [activeId, setActiveId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const columnLabels = {
    todo: 'Todo',
    inProgress: 'In Progress',
    done: 'Done',
  };

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks) {
      setTasks(savedTasks);
    }
  }, []);

  // Save tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Defined sensor with useSensor hook
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Function to create a new task
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
        todo: [...existingTasks.todo, newTask],
      }));
      setTaskName('');
    }
  };

  // Function to set activeId state when a task is dragged
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Function to handle when a task is dropped
 const handleDragEnd = (event) => {
  const { active, over } = event;

    if (!over) {
        setActiveId(null);
        return;
    }

    const fromColumn = active.data.current?.droppableId;
    const toColumn = over.data.current?.droppableId || over.id;

    // Update the tasks state
    setTasks((existingTasks) => {
        // Ensure both fromColumn and toColumn are defined and that existingTask are arrays
        if (!fromColumn || !toColumn || !Array.isArray(existingTasks[fromColumn]) || !Array.isArray(existingTasks[toColumn])) {
            setActiveId(null);
            return existingTasks; // Return current state if validation fails
        }

        //removes active task from fromColumn
        let updatedFromColumn = existingTasks[fromColumn].filter(
            (task) => task.id !== active.id
        );

        //defining updatedToColumn which determines how task should be moved into column
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
            const draggedTask = existingTasks[fromColumn].find(task => task.id === active.id);
            let insertionIndex = existingTasks[toColumn].findIndex(task => task.id === over.id);

            // If the task is dropped within a column without proximity to another task, add it to the end
            if (insertionIndex === -1) {
                updatedToColumn = [
                    ...existingTasks[toColumn],
                    draggedTask,
                ];
            } else {
                updatedToColumn = [
                    ...existingTasks[toColumn].slice(0, insertionIndex),
                    draggedTask,
                    ...existingTasks[toColumn].slice(insertionIndex),
                ];
            }
        }

    // Show confetti if moved to "Done" column
    if (toColumn === 'done') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    return {
      ...existingTasks,
      [fromColumn]: updatedFromColumn,
      [toColumn]: updatedToColumn,
    };
  });

  setActiveId(null);
};

  // Function to open task details
  const openTaskDetails = (task, columnId) => {
    setSelectedTask({ ...task, columnId });
  };

  // Function to save task details
  const saveTaskDetails = (updatedTask) => {
    if (!updatedTask) {
      // Delete the selected task
      setTasks((existingTasks) => {
        const columnId = selectedTask.columnId; // Use selectedTask to get the columnId of the task to be deleted
        const updatedTasks = { ...existingTasks };
        
        // Remove the task from the relevant column
        updatedTasks[columnId] = updatedTasks[columnId].filter(task => task.id !== selectedTask.id);
  
        console.log('Task deleted, new tasks state:', updatedTasks);
        return updatedTasks;
      });
  
      setSelectedTask(null);
      return; // Exit the function early since the task is deleted
    }
    
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
      collisionDetection={rectIntersection} // Use rectIntersection for better drop detection in empty columns
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
                taskCount={items.length}
                label={columnLabels[columnId]}
              >
                <SortableContext
                  items={items.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((task, index) => (
                    <SortableItem
                      key={task.id}
                      id={task.id}
                      index={index}
                      droppableId={columnId}
                      task={task}
                    >
                      <div onClick={() => openTaskDetails(task, columnId)}>
                        <div>{task.name}</div>
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
