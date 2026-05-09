import { Team } from './types';

export const getInitialTeams = (): Team[] => Array.from({ length: 30 }, (_, i) => {
  const teamNumber = i + 1;
  let boothGroup = "A";
  let groupStart = 1;

  if (teamNumber <= 8) {
    boothGroup = "A";
    groupStart = 1;
  } else if (teamNumber <= 16) {
    boothGroup = "B";
    groupStart = 9;
  } else {
    boothGroup = "C";
    groupStart = 17;
  }

  const boothNum = ((teamNumber - groupStart) % 3) + 1;
  const boothLabel = `${boothGroup}${boothNum}`;

  return {
    id: `team-${teamNumber}`,
    teamNumber,
    boothLabel,
    status: 'idle',
    completedStages: []
  };
});

export const BOOTH_COLORS = {
  A: 'bg-[#FFD1DC] text-black border-black',
  B: 'bg-[#D1E9FF] text-black border-black',
  C: 'bg-[#D1FFD7] text-black border-black',
  NONE: 'bg-white text-gray-400 border-gray-200'
};

export const MENTOR_IDENTITIES = [
  'Booth A1',
  'Booth A2',
  'Booth A3',
  'Booth B1',
  'Booth B2',
  'Booth B3',
  'Booth C1',
  'Booth C2',
  'Booth C3',
  'Senior Coordinator',
  'Lead Dispatcher'
];

export const BOOTHS = MENTOR_IDENTITIES.filter(id => id.startsWith('Booth '));

export const MIT_RED = '#A31F34';
export const MIT_GRAY = '#8A8B8C';


