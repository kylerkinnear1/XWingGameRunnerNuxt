import type { SquadReadDto } from '#shared/squad-dto';

export const useSquadEditor = () => {
  const selectedSquad = useState<SquadReadDto | null>('selectedSquad', () => null);
  const refreshCallback = useState<(() => Promise<void>) | null>('squadListRefresh', () => null);
  
  const selectSquad = (squad: SquadReadDto | null) => {
    selectedSquad.value = squad;
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
    selectSquad,
    registerRefresh,
    refreshList
  };
};