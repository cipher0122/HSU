import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import TaskCard from './TaskCard';

interface Props {
  key?: string | number;
  task: Task;
  onClick: () => void;
}

export default function SortableTaskCard({ task, onClick }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-40 bg-bauhaus-yellow border-4 border-dashed border-[#121212] rounded-none opacity-80 shadow-none flex items-center justify-center" 
      >
        <span className="font-black text-xl uppercase tracking-widest text-[#121212]">MOVING</span>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}
