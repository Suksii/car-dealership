CREATE TYPE "public"."emission_class" AS ENUM('euro1', 'euro2', 'euro3', 'euro4', 'euro5', 'euro6');--> statement-breakpoint
CREATE TYPE "public"."vehicle_origin" AS ENUM('domestic', 'imported');--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "service_book" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "origin" "vehicle_origin";--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "import_country" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "emission_class" "emission_class";--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "previous_price_eur" integer;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "price_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "trade_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "financing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "warranty_months" smallint;