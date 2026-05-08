import React from 'react';
import { LogOut, Shield, GraduationCap, ChevronDown, UserCircle } from 'lucide-react';
import { UserRole } from '../types';
import { MENTOR_IDENTITIES } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  onRoleChange: (role: UserRole) => void;
  onNameChange?: (name: string) => void;
  mentorName?: string;
  stats?: {
    waiting: number;
    completed: number;
  };
}

export default function Layout({ 
  children, 
  role, 
  onLogout, 
  onRoleChange, 
  onNameChange,
  mentorName, 
  stats 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Header */}
      <header className="bg-white border-b-2 border-black px-6 py-5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-baseline gap-4 cursor-pointer" onClick={() => onRoleChange(null)}>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">MITNODE HK</h1>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            {stats ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40 leading-none">Waiting</span>
                  <span className="text-xs font-black">{stats.waiting}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40 leading-none">Finished</span>
                  <span className="text-xs font-black">{stats.completed}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase hidden sm:block">Dispatch v2.4</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {role === 'mentor' && (
              <div className="flex items-center gap-2 group relative">
                <div className="text-right hidden sm:block">
                  <span className="text-[8px] font-mono uppercase tracking-widest opacity-40 block leading-none">Acting as</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">{mentorName || 'Unassigned'}</span>
                </div>
                <div className="relative group">
                  <select 
                    value={mentorName || ''} 
                    onChange={(e) => onNameChange?.(e.target.value)}
                    className="appearance-none bg-gray-50 border border-black text-[10px] font-black uppercase px-4 py-2 pr-8 rounded-sm hover:bg-yellow-400 transition-colors cursor-pointer focus:outline-none"
                  >
                    <option value="" disabled>Select Booth</option>
                    {MENTOR_IDENTITIES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {role && (
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-sm border border-black shadow-light">
                <button 
                  onClick={() => onRoleChange('coordinator')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tight transition-all ${
                    role === 'coordinator' 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-200 text-black/40'
                  }`}
                >
                  Coord
                </button>
                <button 
                  onClick={() => onRoleChange('mentor')}
                  className={`px-3 py-1 text-[9px] font-black uppercase tracking-tight transition-all ${
                    role === 'mentor' 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-200 text-black/40'
                  }`}
                >
                  Mentor
                </button>
              </div>
            )}
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-[#A31F34] hover:text-white border border-transparent hover:border-black transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {children}
      </main>
      
      {/* Footer Branding */}
      <footer className="py-12 text-center border-t border-gray-100 opacity-30 mt-auto">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em]">
          Massachusetts Institute of Technology • Cambridge • Science Fair 2026
        </p>
      </footer>
    </div>
  );
}
