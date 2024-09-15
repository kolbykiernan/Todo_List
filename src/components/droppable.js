// components/droppable.js
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, label, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = `flex flex-col p-4 w-1/3 border-2 rounded-md ${isOver ? 'border-yellow-500' : 'border-yellow-200'} bg-white h-3/4`;

  return (
    <div ref={setNodeRef} className={style}>
      <h3 className="text-lg font-bold mb-2">{label}</h3>
      {children}
    </div>
  );
}
