import React from 'react';
import { Task } from '../../types';
import { useStore } from '../../store';
import { Paperclip, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onClick?: () => void;
  isOverlay?: boolean;
}

export default function TaskCard({ task, onClick, isOverlay }: Props) {
  const { users, attachments } = useStore();
  const assignees = users.filter(u => task.assignee_ids.includes(u.id));
  const taskAttachments = attachments.filter(a => a.task_id === task.id);

  const priorityStyles = {
    LOW: 'bg-white text-[#121212]',
    MEDIUM: 'bg-bauhaus-blue text-white',
    HIGH: 'bg-bauhaus-yellow text-[#121212]',
    URGENT: 'bg-bauhaus-red text-white',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border-4 border-[#121212] shadow-bauhaus p-5 cursor-pointer hover:-translate-y-1 hover:shadow-bauhaus-lg transition-transform rounded-none relative group",
        isOverlay && "rotate-3 shadow-bauhaus-lg scale-105 opacity-100"
      )}
    >
      {/* Decorative corner shape */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-bauhaus-yellow border-l-4 border-b-4 border-[#121212] shape-triangle translate-x-1 -translate-y-1" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          {task.task_type === 'RFI' && (
            <span className="bg-[#121212] text-white border-2 border-[#121212] rounded-none text-[10px] font-black px-2 py-1 uppercase tracking-widest shadow-bauhaus-sm">
              RFI
            </span>
          )}
          <span className={cn("border-2 border-[#121212] rounded-full text-[10px] font-black px-2 py-1 uppercase tracking-widest shadow-bauhaus-sm", priorityStyles[task.priority])}>
            {task.priority}
          </span>
        </div>
        {task.rfi_code && (
           <span className="text-xs font-bold text-[#121212] bg-bauhaus-bg px-2 border-2 border-[#121212]">{task.rfi_code}</span>
        )}
      </div>
      
      <h4 className="font-black text-[#121212] text-xl mb-6 leading-tight uppercase line-clamp-3">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-4 pt-4 border-t-4 border-[#121212]">
        <div className="flex items-center gap-4 text-[#121212] text-sm font-bold">
          {taskAttachments.length > 0 && (
             <div className="flex items-center gap-1 border-2 border-[#121212] px-2 py-0.5 shadow-bauhaus-sm bg-white">
               <Paperclip className="w-4 h-4" />
               <span>{taskAttachments.length}</span>
             </div>
          )}
          {task.due_date && (
            <div className={cn("flex items-center gap-1 border-2 border-[#121212] px-2 py-0.5 shadow-bauhaus-sm bg-white", new Date(task.due_date) < new Date() ? 'bg-bauhaus-red text-white' : '')}>
              <Clock className="w-4 h-4" />
              <span>{format(new Date(task.due_date), 'MM/dd')}</span>
            </div>
          )}
        </div>

        <div className="flex -space-x-3 overflow-hidden">
          {assignees.map(a => (
             <img 
               key={a.id} 
               src={a.avatar_url} 
               alt={a.name} 
               title={a.name}
               className="inline-block h-8 w-8 rounded-full border-2 border-[#121212] bg-white grayscale" 
             />
          ))}
        </div>
      </div>
    </div>
  );
}
