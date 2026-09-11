import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../../types';
import { useStore } from '../../store';
import { X, Paperclip, CheckSquare, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task: initialTask, onClose }: Props) {
  const { users, updateTask, addAttachment, attachments } = useStore();
  const [task, setTask] = useState<Task>(initialTask);
  const taskAttachments = attachments.filter(a => a.task_id === task.id);
  const creator = users.find(u => u.id === task.creator_id);
  
  const [answerDraft, setAnswerDraft] = useState(task.official_answer || '');

  const handleSave = () => {
    updateTask(task.id, { official_answer: answerDraft });
    setTask(prev => ({ ...prev, official_answer: answerDraft }));
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const blobUrl = URL.createObjectURL(file);
          addAttachment({
            task_id: task.id,
            uploader_id: task.creator_id,
            file_name: `pasted-image-${Date.now()}.png`,
            file_url: blobUrl,
            file_size: file.size,
            mime_type: file.type,
            is_inline_image: true,
          });
        }
      }
    }
  }, [task.id, task.creator_id, addAttachment]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bauhaus-bg/90 p-4">
      <div className="bauhaus-card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="px-8 py-6 border-b-4 border-[#121212] flex justify-between items-center bg-bauhaus-blue text-white">
          <div className="flex items-center gap-4">
             <span className="text-sm font-black tracking-widest bg-white text-[#121212] border-2 border-[#121212] px-3 py-1 shadow-bauhaus-sm">
               {task.task_type === 'RFI' ? task.rfi_code : task.id.split('-')[0].toUpperCase()}
             </span>
             <h2 className="text-3xl font-black uppercase tracking-tighter">{task.title}</h2>
          </div>
          <button onClick={onClose} className="bauhaus-btn bg-bauhaus-red text-white w-12 h-12 rounded-full border-2 border-[#121212] hover:bg-[#121212] hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-10 bg-white" style={{ backgroundImage: 'radial-gradient(#d0d0d0 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
          <div className="flex-1 space-y-8">
            <section className="bg-white border-4 border-[#121212] p-6 shadow-bauhaus">
              <h3 className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 flex items-center gap-3">
                <Info className="w-6 h-6" /> DESCRIPTION
              </h3>
              <div className="text-lg font-medium whitespace-pre-wrap leading-relaxed text-[#121212]">
                {task.description || <span className="text-gray-500 italic">No description provided.</span>}
              </div>
            </section>

            {task.task_type === 'RFI' && (
              <section className="bg-bauhaus-yellow border-4 border-[#121212] p-6 shadow-bauhaus">
                <h3 className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 flex items-center gap-3">
                  <CheckSquare className="w-6 h-6" /> OFFICIAL RESOLUTION
                </h3>
                <textarea 
                  className="bauhaus-input w-full p-4 text-lg min-h-[160px] font-medium"
                  placeholder="Enter official resolution or clarification..."
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  onBlur={handleSave}
                />
              </section>
            )}

            <section className="bg-white border-4 border-[#121212] p-6 shadow-bauhaus">
              <h3 className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-6 h-6" /> ATTACHMENTS ({taskAttachments.length})
                </div>
                <span className="text-sm font-bold bg-bauhaus-bg border-2 border-[#121212] px-2 py-1 shadow-bauhaus-sm">CTRL+V TO PASTE</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {taskAttachments.map(att => (
                  <div key={att.id} className="relative group border-4 border-[#121212] bg-white shadow-bauhaus aspect-square flex items-center justify-center overflow-hidden">
                    {att.mime_type.startsWith('image/') ? (
                      <img src={att.file_url} alt={att.file_name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <span className="text-sm font-bold p-2 text-center break-all">{att.file_name}</span>
                    )}
                  </div>
                ))}
                {taskAttachments.length === 0 && (
                  <div className="col-span-full py-12 text-center border-4 border-dashed border-[#121212] bg-bauhaus-bg">
                    <p className="text-xl font-black uppercase tracking-widest">NO ATTACHMENTS</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-8">
            <div className="bg-white border-4 border-[#121212] p-6 shadow-bauhaus">
              <label className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 block">STATUS</label>
              <select 
                className="bauhaus-input w-full p-3 text-lg font-bold uppercase cursor-pointer"
                value={task.status}
                onChange={(e) => {
                  const newStatus = e.target.value as any;
                  setTask(prev => ({ ...prev, status: newStatus }));
                  updateTask(task.id, { status: newStatus });
                }}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">UNDER REVIEW</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="bg-white border-4 border-[#121212] p-6 shadow-bauhaus">
              <label className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 block">AUTHOR</label>
              <div className="flex items-center gap-4">
                 <img src={creator?.avatar_url} alt="" className="w-12 h-12 rounded-full border-2 border-[#121212] grayscale" />
                 <span className="text-lg font-bold uppercase">{creator?.name}</span>
              </div>
            </div>

            <div className="bg-white border-4 border-[#121212] p-6 shadow-bauhaus">
              <label className="text-xl font-black uppercase tracking-widest text-[#121212] mb-4 border-b-4 border-[#121212] pb-2 block">TIMELINE</label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold uppercase tracking-widest">START</span>
                  <div className="flex items-center gap-3 bauhaus-input p-3">
                    <Clock className="w-5 h-5" />
                    <input 
                      type="date"
                      className="bg-transparent border-none outline-none focus:ring-0 p-0 text-base font-bold w-full uppercase"
                      value={task.start_date ? task.start_date.split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                        setTask(prev => ({ ...prev, start_date: newDate }));
                        updateTask(task.id, { start_date: newDate });
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold uppercase tracking-widest">END</span>
                  <div className="flex items-center gap-3 bauhaus-input p-3">
                    <Clock className="w-5 h-5" />
                    <input 
                      type="date"
                      className="bg-transparent border-none outline-none focus:ring-0 p-0 text-base font-bold w-full uppercase"
                      value={task.due_date ? task.due_date.split('T')[0] : ''}
                      onChange={(e) => {
                        const newDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                        setTask(prev => ({ ...prev, due_date: newDate }));
                        updateTask(task.id, { due_date: newDate });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
