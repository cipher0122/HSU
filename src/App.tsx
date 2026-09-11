import { useState } from 'react';
import { useStore } from './store';
import { Layout, FileQuestion, Users, Settings, Grid, CalendarDays, BarChart2, Bell } from 'lucide-react';
import KanbanBoard from './components/kanban/Board';
import GanttChart from './components/gantt/GanttChart';
import RfiList from './components/rfi/RfiList';
import TaskModal from './components/modals/TaskModal';
import { Task } from './types';

type ModuleState = 'work_packages' | 'rfi' | 'overview';
type WorkPackageView = 'kanban' | 'gantt';

export default function App() {
  const { currentUser, setCurrentUser, users, projects } = useStore();
  const [activeModule, setActiveModule] = useState<ModuleState>('work_packages');
  const [wpView, setWpView] = useState<WorkPackageView>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const activeProject = projects[0];

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-bauhaus-bg">
      {/* Top Global Header - Bauhaus Style */}
      <header className="h-20 bg-bauhaus-yellow border-b-4 border-[#121212] flex items-center justify-between px-6 shrink-0 shadow-bauhaus z-30 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              <div className="w-8 h-8 rounded-full bg-bauhaus-red border-2 border-[#121212]" />
              <div className="w-8 h-8 rounded-none bg-bauhaus-blue border-2 border-[#121212] rotate-12" />
              <div className="w-8 h-8 bg-white border-2 border-[#121212] shape-triangle -rotate-12" />
            </div>
            <span className="font-black text-4xl tracking-tighter uppercase text-[#121212]">OPENTRACK</span>
          </div>
          <div className="h-8 w-1 bg-[#121212] mx-2" />
          <div className="bauhaus-btn px-4 py-2 bg-white text-sm">
            PROJECT: {activeProject.name}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="bauhaus-btn w-12 h-12 bg-white relative">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-bauhaus-red border-2 border-[#121212] rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-4 bg-white border-4 border-[#121212] shadow-bauhaus p-1">
            <select 
              className="bg-transparent text-sm font-bold uppercase border-none py-1 px-2 focus:ring-0 outline-none cursor-pointer"
              value={currentUser.id}
              onChange={(e) => setCurrentUser(users.find(u => u.id === e.target.value)!)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="w-8 h-8 border-2 border-[#121212] rounded-full overflow-hidden bg-bauhaus-blue">
              <img src={currentUser.avatar_url} alt="avatar" className="w-full h-full object-cover grayscale" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r-4 border-[#121212] flex flex-col shrink-0 z-20">
          <div className="p-6 border-b-4 border-[#121212] bg-bauhaus-red">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">MODULES</h2>
          </div>
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            <button 
              onClick={() => setActiveModule('overview')}
              className={`w-full flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase tracking-wider transition-all border-2 ${activeModule === 'overview' ? 'bg-bauhaus-blue text-white border-[#121212] shadow-bauhaus translate-x-[-2px] translate-y-[-2px]' : 'bg-transparent border-transparent text-[#121212] hover:border-[#121212] hover:shadow-bauhaus-sm hover:-translate-y-1'}`}
            >
              <BarChart2 className="w-6 h-6" />
              Overview
            </button>
            <button 
              onClick={() => setActiveModule('work_packages')}
              className={`w-full flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase tracking-wider transition-all border-2 ${activeModule === 'work_packages' ? 'bg-bauhaus-blue text-white border-[#121212] shadow-bauhaus translate-x-[-2px] translate-y-[-2px]' : 'bg-transparent border-transparent text-[#121212] hover:border-[#121212] hover:shadow-bauhaus-sm hover:-translate-y-1'}`}
            >
              <Layout className="w-6 h-6" />
              Work Packages
            </button>
            <button 
              onClick={() => setActiveModule('rfi')}
              className={`w-full flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase tracking-wider transition-all border-2 ${activeModule === 'rfi' ? 'bg-bauhaus-blue text-white border-[#121212] shadow-bauhaus translate-x-[-2px] translate-y-[-2px]' : 'bg-transparent border-transparent text-[#121212] hover:border-[#121212] hover:shadow-bauhaus-sm hover:-translate-y-1'}`}
            >
              <FileQuestion className="w-6 h-6" />
              RFI Tracker
            </button>
            <div className="my-4 border-b-4 border-[#121212]" />
            <button className="w-full flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase tracking-wider transition-all border-2 border-transparent text-[#121212] hover:border-[#121212] hover:shadow-bauhaus-sm hover:-translate-y-1">
              <Users className="w-6 h-6" />
              Members
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-4 text-lg font-bold uppercase tracking-wider transition-all border-2 border-transparent text-[#121212] hover:border-[#121212] hover:shadow-bauhaus-sm hover:-translate-y-1">
              <Settings className="w-6 h-6" />
              Settings
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Module Header & View Toggles */}
          <div className="h-24 border-b-4 border-[#121212] px-8 flex items-center justify-between shrink-0 bg-white">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-[#121212]">
              {activeModule === 'work_packages' && 'WORK PACKAGES'}
              {activeModule === 'rfi' && 'RFI TRACKER'}
              {activeModule === 'overview' && 'PROJECT OVERVIEW'}
            </h1>

            {activeModule === 'work_packages' && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setWpView('kanban')}
                  className={`bauhaus-btn px-6 py-3 text-lg ${wpView === 'kanban' ? 'bg-bauhaus-red text-white translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-white'}`}
                >
                  <Grid className="w-5 h-5 mr-2" />
                  KANBAN
                </button>
                <button 
                  onClick={() => setWpView('gantt')}
                  className={`bauhaus-btn px-6 py-3 text-lg ${wpView === 'gantt' ? 'bg-bauhaus-red text-white translate-x-[2px] translate-y-[2px] shadow-none' : 'bg-white'}`}
                >
                  <CalendarDays className="w-5 h-5 mr-2" />
                  GANTT
                </button>
              </div>
            )}
          </div>

          {/* Module Content */}
          <div className="flex-1 overflow-auto p-8 relative">
            {activeModule === 'work_packages' && wpView === 'kanban' && (
              <KanbanBoard />
            )}
            {activeModule === 'work_packages' && wpView === 'gantt' && (
              <GanttChart onTaskClick={(task) => setSelectedTask(task)} />
            )}
            {activeModule === 'rfi' && (
              <RfiList />
            )}
            {activeModule === 'overview' && (
              <div className="max-w-4xl">
                <div className="bauhaus-card p-10 bg-white relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-bauhaus-blue shape-triangle translate-x-4 -translate-y-4 border-2 border-[#121212]" />
                  <h2 className="text-4xl font-black uppercase mb-6 border-b-4 border-[#121212] pb-4">DESCRIPTION</h2>
                  <p className="text-xl font-medium leading-relaxed">
                    {activeProject.description || 'Constructivist environment active. Use the left navigation to traverse modules. Switch between Kanban and Gantt modes in Work Packages.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
