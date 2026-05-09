import React, { useMemo, useState } from 'react';
import { Team } from '../types';
import { Shield, Clock, AlertTriangle, CheckCircle2, User, LayoutGrid, CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';
import { BOOTH_COLORS } from '../constants';
import { RegistryView } from './RegistryView';

interface CoordinatorViewProps {
  teams: Team[];
  registry: Record<string, string>;
  onRegistryChange: (registry: Record<string, string>) => void;
  mentorName: string;
}

export default function CoordinatorView({ teams, registry, onRegistryChange, mentorName }: CoordinatorViewProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'registry'>('matrix');

  const stats = useMemo(() => {
    const total = teams.length;
    const completed = teams.filter(t => t.status === 'done').length;
    const active = teams.filter(t => t.status === 'busy').length;
    const pending = teams.filter(t => t.status === 'idle').length;
    return { total, completed, active, pending, progress: (completed / total) * 100 };
  }, [teams]);

  const priorityQueue = useMemo(() => {
    return [...teams]
      .filter(t => t.status === 'idle')
      .sort((a, b) => {
        const timeA = a.lastVisited || 0;
        const timeB = b.lastVisited || 0;
        return timeA - timeB;
      });
  }, [teams]);

  return (
    <div className="p-6 space-y-8">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b-2 border-black pb-0">
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`px-6 py-3 font-black uppercase italic tracking-tighter transition-all rounded-t-sm ${
            activeTab === 'matrix' ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Live Matrix
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('registry')}
          className={`px-6 py-3 font-black uppercase italic tracking-tighter transition-all rounded-t-sm ${
            activeTab === 'registry' ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'
          }`}
        >
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4" />
            Registry System
          </div>
        </button>
      </div>

      {activeTab === 'matrix' ? (
        <>
          {/* Overview Stats - Editorial Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-2 border-black divide-x-2 divide-black">
        {[
          { label: 'Active Mentors', value: stats.active, sub: `Of ${stats.total} total` },
          { label: 'Progress', value: `${Math.round(stats.progress)}%`, sub: 'Event completion' },
          { label: 'Completed', value: stats.completed, sub: 'Booths cleared' },
          { label: 'Queue Size', value: stats.pending, sub: 'Teams waiting' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A31F34] font-bold mb-2">{stat.label}</p>
            <p className="text-4xl font-black leading-none uppercase italic tracking-tighter">{stat.value}</p>
            <p className="text-[10px] uppercase text-gray-400 font-bold mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Grid: Booth Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Booth Matrix</h3>
            <div className="flex gap-4 text-[9px] font-mono uppercase font-bold">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white border border-gray-300" /> Idle</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#FFD1DC] border border-black" /> A</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#D1E9FF] border border-black" /> B</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#D1FFD7] border border-black" /> C</div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {teams.map((team) => {
              // Determine stage color
              let currentGroup = '';
              if (team.status === 'busy' && team.mentorName) {
                currentGroup = team.mentorName.startsWith('Booth ') ? team.mentorName.charAt(6) : '';
              } else if (team.status === 'done' && team.completedStages?.length) {
                if (team.completedStages.includes('C')) currentGroup = 'C';
                else if (team.completedStages.includes('B')) currentGroup = 'B';
                else if (team.completedStages.includes('A')) currentGroup = 'A';
              }
              
              const stageColors = BOOTH_COLORS[currentGroup as keyof typeof BOOTH_COLORS] || BOOTH_COLORS.NONE;

              return (
                <div 
                  key={team.id}
                  className={`relative aspect-square rounded-sm border-2 flex flex-col items-center justify-center transition-all ${
                    team.status === 'busy' || team.status === 'done'
                      ? `${stageColors.split(' ')[0]} border-black shadow-solid-sm`
                      : 'bg-white border-black/10 text-gray-300'
                  }`}
                  title={`Team ${team.teamNumber}`}
                >
                  <span className={`text-xs font-black uppercase tracking-tighter italic leading-none ${team.status === 'idle' ? 'text-gray-300' : 'text-black'}`}>{team.teamNumber}</span>
                  
                  {/* Stage Progress Indicators */}
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {['A', 'B', 'C'].map((stage) => {
                      const isCompleted = team.completedStages?.includes(stage);
                      const isInProgress = team.status === 'busy' && team.mentorName?.includes(`Booth ${stage}`);
                      const stageColor = BOOTH_COLORS[stage as keyof typeof BOOTH_COLORS].split(' ')[0];
                      
                      return (
                        <div 
                          key={stage}
                          className={`w-1.5 h-1.5 rounded-full border-[0.5px] border-black/20 ${
                            isCompleted 
                              ? stageColor 
                              : isInProgress 
                              ? `${stageColor} animate-pulse border-black` 
                              : 'bg-gray-100'
                          }`}
                          title={`${stage}: ${isCompleted ? 'Finished' : isInProgress ? 'In Progress' : 'Pending'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase mb-1">
                <Shield className="w-3 h-3 text-[#A31F34]" />
                <span className="text-[#A31F34] font-bold">Coordination Protocol active</span>
             </div>
             <p className="text-xs font-serif italic text-gray-500">Real-time sync verified via MITNODE Secure Cluster. Manual overrides disabled during active shifts.</p>
          </div>
        </div>

        {/* Priority Queue Sidebar */}
        <div className="bg-[#f8f8f8] border-2 border-black p-6 flex flex-col space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A31F34] font-bold">Priority Status</h3>
            <p className="text-2xl font-black italic tracking-tighter uppercase">Next Dispatches</p>
          </div>
          
          <div className="space-y-4">
            {priorityQueue.slice(0, 4).map((team, idx) => (
              <div key={team.id} className="flex flex-col gap-1 border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-black italic tracking-tighter">TEAM {team.teamNumber}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${idx === 0 ? 'bg-[#A31F34] text-white' : 'bg-black text-white'}`}>
                    {idx === 0 ? 'High Priority' : 'Queued'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                  <span>Last Seen: {team.lastVisited ? new Date(team.lastVisited).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                  <span>Wait: {Math.floor((Date.now() - (team.lastVisited || Date.now() - 1000 * 60 * 30)) / 60000)}m</span>
                </div>
              </div>
            ))}
            {priorityQueue.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm font-serif italic text-gray-300">All sectors clear.</p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest opacity-60">System Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <RegistryView 
      teams={teams}
      registry={registry}
      onRegistryChange={onRegistryChange}
    />
  )}
    </div>
  );
}
