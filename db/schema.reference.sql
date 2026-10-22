-- REFERENCA. Izvor istine je src/db/schema.ts + drizzle/ migracije. Ovaj fajl služi samo za čitanje.
-- =====================================================================
-- AUTOPLAC (radni naziv) - šema baze, verzija 1
-- Postgres 15+
-- Redoslijed: šifarnici -> korisnici -> autoplacevi -> oglasi -> ostalo
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- pretraga po tekstu (LIKE/ILIKE sa indeksom)
CREATE EXTENSION IF NOT EXISTS citext;     -- email bez razlike velikih/malih slova

-- ---------------------------------------------------------------------
-- ENUM tipovi
-- ---------------------------------------------------------------------
CREATE TYPE user_role       AS ENUM ('admin', 'dealer', 'private');
CREATE TYPE dealer_status   AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE listing_status  AS ENUM ('draft', 'active', 'sold', 'expired', 'removed');
CREATE TYPE fuel_type       AS ENUM ('petrol', 'diesel', 'hybrid', 'plugin_hybrid', 'electric', 'lpg', 'cng');
CREATE TYPE transmission    AS ENUM ('manual', 'automatic');
CREATE TYPE body_type       AS ENUM ('hatchback', 'sedan', 'wagon', 'suv', 'coupe', 'convertible', 'minivan', 'pickup', 'van');
CREATE TYPE drive_type      AS ENUM ('fwd', 'rwd', 'awd');
CREATE TYPE vehicle_condition AS ENUM ('new', 'used');
CREATE TYPE vehicle_origin  AS ENUM ('domestic', 'imported');
CREATE TYPE emission_class  AS ENUM ('euro1', 'euro2', 'euro3', 'euro4', 'euro5', 'euro6');
CREATE TYPE contact_type    AS ENUM ('phone', 'viber', 'whatsapp', 'email');
CREATE TYPE report_status   AS ENUM ('open', 'resolved', 'dismissed');

-- ---------------------------------------------------------------------
-- ŠIFARNICI
-- ---------------------------------------------------------------------

-- Gradovi / opštine (fiksna lista, ~25 opština CG)
CREATE TABLE cities (
  id          smallserial PRIMARY KEY,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  sort_order  smallint NOT NULL DEFAULT 0
);

-- Marke (Volkswagen, BMW...)
CREATE TABLE makes (
  id          smallserial PRIMARY KEY,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  is_popular  boolean NOT NULL DEFAULT false,   -- prikaz na vrhu filtera
  sort_order  smallint NOT NULL DEFAULT 0
);

-- Modeli (Golf, Passat...) vezani za marku
CREATE TABLE models (
  id          serial PRIMARY KEY,
  make_id     smallint NOT NULL REFERENCES makes(id) ON DELETE CASCADE,
  name        text NOT NULL,
  slug        text NOT NULL,
  UNIQUE (make_id, slug)
);

-- Oprema (klima, navigacija...) grupisana radi prikaza
CREATE TABLE features (
  id          smallserial PRIMARY KEY,
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  "group"     text NOT NULL,            -- 'safety' | 'comfort' | 'multimedia' | 'exterior' | 'other'
  sort_order  smallint NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- KORISNICI
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL UNIQUE,
  password_hash     text,                          -- NULL ako je samo Google prijava
  name              text NOT NULL,
  phone             text,
  role              user_role NOT NULL DEFAULT 'private',
  email_verified_at timestamptz,
  is_blocked        boolean NOT NULL DEFAULT false,
  last_login_at     timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- OAuth nalozi (Auth.js standard: provider + providerAccountId)
CREATE TABLE accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            text NOT NULL,              -- 'google'
  provider_account_id text NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);

