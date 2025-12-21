import type { SquadReadDto, ShipDto } from "#shared/squad-dto";

export const useSquadEditor = () => {
  const selectedSquad = useState<SquadReadDto | null>(
    "selectedSquad",
    () => null
  );
  const formShips = useState<ShipDto[]>("formShips", () => []);
  const refreshCallback = useState<(() => Promise<void>) | null>(
    "squadListRefresh",
    () => null
  );
  const lastSavedShips = useState<ShipDto[]>("lastSavedShips", () => []);
  const pointLimit = useState<number>("squadPointLimit", () => 100);

  const hasUnsavedChanges = computed(() => {
    if (!selectedSquad.value) return false;

    // Compare current form ships with last saved state
    if (formShips.value.length !== lastSavedShips.value.length) return true;

    // Check if ship IDs match
    const currentIds = formShips.value.map((s) => s.id || s.pilotId).sort();
    const savedIds = lastSavedShips.value.map((s) => s.id || s.pilotId).sort();

    return JSON.stringify(currentIds) !== JSON.stringify(savedIds);
  });

  const selectSquad = (squad: SquadReadDto | null) => {
    selectedSquad.value = squad;
    // Initialize form ships from selected squad
    formShips.value = squad?.ships ? [...squad.ships] : [];
    lastSavedShips.value = squad?.ships ? [...squad.ships] : [];
  };

  const closeDrawer = () => {
    selectedSquad.value = null;
    formShips.value = [];
    lastSavedShips.value = [];
  };

  const markAsSaved = () => {
    lastSavedShips.value = [...formShips.value];
  };

  const addPilot = (pilotId: string) => {
    // Check if pilot already exists
    if (!formShips.value.some((s) => s.pilotId === pilotId && !s.id)) {
      formShips.value.push({
        id: "", // Will be set by server when saved
        pilotId,
        upgradeIds: [],
      });
    }
  };

  const removePilot = (pilotId: string) => {
    formShips.value = formShips.value.filter((s) => s.pilotId !== pilotId || s.id);
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
    formPilots: formShips, // Keep old name for backward compatibility with components
    formShips,
    hasUnsavedChanges: readonly(hasUnsavedChanges),
    pointLimit,
    selectSquad,
    closeDrawer,
    markAsSaved,
    addPilot,
    removePilot,
    registerRefresh,
    refreshList,
  };
};
