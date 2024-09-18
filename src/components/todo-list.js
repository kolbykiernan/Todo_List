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

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks) {
      setTasks(savedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onCreateTask = () => {
    if (taskName.trim()) {
      setTasks((existingTasks) => ({
        ...existingTasks,
        todo: [...existingTasks.todo, taskName],
      }));
      setTaskName('');
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

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

    setTasks((existingTasks) => {
      let updatedFromColumn = existingTasks[fromColumn].filter(
          (task) => task !== active.id
      );

      let updatedToColumn;
      
      if (fromColumn === toColumn) {
          updatedToColumn = arrayMove(
              existingTasks[toColumn],
              existingTasks[toColumn].indexOf(active.id),
              existingTasks[toColumn].indexOf(over.id)
          );
      } else {
          let insertionIndex = existingTasks[toColumn].indexOf(over.id);
          if (insertionIndex === -1) {
              insertionIndex = existingTasks[toColumn].length;
          }

          updatedToColumn = [
              ...existingTasks[toColumn].slice(0, insertionIndex),
              active.id,
              ...existingTasks[toColumn].slice(insertionIndex),
          ];

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

  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const saveTaskDetails = (updatedTask) => {
    if (!updatedTask) {
        setTasks((existingTasks) => {
            const updatedTasks = { ...existingTasks };
            Object.keys(updatedTasks).forEach(columnId => {
                updatedTasks[columnId] = updatedTasks[columnId].filter(task => task !== selectedTask.id);
            });
            return updatedTasks;
        });
    } else {
        setTasks((existingTasks) => {
            const updatedTasks = { ...existingTasks };
            const columnId = updatedTask.status || selectedTask.status;

            updatedTasks[columnId] = updatedTasks[columnId].map(task => 
                task === selectedTask.id ? updatedTask.name : task
            );

            if (columnId !== selectedTask.status) {
                updatedTasks[selectedTask.status] = updatedTasks[selectedTask.status].filter(task => task !== selectedTask.id);
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
                  items={items} 
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((task, index) => (
                    <SortableItem 
                      key={task} 
                      id={task} 
                      index={index} 
                      droppableId={columnId}
                      task={{ 
                        name: task, 
                        notes: '', 
                        repeatFrequency: { number: 0, period: 'Never' }, 
                        priority: 'Low'
                      }}
                    >
                      <div onClick={() => openTaskDetails({ id: task, name: task, notes: '', status: columnId })}>
                        {task}
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
              onClose={() => setSelectedTask(null)} 
              onSave={saveTaskDetails} 
            />
          )}
        </AnimatePresence>
        <DragOverlay>
          {activeId ? <div className="p-2 bg-yellow-200 rounded">{activeId}</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