-- ---------------------------------------------------------------------
-- AUTOPLACEVI
-- ---------------------------------------------------------------------
CREATE TABLE dealers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  slug           text NOT NULL UNIQUE,            -- /placevi/auto-centar-podgorica
  name           text NOT NULL,
  description    text,
  logo_key       text,                            -- R2 ključ, ne pun URL
  cover_key      text,
  city_id        smallint NOT NULL REFERENCES cities(id),
  address        text,
  lat            numeric(9,6),
  lng            numeric(9,6),
  phone          text NOT NULL,
  phone2         text,
  viber          text,                            -- broj za Viber link, ako je drugačiji
  whatsapp       text,
  email          citext,
  website        text,
  working_hours  jsonb,                           -- {"mon":"08-17","sat":"08-13","sun":null}
  status         dealer_status NOT NULL DEFAULT 'pending',
  is_featured    boolean NOT NULL DEFAULT false,  -- za kasnije pakete
  active_listings_count int NOT NULL DEFAULT 0,   -- denormalizovano, osvježava trigger
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dealers_city_status_idx ON dealers (city_id, status);

-- Više zaposlenih po placu (kasnije; za V1 je dovoljan owner_user_id)
CREATE TABLE dealer_members (
  dealer_id  uuid NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (dealer_id, user_id)
);

