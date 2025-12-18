// schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const factionEnum = pgEnum("faction", ["rebel", "scum", "empire"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issuer: varchar("issuer", { length: 512 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  }
);

export const squads = pgTable(
  "squads",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }).notNull(),
    faction: factionEnum("faction").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  }
);

export const squadShips = pgTable(
  "squad_ships",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    squadId: uuid("squad_id")
      .notNull()
      .references(() => squads.id, { onDelete: "cascade" }),
    shipTemplateId: varchar("ship_template_id", { length: 128 }).notNull(),
    pilotId: varchar("pilot_id", { length: 128 }),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  }
);

export const shipUpgrades = pgTable(
  "ship_upgrades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipId: uuid("ship_id")
      .notNull()
      .references(() => squadShips.id, { onDelete: "cascade" }),
    upgradeId: varchar("upgrade_id", { length: 128 }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at").notNull(),
  }
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    player1Id: uuid("player1_id").references(() => users.id),
    player2Id: uuid("player2_id").references(() => users.id),

    player1SquadId: uuid("player1_squad_id").references(() => squads.id),
    player2SquadId: uuid("player2_squad_id").references(() => squads.id),

    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  }
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    sequence: integer("sequence").notNull(),
  }
);

export const usersRelations = relations(users, ({ many }) => ({
  squads: many(squads),
  gamesAsPlayer1: many(games, { relationName: "player1" }),
  gamesAsPlayer2: many(games, { relationName: "player2" }),
}));

export const squadsRelations = relations(squads, ({ one, many }) => ({
  user: one(users, { fields: [squads.userId], references: [users.id] }),
  ships: many(squadShips),
  gamesAsPlayer1: many(games, { relationName: "player1Squad" }),
  gamesAsPlayer2: many(games, { relationName: "player2Squad" }),
}));

export const squadShipsRelations = relations(squadShips, ({ one, many }) => ({
  squad: one(squads, { fields: [squadShips.squadId], references: [squads.id] }),
  upgrades: many(shipUpgrades),
}));

export const shipUpgradesRelations = relations(shipUpgrades, ({ one }) => ({
  ship: one(squadShips, { fields: [shipUpgrades.shipId], references: [squadShips.id] }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  player1: one(users, {
    fields: [games.player1Id],
    references: [users.id],
    relationName: "player1",
  }),
  player2: one(users, {
    fields: [games.player2Id],
    references: [users.id],
    relationName: "player2",
  }),
  player1Squad: one(squads, {
    fields: [games.player1SquadId],
    references: [squads.id],
    relationName: "player1Squad",
  }),
  player2Squad: one(squads, {
    fields: [games.player2SquadId],
    references: [squads.id],
    relationName: "player2Squad",
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  game: one(games, { fields: [activities.gameId], references: [games.id] }),
}));
