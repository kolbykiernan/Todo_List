import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './sortable';
import { Droppable } from './droppable';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

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
  
    // Check if the item is dropped within the same column //
    if (fromColumn === toColumn) {
      setTasks((existingTasks) => {
        const updatedTasks = arrayMove(
          existingTasks[fromColumn],
          existingTasks[fromColumn].indexOf(active.id),
          existingTasks[fromColumn].indexOf(over.id)
        );
  
        return {
          ...existingTasks,
          [fromColumn]: updatedTasks,
        };
      });
    } else {
      // Moving to a different column //
      setTasks((existingTasks) => {
        // Remove the task from the original column //
        const updatedFromColumn = existingTasks[fromColumn].filter(
          (task) => task !== active.id
        );

        // Add the task to the new column //
        const updatedToColumn = [
          ...existingTasks[toColumn].slice(0, existingTasks[toColumn].indexOf(over.id)),
          active.id,
          ...existingTasks[toColumn].slice(existingTasks[toColumn].indexOf(over.id)),
        ];

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
    }

    setActiveId(null);
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
            <Droppable key={columnId} id={columnId} label={columnLabels[columnId]}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {items.map((task, index) => (
                  <SortableItem key={task} id={task} index={index} droppableId={columnId}>
                    {task}
                  </SortableItem>
                ))}
              </SortableContext>
            </Droppable>
          ))}
        </div>
        {/* Show confetti if showConfetti is true */}
        {showConfetti && <Confetti width={width} height={height} />}
        {/* styling element provided by DNDKit to show user interaction when dragging */}
        <DragOverlay>
          {activeId ? <div className="p-2 bg-yellow-200 rounded">{activeId}</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
