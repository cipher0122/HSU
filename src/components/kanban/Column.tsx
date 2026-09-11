import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn as BoardColumnType, Task } from '../../types';
import SortableTaskCard from './SortableTaskCard';

interface Props {
  key?: string | number;
  column: BoardColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  index?: number;
}

const columnColors = [
  'bg-bauhaus-red text-white',
  'bg-bauhaus-blue text-white',
  'bg-bauhaus-yellow text-[#121212]',
  'bg-white text-[#121212]'
];

export default function BoardColumn({ column, tasks, onTaskClick, index = 0 }: Props) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const headerStyle = columnColors[index % columnColors.length];

  return (
    <div className="flex flex-col bg-white border-4 border-[#121212] shadow-bauhaus-lg w-80 shrink-0 max-h-full rounded-none">
      <div className={`p-5 flex items-center justify-between border-b-4 border-[#121212] ${headerStyle}`}>
        <h3 className="font-black text-2xl uppercase tracking-widest">{column.title}</h3>
        <span className="bg-white text-[#121212] border-2 border-[#121212] text-sm font-black px-3 py-1 rounded-none shadow-bauhaus-sm">
          {tasks.length} {column.wip_limit > 0 ? `/ ${column.wip_limit}` : ''}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundImage: 'radial-gradient(#d0d0d0 2px, transparent 2px)', backgroundSize: '16px 16px' }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-24 bg-white border-4 border-dashed border-[#121212] flex items-center justify-center text-[#121212] font-bold uppercase tracking-widest">
            DROP HERE
          </div>
        )}
      </div>
    </div>
  );
}
