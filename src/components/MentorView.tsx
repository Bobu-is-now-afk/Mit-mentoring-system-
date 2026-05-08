import React, { useState, useEffect } from 'react';
import { Team, TeamStatus, SESSION_DURATION_MS, SESSIONS } from '../types';
import { Play, CheckCircle2, Clock, Users, Timer, Info, Table as TableIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BOOTH_COLORS, BOOTHS } from '../constants';

interface MentorViewProps {
  teams: Team[];
  onUpdateTeam: (teamId: string, status: TeamStatus) => void;
  mentorId: string;
  mentorName: string;
  registry: Record<string, string>;
}

export default function MentorView({ teams, onUpdateTeam, mentorId, mentorName, registry }: MentorViewProps) {
  const [activeSession, setActiveSession] = useState(SESSIONS[0].id);
  const currentTeam = teams.find(t => t.mentorId === mentorId && t.status === 'busy');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentTeam?.startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - (currentTeam.startTime || 0);
        const remaining = Math.max(0, SESSION_DURATION_MS - elapsed);
        setTimeLeft(remaining);
      }, 1000);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [currentTeam]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAction = async (teamId: string, status: TeamStatus) => {
    setIsProcessing(teamId);
    onUpdateTeam(teamId, status);
    // Brief delay to prevent double-click and show feedback
    setTimeout(() => setIsProcessing(null), 1000);
  };

  return (
    <div className="p-6 space-y-10 pb-40">
      {/* Registry Master Table Section */}
      <section className="border-2 border-black bg-[#f0f0f0] overflow-hidden shadow-solid">
        <div className="p-4 bg-black text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
             <TableIcon className="w-5 h-5 text-yellow-400" />
             <h3 className="text-xl font-black uppercase italic tracking-tighter">Session Schedule</h3>
          </div>
          <div className="flex gap-1 bg-white/10 p-1 rounded-sm overflow-x-auto max-w-full">
            {SESSIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeSession === s.id ? 'bg-yellow-400 text-black' : 'hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 min-w-[600px]">
             {BOOTHS.map(booth => {
                const teamId = registry[`${booth}-${activeSession}`];
                const team = teamId ? teams.find(t => t.id === teamId) : null;
                const charAt6 = booth.charAt(6) as keyof typeof BOOTH_COLORS;
                const stageColor = BOOTH_COLORS[charAt6]?.split(' ')[0] || 'bg-white';

                return (
                  <div key={booth} className="flex flex-col border-[1.5px] border-black/10 bg-white p-2 min-h-[60px]">
                    <span className="text-[8px] font-mono font-bold opacity-40 uppercase mb-1">{booth}</span>
                    {team ? (
                      <div className={`mt-auto p-1.5 border border-black shadow-solid-sm ${stageColor}`}>
                        <p className="text-[10px] font-black leading-none">TEAM {team.teamNumber}</p>
                      </div>
                    ) : (
                      <div className="mt-auto p-1.5 border border-dashed border-gray-200 text-gray-300">
                        <p className="text-[10px] font-mono font-bold leading-none">EMPTY</p>
                      </div>
                    )}
                  </div>
                )
             })}
          </div>
        </div>
      </section>

      <div className="flex justify-between items-end border-b-2 border-black pb-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Booth Matrix</h2>
          <p className="text-sm text-gray-500 font-serif italic mt-1 font-medium">Session Limit: 15:00 Minutes</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A31F34] font-bold">Relay Active</div>
          <p className="text-xs font-black uppercase tracking-tight">Status: Syncing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {teams.map((team) => {
          const isCurrentMentor = team.mentorId === mentorId;
          const isOtherBusy = team.status === 'busy' && !isCurrentMentor;
          const isBusy = team.status === 'busy';
          const isDone = team.status === 'done';
          
          // Determine stage color
          let currentGroup = '';
          if (isBusy && team.mentorName) {
            currentGroup = team.mentorName.startsWith('Booth ') ? team.mentorName.charAt(6) : '';
          } else if (isDone && team.completedStages?.length) {
            if (team.completedStages.includes('C')) currentGroup = 'C';
            else if (team.completedStages.includes('B')) currentGroup = 'B';
            else if (team.completedStages.includes('A')) currentGroup = 'A';
          }
          
          const stageColors = BOOTH_COLORS[currentGroup as keyof typeof BOOTH_COLORS] || BOOTH_COLORS.NONE;
          const isFinalStage = team.completedStages?.includes('C');
          
          return (
            <motion.div
              layout
              key={team.id}
              className={`relative overflow-hidden transition-all border-2 rounded-sm ${
                isBusy
                  ? `${stageColors.split(' ')[0]} border-black ring-2 ring-black ring-inset shadow-solid`
                  : isDone 
                  ? `${stageColors.split(' ')[0]} border-black/20 opacity-70` 
                  : 'bg-white border-black'
              }`}
            >
              <div className="p-4 flex justify-between items-center sm:flex-row flex-col gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-xl border-2 ${
                    isBusy || isDone
                    ? 'bg-black border-black text-white'
                    : 'bg-black border-black text-white'
                  }`}>
                    {team.teamNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-xl uppercase tracking-tighter italic whitespace-nowrap">Team {team.teamNumber}</span>
                      {isBusy && (
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest animate-pulse border border-black">
                          LIVE
                        </span>
                      )}
                      {isDone && (
                        <span className={`px-2 py-0.5 text-black text-[10px] font-bold uppercase tracking-widest border border-black ${isFinalStage ? 'bg-green-400' : 'bg-white/50'}`}>
                          {isFinalStage ? '✅ COMPLETE' : '✓ STAGE DONE'}
                        </span>
                      )}
                    </div>
                    {isBusy ? (
                      <p className="text-xs text-gray-800 font-bold uppercase tracking-tight mt-0.5">
                        {isCurrentMentor ? 'Currently with you' : `Mentor ${team.mentorName} is here`}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-tighter mt-1">
                        {isDone ? '✓ Sequence Logged' : 'Status: Open for Mentorship'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center w-full sm:w-auto">
                  {(team.status === 'idle' || team.status === 'done') && !currentTeam && (
                    <button
                      disabled={!!isProcessing}
                      onClick={() => handleAction(team.id, 'busy')}
                      className={`w-full sm:w-auto h-14 px-8 text-xs font-black uppercase tracking-widest transition-colors shadow-solid disabled:opacity-50 ${
                        isDone ? 'bg-white text-black border-2 border-black hover:bg-gray-100' : 'bg-black text-white hover:bg-[#A31F34]'
                      }`}
                    >
                      {isProcessing === team.id ? 'Starting...' : isDone ? 'Re-Mentoring' : 'Start Mentoring'}
                    </button>
                  )}

                  {team.status === 'busy' && isCurrentMentor && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[9px] font-mono font-bold uppercase text-yellow-600">Time Left</span>
                        <span className="font-mono font-black text-lg text-black tabular-nums">{formatTime(timeLeft)}</span>
                      </div>
                      <button
                        disabled={!!isProcessing}
                        onClick={() => handleAction(team.id, 'done')}
                        className="w-full sm:w-auto h-14 px-8 bg-[#A31F34] text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-colors shadow-solid"
                      >
                        {isProcessing === team.id ? 'Saving...' : 'Finish'}
                      </button>
                    </div>
                  )}

                  {isOtherBusy && (
                    <div className="flex items-center gap-2 opacity-40 bg-gray-100 px-4 py-3 rounded-sm border border-black/10">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase font-bold tracking-widest">In Progress</span>
                    </div>
                  )}

                  {team.status === 'idle' && currentTeam && (
                    <div className="text-[9px] font-mono uppercase text-gray-300 font-bold tracking-widest border border-gray-100 px-4 py-2">
                      Queue Locked
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Editorial Floating Status Bar */}
      <AnimatePresence>
        {currentTeam && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t-4 border-yellow-400 shadow-[0_-15px_50px_rgba(0,0,0,0.4)]"
          >
            <div className="max-w-4xl mx-auto p-5 sm:p-7 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex bg-yellow-400 text-black w-14 h-14 items-center justify-center font-black text-2xl italic border-2 border-black">
                  {currentTeam.teamNumber}
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-yellow-400 font-bold block mb-1">Session Protocol Alpha • Active Review</span>
                  <p className="font-black text-xl uppercase tracking-tighter">Team {currentTeam.teamNumber} — Live Review</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right border-l border-white/20 pl-10">
                  <span className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Countdown</span>
                  <div className="flex items-center gap-2">
                     <Timer className={`w-4 h-4 ${timeLeft < 180000 ? 'text-[#A31F34] animate-pulse' : 'text-yellow-400'}`} />
                     <p className={`font-mono font-black text-3xl tabular-nums tracking-tighter leading-none ${timeLeft < 180000 ? 'text-[#A31F34]' : 'text-yellow-400'}`}>
                       {formatTime(timeLeft)}
                     </p>
                  </div>
                </div>
                <button
                  disabled={!!isProcessing}
                  onClick={() => handleAction(currentTeam.id, 'done')}
                  className="h-14 bg-white text-black px-10 font-black uppercase text-xs hover:bg-[#A31F34] hover:text-white transition-all shadow-[0_4px_0_#71717a] active:translate-y-[2px] active:shadow-none"
                >
                  Finish & Log
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
