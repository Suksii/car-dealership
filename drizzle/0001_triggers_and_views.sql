-- updated_at automatski
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER dealers_updated_at  BEFORE UPDATE ON dealers  FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

-- dealers.active_listings_count se održava sam
CREATE OR REPLACE FUNCTION refresh_dealer_listing_count() RETURNS trigger AS $$
DECLARE d uuid;
BEGIN
  FOR d IN SELECT DISTINCT x FROM unnest(ARRAY[OLD.dealer_id, NEW.dealer_id]) AS x WHERE x IS NOT NULL LOOP
    UPDATE dealers SET active_listings_count =
      (SELECT count(*) FROM listings WHERE dealer_id = d AND status = 'active')
    WHERE id = d;
  END LOOP;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER listings_dealer_count
  AFTER INSERT OR UPDATE OF status, dealer_id OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION refresh_dealer_listing_count();--> statement-breakpoint

-- Procjena cijene: medijan i kvartili po marki, modelu i godištu (cron: REFRESH MATERIALIZED VIEW CONCURRENTLY price_stats)
CREATE MATERIALIZED VIEW price_stats AS
SELECT
  make_id, model_id, year,
  count(*)::int                                           AS sample_size,
  percentile_cont(0.5)  WITHIN GROUP (ORDER BY price_eur)  AS median_price,
  percentile_cont(0.25) WITHIN GROUP (ORDER BY price_eur)  AS p25_price,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY price_eur)  AS p75_price,
  avg(mileage_km)::int                                    AS avg_mileage
FROM listings
WHERE status = 'active' AND price_on_request = false AND price_eur > 500
GROUP BY make_id, model_id, year;--> statement-breakpoint
CREATE UNIQUE INDEX price_stats_pk ON price_stats (make_id, model_id, year);
