import React, { useState } from 'react';
import { Team, SESSIONS } from '../types';
import { BOOTH_COLORS, BOOTHS } from '../constants';
import { AlertCircle, Search, Save, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistryViewProps {
  teams: Team[];
  registry: Record<string, string>;
  onRegistryChange: (registry: Record<string, string>) => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({ 
  teams, 
  registry, 
  onRegistryChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getTeamById = (id: string) => teams.find(t => t.id === id);

  const handleAssign = (boothId: string, sessionId: string, teamId: string) => {
    setError(null);
    
    if (!teamId) {
      const newRegistry = { ...registry };
      delete newRegistry[`${boothId}-${sessionId}`];
      onRegistryChange(newRegistry);
      return;
    }

    // Validation: Team Constraint (one booth per session)
    const existingAssignment = Object.entries(registry).find(([key, val]) => {
      const [assignedBooth, assignedSession] = key.split('-');
      return val === teamId && assignedSession === sessionId && assignedBooth !== boothId;
    });

    if (existingAssignment) {
      const [otherBooth] = existingAssignment[0].split('-');
      setError(`CRITICAL: Team ${getTeamById(teamId)?.teamNumber} is already registered for ${SESSIONS.find(s => s.id === sessionId)?.label} at ${otherBooth}`);
      return;
    }

    onRegistryChange({
      ...registry,
      [`${boothId}-${sessionId}`]: teamId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Registry System</h2>
          <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mt-1 italic">Senior Coordinator Scheduling Module</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="SEARCH TEAMS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-black font-black text-xs uppercase tracking-widest focus:ring-2 ring-black outline-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-2 border-red-500 p-4 flex items-center justify-between shadow-solid-red"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-xs font-black uppercase tracking-tight text-red-600">{error}</p>
            </div>
            <button onClick={() => setError(null)}><XCircle className="w-5 h-5 text-red-400 hover:text-red-600" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto border-2 border-black shadow-solid">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4 text-left border-r border-white/20 font-black uppercase italic tracking-tighter text-sm sticky left-0 z-10 bg-black">Booth / Session</th>
              {SESSIONS.map(session => (
                <th key={session.id} className="p-4 text-center border-r border-white/20 font-black uppercase italic tracking-tighter text-sm min-w-[150px]">
                  {session.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOOTHS.map(booth => (
              <tr key={booth} className="border-b border-black/10 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-black uppercase italic tracking-tighter text-sm border-r border-black/10 sticky left-0 z-10 bg-white">
                  {booth}
                </td>
                {SESSIONS.map(session => {
                  const currentTeamId = registry[`${booth}-${session.id}`];
                  return (
                    <td key={session.id} className="p-2 border-r border-black/10">
                      <select
                        value={currentTeamId || ''}
                        onChange={(e) => handleAssign(booth, session.id, e.target.value)}
                        className={`w-full p-2 border-2 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${
                          currentTeamId 
                            ? `${BOOTH_COLORS[booth.charAt(6) as keyof typeof BOOTH_COLORS]?.split(' ')[0] || 'bg-black'} border-black` 
                            : 'border-dashed border-gray-300 bg-transparent text-gray-400'
                        }`}
                      >
                        <option value="">+ ASSIGN TEAM</option>
                        {teams
                          .filter(t => !searchTerm || t.teamNumber.toString().includes(searchTerm))
                          .map(team => (
                            <option key={team.id} value={team.id}>
                              TEAM {team.teamNumber}
                            </option>
                          ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 bg-gray-900 text-white p-4 rounded-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-yellow-400 rounded-full">
            <Save className="w-4 h-4 text-black" />
          </div>
          <div className="text-[10px] font-mono leading-tight">
            <p className="font-bold uppercase text-yellow-400">Autosave Enabled</p>
            <p className="opacity-60 uppercase">System state persists in coordinating hardware</p>
          </div>
        </div>
      </div>
    </div>
  );
};
