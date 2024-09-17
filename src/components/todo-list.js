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
  const { width, height } = useWindowSize();
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState({
    todo: ['Meet with Brandon to review project', 'Switch to my MacBook Pro'],
    inProgress: ['Connect Stripe to Ecomm Ruby Project', 'Submit Take-Home Project'],
    done: ['Interview with Jonathan', 'Interview with Brandon', 'Meeting with Brandon & Aisha', 'Interview with Katie', 'Interview with Ani'],
  });
  const [activeId, setActiveId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const columnLabels = {
    todo: 'Todo',
    inProgress: 'In Progress',
    done: 'Done',
  };

  // <------ Load tasks from localStorage on mount ------> //
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks) {
      setTasks(savedTasks);
    }
  }, []);

  // <------ Save tasks to localStorage on change ------> //
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // <------ Defined sensor with useSensor hook ------> //
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // <------ Function to create a new task ------> //
  const onCreateTask = () => {
    if (taskName.trim()) {
      setTasks((existingTasks) => ({
        ...existingTasks,
        todo: [...existingTasks.todo, taskName],
      }));
      setTaskName('');
    }
  };

  // <------ Function to set activeId state when a task is dragged ------> //
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // <------ Function to handle when a task is dropped ------> //
  const handleDragEnd = (event) => {
    const { active, over } = event;
  
    if (!over) {
      setActiveId(null);
      return;
    }
  
    // Defines and retrieves droppableId from active and over event data and sets anything that doesn't apply to null //
    const fromColumn = active.data.current?.droppableId;
    const toColumn = over.data.current?.droppableId;
  
    if (!fromColumn || !toColumn) {
      setActiveId(null);
      return;
    }
    
  
    setTasks((existingTasks) => {
        let updatedFromColumn = existingTasks[fromColumn].filter(
            (task) => task !== active.id
        );

        let updatedToColumn;
        
        // Check if the item is dropped within the same column //
        if (fromColumn === toColumn) {
            updatedToColumn = arrayMove(
                existingTasks[toColumn],
                existingTasks[toColumn].indexOf(active.id),
                existingTasks[toColumn].indexOf(over.id)
            );
        } else {
            // If `over.id` is not found in the toColumn, append it to the end
            let insertionIndex = existingTasks[toColumn].indexOf(over.id);
            if (insertionIndex === -1) {
                insertionIndex = existingTasks[toColumn].length;
            }

            // Insert task into the new column
            updatedToColumn = [
                ...existingTasks[toColumn].slice(0, insertionIndex),
                active.id,
                ...existingTasks[toColumn].slice(insertionIndex),
            ];

            // Show confetti if moved to "Done" column
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

 // <------ Function to open task details ------> //
const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

// <------ Function to save task details ------> //
const saveTaskDetails = (updatedTask) => {
    if (!updatedTask) {
        // Handle task deletion
        setTasks((existingTasks) => {
            const updatedTasks = { ...existingTasks };
            Object.keys(updatedTasks).forEach(columnId => {
                updatedTasks[columnId] = updatedTasks[columnId].filter(task => task !== selectedTask.id);
            });
            return updatedTasks;
        });
    } else {
        // Handle task update
        setTasks((existingTasks) => {
            const updatedTasks = { ...existingTasks };
            // Locate the column containing the task
            const columnId = updatedTask.status || selectedTask.status;

            // Replace the old task with the updated task
            updatedTasks[columnId] = updatedTasks[columnId].map(task => 
                task === selectedTask.id ? updatedTask.name : task
            );

            // If the status has changed, move the task to the new column
            if (columnId !== selectedTask.status) {
                // Remove from the original column
                updatedTasks[selectedTask.status] = updatedTasks[selectedTask.status].filter(task => task !== selectedTask.id);
                // Add to the new column
                updatedTasks[columnId] = [...updatedTasks[columnId], updatedTask.name];
            }

            return updatedTasks;
        });
    }
    setSelectedTask(null);
};

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 bg-yellow-50 min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Todo List</h2>
        <div className="mb-4">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task name"
            className="p-2 border border-gray-300 rounded"
          />
          <button
            onClick={onCreateTask}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Add Task
          </button>
        </div>

        {/* <------ Render tasks in columns using Droppable and SortableContext components -------> */}
        <div className="flex space-x-4 h-screen mt-10">
          {Object.entries(tasks).map(([columnId, items]) => (
            <Droppable key={columnId} id={columnId} taskCount={items.length} label={columnLabels[columnId]}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((task, index) => (
                  <SortableItem key={task} id={task} index={index} droppableId={columnId}>
                    <div onClick={() => openTaskDetails({ id: task, name: task, notes: '', status: columnId })}>
                      {task}
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </Droppable>
          ))}
        </div>
        {/* Show confetti if showConfetti is true */}
        {showConfetti && <Confetti width={width} height={height} />}
        {/* Show Task Details Overlay */}
        <AnimatePresence>
            {selectedTask && (
                <TaskDetails 
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onSave={saveTaskDetails} 
                />
            )}
        </AnimatePresence>
        {/* styling element provided by DNDKit to show user interaction when dragging */}
        <DragOverlay>
          {activeId ? <div className="p-2 bg-yellow-200 rounded">{activeId}</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}