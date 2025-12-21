import type { SquadReadDto, PilotDto } from '#shared/squad-dto';

export const useSquadEditor = () => {
  const selectedSquad = useState<SquadReadDto | null>('selectedSquad', () => null);
  const formPilots = useState<PilotDto[]>('formPilots', () => []);
  const refreshCallback = useState<(() => Promise<void>) | null>('squadListRefresh', () => null);
  const lastSavedPilots = useState<PilotDto[]>('lastSavedPilots', () => []);
  const pointLimit = useState<number>('squadPointLimit', () => 100);
  
  const hasUnsavedChanges = computed(() => {
    if (!selectedSquad.value) return false;
    
    // Compare current form pilots with last saved state
    if (formPilots.value.length !== lastSavedPilots.value.length) return true;
    
    // Check if pilot IDs match
    const currentIds = formPilots.value.map(p => p.pilotId).sort();
    const savedIds = lastSavedPilots.value.map(p => p.pilotId).sort();
    
    return JSON.stringify(currentIds) !== JSON.stringify(savedIds);
  });
  
  const selectSquad = (squad: SquadReadDto | null) => {
    selectedSquad.value = squad;
    // Initialize form pilots from selected squad, ensuring upgradeIds is always an array
    formPilots.value = squad?.pilots ? squad.pilots.map(p => ({
      pilotId: p.pilotId,
      upgradeIds: p.upgradeIds || []
    })) : [];
    lastSavedPilots.value = squad?.pilots ? squad.pilots.map(p => ({
      pilotId: p.pilotId,
      upgradeIds: p.upgradeIds || []
    })) : [];
  };
  
  const closeDrawer = () => {
    selectedSquad.value = null;
    formPilots.value = [];
    lastSavedPilots.value = [];
  };
  
  const markAsSaved = () => {
    lastSavedPilots.value = [...formPilots.value];
  };
  
  const addPilot = (pilotId: string) => {
    // Check if pilot already exists
    if (!formPilots.value.some(p => p.pilotId === pilotId)) {
      formPilots.value.push({
        pilotId,
        upgradeIds: []
      });
    }
  };
  
  const removePilot = (pilotId: string) => {
    formPilots.value = formPilots.value.filter(p => p.pilotId !== pilotId);
  };
  
  const registerRefresh = (callback: () => Promise<void>) => {
    refreshCallback.value = callback;
  };
  
  const refreshList = async () => {
    if (refreshCallback.value) {
      await refreshCallback.value();
    }
  };
  
  return {
    selectedSquad: readonly(selectedSquad),
    formPilots,
    hasUnsavedChanges: readonly(hasUnsavedChanges),
    pointLimit,
    selectSquad,
    closeDrawer,
    markAsSaved,
    addPilot,
    removePilot,
    registerRefresh,
    refreshList
  };
};