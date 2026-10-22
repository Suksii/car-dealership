import {
  pgTable,
  pgEnum,
  uuid,
  text,
  smallint,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  smallserial,
  serial,
  bigserial,
  primaryKey,
  unique,
  index,
  uniqueIndex,
  check,
  customType,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// citext tip (Postgres extension) za email bez razlike velikih/malih slova
const citext = customType<{ data: string }>({ dataType: () => "citext" });

// ---------------------------------------------------------------------
// ENUM tipovi
// ---------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["admin", "dealer", "private"]);
export const dealerStatusEnum = pgEnum("dealer_status", ["pending", "active", "suspended"]);
export const listingStatusEnum = pgEnum("listing_status", ["draft", "active", "sold", "expired", "removed"]);
export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "hybrid",
  "plugin_hybrid",
  "electric",
  "lpg",
  "cng",
]);
export const transmissionEnum = pgEnum("transmission", ["manual", "automatic"]);
export const bodyTypeEnum = pgEnum("body_type", [
  "hatchback",
  "sedan",
  "wagon",
  "suv",
  "coupe",
  "convertible",
  "minivan",
  "pickup",
  "van",
]);
export const driveTypeEnum = pgEnum("drive_type", ["fwd", "rwd", "awd"]);
export const vehicleConditionEnum = pgEnum("vehicle_condition", ["new", "used"]);
export const vehicleOriginEnum = pgEnum("vehicle_origin", ["domestic", "imported"]);
export const emissionClassEnum = pgEnum("emission_class", ["euro1", "euro2", "euro3", "euro4", "euro5", "euro6"]);
export const contactTypeEnum = pgEnum("contact_type", ["phone", "viber", "whatsapp", "email"]);
export const reportStatusEnum = pgEnum("report_status", ["open", "resolved", "dismissed"]);