-- ---------------------------------------------------------------------
-- OGLASI
-- ---------------------------------------------------------------------
CREATE TABLE listings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id        text NOT NULL UNIQUE,          -- kratak ID za URL, npr. 'a7k3m9' (generiše app)
  slug             text NOT NULL,                 -- 'volkswagen-golf-7-2016' (ne mora biti unique, URL = slug-public_id)

  -- ko prodaje: ili plac ili privatni korisnik (V1: uvijek dealer)
  dealer_id        uuid REFERENCES dealers(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  -- ko je unio

  -- vozilo
  make_id          smallint NOT NULL REFERENCES makes(id),
  model_id         int NOT NULL REFERENCES models(id),
  variant          text,                          -- '2.0 TDI Highline', slobodan tekst
  year             smallint NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  mileage_km       int NOT NULL CHECK (mileage_km >= 0),
  condition        vehicle_condition NOT NULL DEFAULT 'used',
  fuel             fuel_type NOT NULL,
  transmission     transmission NOT NULL,
  body_type        body_type NOT NULL,
  drive            drive_type,
  engine_cc        smallint CHECK (engine_cc > 0),
  power_kw         smallint CHECK (power_kw > 0),
  doors            smallint,
  seats            smallint,
  color            text,
  vin              text,                          -- opciono, za kasniju provjeru
  registered_until date,                          -- do kad je registrovan
  customs_cleared  boolean NOT NULL DEFAULT true, -- ocarinjen
  is_damaged       boolean NOT NULL DEFAULT false,
  first_owner      boolean NOT NULL DEFAULT false,
  service_book     boolean NOT NULL DEFAULT false, -- servisna knjiga
  origin           vehicle_origin,                -- domaće / uvoz
  import_country   text,                          -- samo za uvoz
  emission_class   emission_class,

  -- cijena
  price_eur        int NOT NULL CHECK (price_eur >= 0),
  price_negotiable boolean NOT NULL DEFAULT false,
  price_on_request boolean NOT NULL DEFAULT false,
  previous_price_eur int,                         -- cijena prije sniženja (oznaka „Cijena snižena")
  price_changed_at timestamptz,
  trade_in         boolean NOT NULL DEFAULT false, -- moguća zamjena
  financing        boolean NOT NULL DEFAULT false, -- kredit / lizing
  warranty_months  smallint,                      -- garancija placa

  -- sadržaj
  description      text,
  city_id          smallint NOT NULL REFERENCES cities(id),

  -- status i životni ciklus
  status           listing_status NOT NULL DEFAULT 'draft',
  is_featured      boolean NOT NULL DEFAULT false,
  views_count      int NOT NULL DEFAULT 0,
  published_at     timestamptz,
  expires_at       timestamptz,                   -- published_at + 60 dana, obnova produžava
  sold_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Indeksi za pretragu: skoro svaki upit filtrira status='active'
CREATE INDEX listings_active_make_model_idx ON listings (make_id, model_id) WHERE status = 'active';
CREATE INDEX listings_active_price_idx      ON listings (price_eur)         WHERE status = 'active';
CREATE INDEX listings_active_year_idx       ON listings (year)              WHERE status = 'active';
CREATE INDEX listings_active_published_idx  ON listings (published_at DESC) WHERE status = 'active';
CREATE INDEX listings_active_city_idx       ON listings (city_id)           WHERE status = 'active';
CREATE INDEX listings_dealer_status_idx     ON listings (dealer_id, status);
CREATE INDEX listings_user_idx              ON listings (user_id);
CREATE INDEX listings_expires_idx           ON listings (expires_at) WHERE status = 'active';

-- Slike oglasa
CREATE TABLE listing_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  storage_key text NOT NULL,          -- 'listings/<listing_id>/<image_id>' ; app dodaje sufiks veličine
  width       smallint,
  height      smallint,
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listing_images_listing_idx ON listing_images (listing_id, sort_order);
-- naslovna slika = ona sa najmanjim sort_order

-- Oprema po oglasu (M:N)
CREATE TABLE listing_features (
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  feature_id  smallint NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, feature_id)
);

-- ---------------------------------------------------------------------
-- KORISNIČKE AKCIJE
-- ---------------------------------------------------------------------
CREATE TABLE favorites (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- Klik na telefon / Viber / WhatsApp: statistika za placeve i mjera uspjeha sajta
CREATE TABLE contact_clicks (
  id          bigserial PRIMARY KEY,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  dealer_id   uuid REFERENCES dealers(id) ON DELETE CASCADE,  -- kopija radi bržih izvještaja
  type        contact_type NOT NULL,
  visitor_id  text,                   -- anonimni cookie, da se ne broji 10 klikova istog čovjeka
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contact_clicks_dealer_time_idx  ON contact_clicks (dealer_id, created_at);
CREATE INDEX contact_clicks_listing_time_idx ON contact_clicks (listing_id, created_at);

-- Pregledi po oglasu i lokalnom danu (Europe/Podgorica) — statistika za plac i admina
CREATE TABLE listing_views_daily (
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  dealer_id   uuid REFERENCES dealers(id) ON DELETE CASCADE,
  day         date NOT NULL,
  views       integer NOT NULL DEFAULT 0,
  PRIMARY KEY (listing_id, day)
);
CREATE INDEX listing_views_daily_dealer_day_idx ON listing_views_daily (dealer_id, day);

-- Prijave oglasa (prevara, prodato, pogrešna cijena)
CREATE TABLE reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_user_id  uuid REFERENCES users(id) ON DELETE SET NULL,
  reason            text NOT NULL,     -- 'scam' | 'sold' | 'wrong_info' | 'other'
  message           text,
  status            report_status NOT NULL DEFAULT 'open',
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_open_idx ON reports (status, created_at) WHERE status = 'open';

-- ---------------------------------------------------------------------
-- TRIGGERI
-- ---------------------------------------------------------------------

-- updated_at automatski
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER dealers_updated_at  BEFORE UPDATE ON dealers  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER listings_dealer_count
  AFTER INSERT OR UPDATE OF status, dealer_id OR DELETE ON listings
  FOR EACH ROW EXECUTE FUNCTION refresh_dealer_listing_count();

-- ---------------------------------------------------------------------
-- POGLED za procjenu cijene: prosjek po modelu i godištu iz aktivnih oglasa
-- (osvježava cron jednom dnevno: REFRESH MATERIALIZED VIEW CONCURRENTLY price_stats)
-- ---------------------------------------------------------------------
CREATE MATERIALIZED VIEW price_stats AS
SELECT
  make_id, model_id, year,
  count(*)                                              AS sample_size,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY price_eur) AS median_price,
  percentile_cont(0.25) WITHIN GROUP (ORDER BY price_eur) AS p25_price,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY price_eur) AS p75_price,
  avg(mileage_km)::int                                  AS avg_mileage
FROM listings
WHERE status = 'active' AND price_on_request = false AND price_eur > 500
GROUP BY make_id, model_id, year;
CREATE UNIQUE INDEX price_stats_pk ON price_stats (make_id, model_id, year);
