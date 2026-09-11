import React from 'react';
import { useStore } from '../../store';

export default function RfiList() {
  const { tasks, users } = useStore();
  const rfis = tasks.filter(t => t.task_type === 'RFI');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bauhaus-card overflow-hidden">
        <table className="w-full text-left text-[#121212]">
          <thead className="bg-[#121212] text-white uppercase font-black tracking-widest text-lg border-b-4 border-[#121212]">
            <tr>
              <th className="px-6 py-5 border-r-2 border-slate-700">RFI #</th>
              <th className="px-6 py-5 border-r-2 border-slate-700">SUBJECT</th>
              <th className="px-6 py-5 border-r-2 border-slate-700">STATUS</th>
              <th className="px-6 py-5 border-r-2 border-slate-700">PRIORITY</th>
              <th className="px-6 py-5 border-r-2 border-slate-700">AUTHOR</th>
              <th className="px-6 py-5">DATE</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rfis.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xl font-bold uppercase tracking-widest">NO RFI DATA</td>
              </tr>
            ) : (
              rfis.map(rfi => {
                const creator = users.find(u => u.id === rfi.creator_id);
                return (
                  <tr key={rfi.id} className="hover:bg-bauhaus-bg transition-colors cursor-pointer border-b-4 border-[#121212] last:border-b-0">
                    <td className="px-6 py-5 font-black text-bauhaus-red border-r-2 border-[#121212]">{rfi.rfi_code}</td>
                    <td className="px-6 py-5 font-bold text-xl uppercase border-r-2 border-[#121212]">{rfi.title}</td>
                    <td className="px-6 py-5 border-r-2 border-[#121212]">
                      <span className={`px-3 py-1.5 border-2 border-[#121212] text-sm font-black uppercase tracking-widest shadow-bauhaus-sm rounded-none
                        ${rfi.status === 'IN_REVIEW' ? 'bg-bauhaus-yellow text-[#121212]' : ''}
                        ${rfi.status === 'RESOLVED' ? 'bg-bauhaus-blue text-white' : ''}
                        ${rfi.status === 'CLOSED' ? 'bg-[#121212] text-white' : ''}
                        ${rfi.status === 'OPEN' ? 'bg-white text-[#121212]' : ''}
                      `}>
                        {rfi.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold uppercase border-r-2 border-[#121212]">{rfi.priority}</td>
                    <td className="px-6 py-5 flex items-center gap-3 border-r-2 border-[#121212]">
                      {creator?.avatar_url && (
                         <img src={creator.avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-[#121212] grayscale" />
                      )}
                      <span className="font-bold uppercase tracking-wider">{creator?.name.split(' ')[0]}</span>
                    </td>
                    <td className="px-6 py-5 font-bold uppercase tracking-wider">
                      {new Date(rfi.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
