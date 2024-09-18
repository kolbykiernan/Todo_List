import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, index, droppableId, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id,
    data: {
      droppableId, 
      index,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        className="bg-yellow-50 p-2 mb-2 border rounded-md shadow-sm cursor-move">
      {children}
    </div>
  );
}
