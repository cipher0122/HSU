import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useStore } from '../../store';
import BoardColumn from './Column';
import { Task } from '../../types';
import TaskCard from './TaskCard';
import TaskModal from '../modals/TaskModal';

export default function KanbanBoard() {
  const { columns, tasks, moveTask, updateTask } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask && overTask && activeTask.column_id !== overTask.column_id) {
        updateTask(activeTask.id, { column_id: overTask.column_id });
      }
    }

    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find(t => t.id === activeId);
      if (activeTask && activeTask.column_id !== overId) {
        updateTask(activeTask.id, { column_id: String(overId) });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);
    
    if (activeTask && overTask && activeTask.column_id === overTask.column_id) {
      const columnTasks = tasks.filter(t => t.column_id === activeTask.column_id).sort((a,b) => a.position - b.position);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);
      
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex) as Task[];
        reordered.forEach((t, i) => {
          if (t.position !== (i + 1) * 1000) {
            updateTask(t.id, { position: (i + 1) * 1000 });
          }
        });
      }
    } else if (activeTask && over.data.current?.type === 'Column') {
       const newColTasks = tasks.filter(t => t.column_id === overId);
       const maxPos = newColTasks.reduce((max, t) => Math.max(max, t.position), 0);
       moveTask(activeTask.id, String(overId), maxPos + 1000);
    }
  };

  return (
    <div className="flex h-full gap-8 overflow-x-auto pb-8 items-start">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.sort((a,b) => a.position - b.position).map((col, idx) => {
          const colTasks = tasks
            .filter(t => t.column_id === col.id)
            .sort((a,b) => a.position - b.position);
          
          return (
            <BoardColumn 
              key={col.id} 
              column={col} 
              tasks={colTasks} 
              onTaskClick={(t: Task) => setSelectedTask(t)}
              index={idx}
            />
          );
        })}

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '1' } } }) }}>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
