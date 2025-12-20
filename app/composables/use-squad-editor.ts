import type { SquadReadDto, PilotDto } from '#shared/squad-dto';

export const useSquadEditor = () => {
  const selectedSquad = useState<SquadReadDto | null>('selectedSquad', () => null);
  const formPilots = useState<PilotDto[]>('formPilots', () => []);
  const refreshCallback = useState<(() => Promise<void>) | null>('squadListRefresh', () => null);
  
  const selectSquad = (squad: SquadReadDto | null) => {
    selectedSquad.value = squad;
    // Initialize form pilots from selected squad
    formPilots.value = squad?.pilots ? [...squad.pilots] : [];
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
    selectSquad,
    addPilot,
    removePilot,
    registerRefresh,
    refreshList
  };
};