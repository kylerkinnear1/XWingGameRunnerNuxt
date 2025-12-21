import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const factionEnum = pgEnum("faction", ["rebel", "scum", "empire"]);

export const squads = pgTable("squads", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Change from uuid to text
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  faction: factionEnum("faction").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const squadShips = pgTable("squad_ships", {
  id: uuid("id").primaryKey().defaultRandom(),
  squadId: uuid("squad_id")
    .notNull()
    .references(() => squads.id, { onDelete: "cascade" }),
  shipTemplateId: varchar("ship_template_id", { length: 128 }).notNull(),
  pilotId: varchar("pilot_id", { length: 128 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const shipUpgrades = pgTable("ship_upgrades", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipId: uuid("ship_id")
    .notNull()
    .references(() => squadShips.id, { onDelete: "cascade" }),
  upgradeId: varchar("upgrade_id", { length: 128 }).notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Change from uuid to text
  player1Id: text("player1_id").references(() => user.id),
  player2Id: text("player2_id").references(() => user.id),

  player1SquadId: uuid("player1_squad_id").references(() => squads.id),
  player2SquadId: uuid("player2_squad_id").references(() => squads.id),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
});
