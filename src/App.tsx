/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Team, TeamStatus } from './types';
import { getInitialTeams, MENTOR_IDENTITIES } from './constants';
import Layout from './components/Layout';
import MentorView from './components/MentorView';
import CoordinatorView from './components/CoordinatorView';
import { GraduationCap, Shield, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('mitnode_role') as UserRole) || null;
  });

  const [mentorName, setMentorName] = useState<string>(() => {
    return localStorage.getItem('mitnode_mentor_name') || '';
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('mitnode_teams');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: If data is old (doesn't have teamNumber or has more than 30 teams or missing stages)
      if (!parsed[0]?.teamNumber || parsed.length !== 30 || !parsed[0]?.completedStages) {
        localStorage.removeItem('mitnode_teams');
        return getInitialTeams();
      }
      return parsed;
    }
    return getInitialTeams();
  });

  const [registry, setRegistry] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mitnode_registry');
    return saved ? JSON.parse(saved) : {};
  });

  // Unique ID for this mentor session - now derived from identity for independence
  const mentorId = mentorName ? `id-${mentorName.toLowerCase().replace(/\s+/g, '-')}` : 'anonymous';

  // Sync with localStorage (simulating real-time broadcast)
  useEffect(() => {
    const serializedTeams = JSON.stringify(teams);
    if (localStorage.getItem('mitnode_teams') !== serializedTeams) {
      localStorage.setItem('mitnode_teams', serializedTeams);
    }

    const serializedRegistry = JSON.stringify(registry);
    if (localStorage.getItem('mitnode_registry') !== serializedRegistry) {
      localStorage.setItem('mitnode_registry', serializedRegistry);
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mitnode_teams' && e.newValue) {
        const incoming = JSON.parse(e.newValue);
        setTeams(prev => JSON.stringify(prev) === e.newValue ? prev : incoming);
      }
      if (e.key === 'mitnode_registry' && e.newValue) {
        const incoming = JSON.parse(e.newValue);
        setRegistry(prev => JSON.stringify(prev) === e.newValue ? prev : incoming);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [teams, registry]);

  const handleRoleSelection = (selectedRole: UserRole) => {
    let currentName = mentorName;
    if (selectedRole === 'mentor' && !currentName) {
      currentName = MENTOR_IDENTITIES[0];
      setMentorName(currentName);
      localStorage.setItem('mitnode_mentor_name', currentName);
    }
    setRole(selectedRole);
    localStorage.setItem('mitnode_role', selectedRole || '');
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('mitnode_role');
  };

  const updateTeamStatus = (teamId: string, status: TeamStatus) => {
    // Ensure we have a mentor name before proceeding
    let activeName = mentorName;
    if (status === 'busy' && !activeName) {
      activeName = MENTOR_IDENTITIES[0]; // Default to first zone
      setMentorName(activeName);
      localStorage.setItem('mitnode_mentor_name', activeName);
    }

    // Determine current stage from booth name (e.g., 'Booth A1' -> 'A')
    const currentGroup = activeName.startsWith('Booth ') ? activeName.charAt(6) : null;

    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === teamId) {
          if (status === 'busy') {
            return {
              ...t,
              status: 'busy',
              mentorId: mentorId,
              mentorName: activeName,
              startTime: Date.now()
            };
          }
          if (status === 'done') {
            const completed = t.completedStages || [];
            const newCompleted = currentGroup && !completed.includes(currentGroup) 
              ? [...completed, currentGroup] 
              : completed;

            return {
              ...t,
              status: 'done',
              lastVisited: Date.now(),
              completedStages: newCompleted
            };
          }
          return { ...t, status: 'idle' };
        }
        return t;
      });
      return updated;
    });
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6 font-sans relative z-[9999]">
        <div className="w-full max-w-sm space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black w-24 h-24 rounded-sm mx-auto flex items-center justify-center border-4 border-[#A31F34] shadow-[10px_10px_0px_rgba(163,31,52,0.2)]"
            >
              <GraduationCap className="w-12 h-12 text-white" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">MITNODE HK</h1>
              <p className="text-black/40 text-[10px] font-mono uppercase tracking-[0.4em]">Dispatch Protocol v2.4</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#A31F34] font-black border-b border-gray-100 pb-2">Select Access Level</p>
            
            <button
              onClick={() => handleRoleSelection('mentor')}
              className="w-full group bg-white border-2 border-black p-6 rounded-sm flex items-center justify-between hover:bg-gray-50 transition-all text-left shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black p-3 rounded-sm">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter italic">Mentor</h3>
                  <p className="text-gray-400 text-xs font-serif italic">Access team booths & timer</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:text-[#A31F34] transition-all" />
            </button>

            <button
              onClick={() => handleRoleSelection('coordinator')}
              className="w-full group bg-white border-2 border-black p-6 rounded-sm flex items-center justify-between hover:bg-gray-50 transition-all text-left shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black p-3 rounded-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter italic">Coordinator</h3>
                  <p className="text-gray-400 text-xs font-serif italic">Bird's-eye view & dispatch</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:text-[#A31F34] transition-all" />
            </button>
          </div>

          <div className="pt-12 text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">Massachusetts Institute of Technology</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    waiting: teams.filter(t => t.status === 'idle').length,
    completed: teams.filter(t => t.status === 'done').length,
  };

  const clearAllData = () => {
    if (window.confirm('CRITICAL: This will wipe all session assignments and reset team progress. Continue?')) {
      if (window.confirm('ARE YOU ABSOLUTELY SURE? This action is IRREVERSIBLE and will reset everything for the next session.')) {
        // Clear storage
        localStorage.removeItem('mitnode_registry');
        localStorage.removeItem('mitnode_teams');
        
        // Force reload to ensure everything is reset from scratch
        window.location.reload();
      }
    }
  };

  return (
    <Layout 
      role={role} 
      onLogout={handleLogout} 
      onRoleChange={(r) => handleRoleSelection(r)} 
      mentorName={mentorName}
      onNameChange={(name) => {
        setMentorName(name);
        localStorage.setItem('mitnode_mentor_name', name);
      }}
      stats={stats}
    >
      <AnimatePresence mode="wait">
        {role === 'mentor' ? (
          <motion.div
            key="mentor"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <MentorView 
              teams={teams} 
              onUpdateTeam={updateTeamStatus} 
              mentorId={mentorId}
              mentorName={mentorName}
              registry={registry}
              onClearAllData={clearAllData}
            />
          </motion.div>
        ) : (
          <motion.div
            key="coordinator"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <CoordinatorView 
              teams={teams} 
              registry={registry}
              onRegistryChange={setRegistry}
              mentorName={mentorName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

