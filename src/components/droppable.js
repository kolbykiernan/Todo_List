import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, label, children, taskCount }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

const style = `flex flex-col p-4 sm:w-1/3 border-2 rounded-md ${isOver ? 'border-yellow-500' : 'border-yellow-200'} bg-white h-3/4`;

  return (
    <div ref={setNodeRef} className={style} style={{ width: '400px' }}>
        <div className="flex items-center mb-2">
            <h3 className="text-lg font-bold">{label}</h3>
            <div className="ml-2 bg-gray-200 text-gray-800 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {taskCount}
            </div>
        </div>
      {children}
    </div>
  );
}
