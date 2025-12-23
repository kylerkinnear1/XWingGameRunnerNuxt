import type { ShipStateDto } from "#shared/game-state-dto";
import type { SquadReadDto } from "#shared/squad-dto";
import type { CardsDto } from "#shared/cards";
import type { CurrentGameState } from "#shared/game-state-dto";

export const useGameShips = () => {
  const createShipFromSquad = (
    shipDto: { id: string; pilotId: string; upgradeIds: string[] },
    playerId: string,
    cards: CardsDto | null
  ): { ship: ShipStateDto; pilot: any } | null => {
    if (!cards) return null;
    const pilot = cards.pilots.find((p) => p.id === shipDto.pilotId);
    if (!pilot) return null;

    const shipState: ShipStateDto = {
      shipId: shipDto.id,
      playerId,
      pilotSkill: pilot.pilotSkill,
      hull: pilot.hull,
      shields: pilot.shields,
      attack: pilot.attack,
      agility: pilot.agility,
      tokens: [],
      faceUpDamage: [],
      faceDownDamage: 0,
      weapons: [],
      upgrades: shipDto.upgradeIds.map((id) => ({
        upgradeId: id,
        faceUp: true,
      })),
      isPlaced: false,
      isDestroyed: false,
      didBump: false,
      dialAssigned: null,
      isHalfPointsScored: false,
      hasActivated: false,
      collisions: [],
      attackTargetShipId: null,
      hasAttacked: false,
      maneuvers: pilot.maneuvers,
    };

    return { ship: shipState, pilot };
  };

  const getPlayerShips = (
    playerSquad: SquadReadDto | null,
    gameData: { player1Id: string; player2Id: string } | null,
    playerId: string,
    currentGameState: CurrentGameState | null,
    cards: CardsDto | null
  ) => {
    if (!playerSquad || !gameData) return [];

    if (currentGameState && currentGameState.ships.length > 0) {
      return currentGameState.ships
        .filter((s) => s.playerId === playerId)
        .map((shipState) => {
          const shipDto = playerSquad.ships.find(
            (s) => s.id === shipState.shipId
          );
          const pilot = cards?.pilots.find((p) => p.id === shipDto?.pilotId);
          return { ship: shipState, pilot };
        });
    }

    return playerSquad.ships
      .map((shipDto) => createShipFromSquad(shipDto, playerId, cards))
      .filter(
        (s): s is { ship: ShipStateDto; pilot: any } => s !== null
      );
  };

  const getTotalHull = (
    shipId: string,
    squads: SquadReadDto[],
    cards: CardsDto | null
  ): number => {
    const squad = squads.find((s) =>
      s.ships.some((ship) => ship.id === shipId)
    );
    if (!squad) return 0;

    const squadShip = squad.ships.find((s) => s.id === shipId);
    if (!squadShip) return 0;

    const pilot = cards?.pilots.find((p) => p.id === squadShip.pilotId);
    return pilot?.hull || 0;
  };

  return {
    createShipFromSquad,
    getPlayerShips,
    getTotalHull,
  };
};

