export type GameSummaryResponseDto = {
  games: readonly GameSummaryDto[];
};

export type GameSummaryDto = {
  id: string;
  player1Id: string;
  player2Id: string;
  player1SquadId: string;
  player2SquadId: string;
  createdAt: Date;
  updatedAt: Date;
};
