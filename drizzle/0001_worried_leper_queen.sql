CREATE TABLE "game_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"type" text NOT NULL,
	"step" jsonb NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "player1_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "player2_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "player1_squad_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "player2_squad_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "game_steps" ADD CONSTRAINT "game_steps_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;