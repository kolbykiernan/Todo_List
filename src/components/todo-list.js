import React, { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { SortableItem } from './sortable';
import { Droppable } from './droppable';

export default function TodoList() {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddTask = () => {
    if (taskName.trim()) {

    setTasks((prevItems) => ({
        ...prevItems,
        todo: [...prevItems.todo, taskName]
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
    const toColumn = over.id;

    if (!fromColumn || !toColumn || !tasks[fromColumn] || !tasks[toColumn]) {
        setActiveId(null);
        return;
    }

    if (fromColumn !== toColumn) {
        setTasks((prevTasks) => {
            const activeTask = prevTasks[fromColumn].find((task) => task === active.id);

            return {
                ...prevTasks,
                [fromColumn]: prevTasks[fromColumn].filter((task) => task !== activeTask),
                [toColumn]: [...prevTasks[toColumn], activeTask],
            };
        });
    } else {
        // Sorting within the same column
        const overIndex = over.data.current?.index;

        if (overIndex === undefined) {
            setActiveId(null);
            return;
        }

        setTasks((prevTasks) => {
            const updatedTasks = arrayMove(prevTasks[fromColumn], active.data.current.index, overIndex);
            return {
                ...prevTasks,
                [fromColumn]: updatedTasks,
            };
        });
    }

    setActiveId(null);
};



  return (
    <DndContext 
     sensors={sensors} 
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
          onClick={handleAddTask}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Add Task
        </button>
      </div>

      <div className="flex space-x-4 h-screen mt-10">
          <Droppable id="todo" label="Todo">
            <SortableContext items={tasks.todo}>
              {tasks.todo.map((task, index) => (
                <SortableItem key={task} id={task} index={index} droppableId="todo">
                  {task}
                </SortableItem>
              ))}
            </SortableContext>
          </Droppable>
          <Droppable id="inProgress" label="In Progress">
            <SortableContext items={tasks.inProgress}>
              {tasks.inProgress.map((task, index) => (
                <SortableItem key={task} id={task} index={index} droppableId="inProgress">
                  {task}
                </SortableItem>
              ))}
            </SortableContext>
          </Droppable>
          <Droppable id="done" label="Done">
            <SortableContext items={tasks.done}>
              {tasks.done.map((task, index) => (
                <SortableItem key={task} id={task} index={index} droppableId="done">
                  {task}
                </SortableItem>
              ))}
            </SortableContext>
          </Droppable>
        </div>
        <DragOverlay>
          {activeId ? <SortableItem id={activeId}>{activeId}</SortableItem> : null}
        </DragOverlay>
    </div>
  </DndContext>
  );
}