// ---------------------------------------------------------------------
// ŠIFARNICI
// ---------------------------------------------------------------------
export const cities = pgTable("cities", {
  id: smallserial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const makes = pgTable("makes", {
  id: smallserial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isPopular: boolean("is_popular").notNull().default(false),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const models = pgTable(
  "models",
  {
    id: serial("id").primaryKey(),
    makeId: smallint("make_id")
      .notNull()
      .references(() => makes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [unique().on(t.makeId, t.slug)],
);

export const features = pgTable("features", {
  id: smallserial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  group: text("group").notNull(), // safety | comfort | multimedia | exterior | other
  sortOrder: smallint("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------
// KORISNICI
// ---------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: citext("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("private"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  isBlocked: boolean("is_blocked").notNull().default(false),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.provider, t.providerAccountId)],
);

// ---------------------------------------------------------------------
// AUTOPLACEVI
// ---------------------------------------------------------------------
export const dealers = pgTable(
  "dealers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    logoKey: text("logo_key"),
    coverKey: text("cover_key"),
    cityId: smallint("city_id")
      .notNull()
      .references(() => cities.id),
    address: text("address"),
    lat: numeric("lat", { precision: 9, scale: 6 }),
    lng: numeric("lng", { precision: 9, scale: 6 }),
    phone: text("phone").notNull(),
    phone2: text("phone2"),
    viber: text("viber"),
    whatsapp: text("whatsapp"),
    email: citext("email"),
    website: text("website"),
    workingHours: jsonb("working_hours").$type<Record<string, string | null>>(),
    status: dealerStatusEnum("status").notNull().default("pending"),
    isFeatured: boolean("is_featured").notNull().default(false),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    /** PIB firme (8 cifara); obavezan pri registraciji placa. */
    taxId: text("tax_id"),
    /** Kad je admin potvrdio firmu u registru (oznaka „Provjeren plac"); null = nije provjeren. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    activeListingsCount: integer("active_listings_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("dealers_city_status_idx").on(t.cityId, t.status), uniqueIndex("dealers_owner_uidx").on(t.ownerUserId)],
);

export const dealerMembers = pgTable(
  "dealer_members",
  {
    dealerId: uuid("dealer_id")
      .notNull()
      .references(() => dealers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.dealerId, t.userId] })],
);

// ---------------------------------------------------------------------
// OGLASI
// ---------------------------------------------------------------------
export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicId: text("public_id").notNull().unique(),
    slug: text("slug").notNull(),

    dealerId: uuid("dealer_id").references(() => dealers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    makeId: smallint("make_id")
      .notNull()
      .references(() => makes.id),
    modelId: integer("model_id")
      .notNull()
      .references(() => models.id),
    variant: text("variant"),
    year: smallint("year").notNull(),
    mileageKm: integer("mileage_km").notNull(),
    condition: vehicleConditionEnum("condition").notNull().default("used"),
    fuel: fuelTypeEnum("fuel").notNull(),
    transmission: transmissionEnum("transmission").notNull(),
    bodyType: bodyTypeEnum("body_type").notNull(),
    drive: driveTypeEnum("drive"),
    engineCc: smallint("engine_cc"),
    powerKw: smallint("power_kw"),
    doors: smallint("doors"),
    seats: smallint("seats"),
    color: text("color"),
    vin: text("vin"),
    registeredUntil: date("registered_until"),
    customsCleared: boolean("customs_cleared").notNull().default(true),
    isDamaged: boolean("is_damaged").notNull().default(false),
    firstOwner: boolean("first_owner").notNull().default(false),
    serviceBook: boolean("service_book").notNull().default(false),
    origin: vehicleOriginEnum("origin"),
    importCountry: text("import_country"),
    emissionClass: emissionClassEnum("emission_class"),

    priceEur: integer("price_eur").notNull(),
    priceNegotiable: boolean("price_negotiable").notNull().default(false),
    priceOnRequest: boolean("price_on_request").notNull().default(false),
    /** Cijena prije posljednjeg sniženja (za oznaku „Cijena snižena"); null kad nije snižena. */
    previousPriceEur: integer("previous_price_eur"),
    priceChangedAt: timestamp("price_changed_at", { withTimezone: true }),
    tradeIn: boolean("trade_in").notNull().default(false),
    financing: boolean("financing").notNull().default(false),
    warrantyMonths: smallint("warranty_months"),

    description: text("description"),
    cityId: smallint("city_id")
      .notNull()
      .references(() => cities.id),

    status: listingStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    viewsCount: integer("views_count").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("listings_year_check", sql`${t.year} BETWEEN 1950 AND 2100`),
    check("listings_mileage_check", sql`${t.mileageKm} >= 0`),
    check("listings_price_check", sql`${t.priceEur} >= 0`),
    index("listings_active_make_model_idx")
      .on(t.makeId, t.modelId)
      .where(sql`${t.status} = 'active'`),
    index("listings_active_price_idx")
      .on(t.priceEur)
      .where(sql`${t.status} = 'active'`),
    index("listings_active_year_idx")
      .on(t.year)
      .where(sql`${t.status} = 'active'`),
    index("listings_active_published_idx")
      .on(t.publishedAt.desc())
      .where(sql`${t.status} = 'active'`),
    index("listings_active_city_idx")
      .on(t.cityId)
      .where(sql`${t.status} = 'active'`),
    index("listings_dealer_status_idx").on(t.dealerId, t.status),
    index("listings_user_idx").on(t.userId),
    index("listings_expires_idx")
      .on(t.expiresAt)
      .where(sql`${t.status} = 'active'`),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    width: smallint("width"),
    height: smallint("height"),
    sortOrder: smallint("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("listing_images_listing_idx").on(t.listingId, t.sortOrder)],
);

export const listingFeatures = pgTable(
  "listing_features",
  {
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    featureId: smallint("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.featureId] })],
);

// ---------------------------------------------------------------------
// KORISNIČKE AKCIJE
// ---------------------------------------------------------------------
export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })],
);

export const contactClicks = pgTable(
  "contact_clicks",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    dealerId: uuid("dealer_id").references(() => dealers.id, { onDelete: "cascade" }),
    type: contactTypeEnum("type").notNull(),
    visitorId: text("visitor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("contact_clicks_dealer_time_idx").on(t.dealerId, t.createdAt),
    index("contact_clicks_listing_time_idx").on(t.listingId, t.createdAt),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reporterUserId: uuid("reporter_user_id").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason").notNull(), // scam | sold | wrong_info | other
    message: text("message"),
    status: reportStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reports_open_idx")
      .on(t.status, t.createdAt)
      .where(sql`${t.status} = 'open'`),
  ],
);

// ---------------------------------------------------------------------
// RELACIJE (za db.query.* API)
// ---------------------------------------------------------------------
export const makesRelations = relations(makes, ({ many }) => ({ models: many(models) }));
export const modelsRelations = relations(models, ({ one }) => ({
  make: one(makes, { fields: [models.makeId], references: [makes.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  listings: many(listings),
  favorites: many(favorites),
}));

export const dealersRelations = relations(dealers, ({ one, many }) => ({
  owner: one(users, { fields: [dealers.ownerUserId], references: [users.id] }),
  city: one(cities, { fields: [dealers.cityId], references: [cities.id] }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  dealer: one(dealers, { fields: [listings.dealerId], references: [dealers.id] }),
  user: one(users, { fields: [listings.userId], references: [users.id] }),
  make: one(makes, { fields: [listings.makeId], references: [makes.id] }),
  model: one(models, { fields: [listings.modelId], references: [models.id] }),
  city: one(cities, { fields: [listings.cityId], references: [cities.id] }),
  images: many(listingImages),
  features: many(listingFeatures),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, { fields: [listingImages.listingId], references: [listings.id] }),
}));

export const listingFeaturesRelations = relations(listingFeatures, ({ one }) => ({
  listing: one(listings, { fields: [listingFeatures.listingId], references: [listings.id] }),
  feature: one(features, { fields: [listingFeatures.featureId], references: [features.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  listing: one(listings, { fields: [reports.listingId], references: [listings.id] }),
  reporter: one(users, { fields: [reports.reporterUserId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  listing: one(listings, { fields: [favorites.listingId], references: [listings.id] }),
}));

// Tipovi za app kod
export type User = typeof users.$inferSelect;
export type Dealer = typeof dealers.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingImage = typeof listingImages.$inferSelect;
