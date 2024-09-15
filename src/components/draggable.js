// components/draggable.js
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function Draggable({ id, droppableId, children }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id,
      data: { droppableId },
    });
  
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      className="bg-yellow-50 p-2 mb-2 border rounded-md shadow-sm cursor-move"
    >
      {children}
    </div>
  );
}
