import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { format, differenceInDays, addDays, min, max, startOfWeek, endOfWeek } from 'date-fns';
import { Task } from '../../types';
import { cn } from '../../lib/utils';

interface Props {
  onTaskClick: (task: Task) => void;
}

export default function GanttChart({ onTaskClick }: Props) {
  const { tasks } = useStore();

  const { startDate, endDate, days, gridTasks } = useMemo(() => {
    const dates: Date[] = [];
    tasks.forEach(t => {
      if (t.start_date) dates.push(new Date(t.start_date));
      if (t.due_date) dates.push(new Date(t.due_date));
    });

    if (dates.length === 0) dates.push(new Date());

    const minD = startOfWeek(addDays(min(dates), -7));
    const maxD = endOfWeek(addDays(max(dates), 14));
    
    const totalDays = differenceInDays(maxD, minD) + 1;
    const daysArr = Array.from({ length: totalDays }).map((_, i) => addDays(minD, i));

    const processedTasks = tasks
      .filter(t => t.start_date || t.due_date)
      .sort((a, b) => {
        const aStart = a.start_date ? new Date(a.start_date).getTime() : new Date().getTime();
        const bStart = b.start_date ? new Date(b.start_date).getTime() : new Date().getTime();
        return aStart - bStart;
      });

    return { startDate: minD, endDate: maxD, days: daysArr, gridTasks: processedTasks };
  }, [tasks]);

  const cellWidth = 48; // px per day

  return (
    <div className="flex h-full bauhaus-card flex-col md:flex-row overflow-hidden border-4 border-[#121212] bg-white">
      {/* Left Pane: Task List */}
      <div className="w-full md:w-1/3 min-w-[360px] border-r-4 border-[#121212] flex flex-col bg-white z-20">
        <div className="h-16 border-b-4 border-[#121212] flex items-center px-6 bg-bauhaus-yellow font-black text-[#121212] text-lg uppercase tracking-widest shrink-0">
          <div className="flex-1 truncate">SUBJECT</div>
          <div className="w-24 text-center">START</div>
          <div className="w-24 text-center">END</div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white">
          {gridTasks.map(task => (
            <div 
              key={task.id} 
              className="h-16 border-b-4 border-[#121212] flex items-center px-6 hover:bg-bauhaus-bg cursor-pointer transition-colors"
              onClick={() => onTaskClick(task)}
            >
              <div className="flex-1 truncate text-base font-bold text-[#121212] flex items-center gap-3 uppercase">
                {task.task_type === 'RFI' && (
                  <span className="bg-[#121212] text-white border-2 border-[#121212] text-xs font-black px-2 py-0.5 rounded-none shadow-bauhaus-sm">RFI</span>
                )}
                {task.title}
              </div>
              <div className="w-24 text-sm text-center font-bold border-l-2 border-[#121212] pl-2">
                {task.start_date ? format(new Date(task.start_date), 'MM/dd') : '-'}
              </div>
              <div className="w-24 text-sm text-center font-bold border-l-2 border-[#121212] pl-2">
                {task.due_date ? format(new Date(task.due_date), 'MM/dd') : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Gantt Timeline */}
      <div className="flex-1 overflow-auto flex flex-col relative bg-bauhaus-bg" style={{ width: `${days.length * cellWidth}px` }}>
        {/* Timeline Header */}
        <div className="h-16 border-b-4 border-[#121212] flex shrink-0 sticky top-0 z-10 bg-[#121212] text-white">
          {days.map((day, i) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div 
                key={i} 
                className={cn(
                  "border-r-2 border-slate-600 flex flex-col items-center justify-center shrink-0",
                  isWeekend ? "bg-white/10" : "",
                  isToday ? "bg-bauhaus-red text-white font-black" : "font-bold"
                )}
                style={{ width: cellWidth }}
              >
                <span className="text-[10px] uppercase tracking-widest">{format(day, 'E')}</span>
                <span className="text-sm">{format(day, 'dd')}</span>
              </div>
            );
          })}
        </div>

        {/* Timeline Grid & Bars */}
        <div className="flex-1 relative" style={{ backgroundImage: 'radial-gradient(#d0d0d0 2px, transparent 2px)', backgroundSize: `${cellWidth}px 100%` }}>
          {/* Vertical Grid Lines */}
          <div className="absolute inset-0 flex pointer-events-none">
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div 
                  key={i} 
                  className={cn(
                    "border-r-2 border-[#121212]/10 shrink-0 h-full",
                    isWeekend ? "bg-[#121212]/5" : "",
                    isToday ? "border-bauhaus-red/50 bg-bauhaus-red/10" : ""
                  )}
                  style={{ width: cellWidth }}
                />
              );
            })}
          </div>

          {/* Task Bars */}
          <div className="absolute inset-0 pt-[2px]">
            {gridTasks.map((task, index) => {
              const tStart = task.start_date ? new Date(task.start_date) : new Date(task.due_date || new Date());
              const tEnd = task.due_date ? new Date(task.due_date) : new Date(task.start_date || new Date());
              
              const offsetDays = differenceInDays(tStart, startDate);
              const durationDays = Math.max(1, differenceInDays(tEnd, tStart) + 1);

              const leftPos = offsetDays * cellWidth;
              const barWidth = durationDays * cellWidth;

              const isRFI = task.task_type === 'RFI';

              return (
                <div 
                  key={task.id} 
                  className="h-16 flex items-center border-b-4 border-transparent relative group"
                >
                  <div 
                    className={cn(
                      "absolute h-10 border-4 border-[#121212] shadow-bauhaus-sm flex items-center px-3 text-sm font-black uppercase tracking-wider cursor-pointer transition-transform overflow-hidden whitespace-nowrap z-10 hover:z-20 hover:-translate-y-1 hover:shadow-bauhaus rounded-none",
                      isRFI 
                        ? "bg-bauhaus-red text-white" 
                        : "bg-bauhaus-blue text-white"
                    )}
                    style={{ left: leftPos, width: barWidth }}
                    onClick={() => onTaskClick(task)}
                    title={`${task.title} (${format(tStart, 'MM/dd')} - ${format(tEnd, 'MM/dd')})`}
                  >
                    {barWidth > 80 ? task.title : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
