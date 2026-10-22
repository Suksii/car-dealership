CREATE TABLE "listing_views_daily" (
	"listing_id" uuid NOT NULL,
	"dealer_id" uuid,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "listing_views_daily_listing_id_day_pk" PRIMARY KEY("listing_id","day")
);
--> statement-breakpoint
ALTER TABLE "listing_views_daily" ADD CONSTRAINT "listing_views_daily_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views_daily" ADD CONSTRAINT "listing_views_daily_dealer_id_dealers_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."dealers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_views_daily_dealer_day_idx" ON "listing_views_daily" USING btree ("dealer_id","day");