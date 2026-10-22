export const FUEL = {
  petrol: "Benzin",
  diesel: "Dizel",
  hybrid: "Hibrid",
  plugin_hybrid: "Plug-in hibrid",
  electric: "Električni",
  lpg: "Benzin + plin (LPG)",
  cng: "Metan (CNG)",
} as const;
export const TRANSMISSION = { manual: "Manuelni", automatic: "Automatski" } as const;
export const BODY = {
  hatchback: "Hečbek",
  sedan: "Limuzina",
  wagon: "Karavan",
  suv: "SUV / džip",
  coupe: "Kupe",
  convertible: "Kabriolet",
  minivan: "Monovolumen",
  pickup: "Pickup",
  van: "Kombi",
} as const;
export const DRIVE = { fwd: "Prednji", rwd: "Zadnji", awd: "4x4" } as const;
export const CONDITION = { new: "Novo", used: "Polovno" } as const;
export const ORIGIN = { domestic: "Domaće (kupljeno u CG)", imported: "Uvoz" } as const;
export const EMISSION = {
  euro6: "Euro 6",
  euro5: "Euro 5",
  euro4: "Euro 4",
  euro3: "Euro 3",
  euro2: "Euro 2",
  euro1: "Euro 1",
} as const;
/** Brzi filteri (prekidači) na listi: ključ u ListingFilters -> labela. */
export const FLAGS = {
  verifiedDealer: "Samo provjereni placevi",
  customs: "Ocarinjen",
  undamaged: "Neoštećen",
  firstOwner: "Prvi vlasnik",
  serviceBook: "Servisna knjiga",
  tradeIn: "Moguća zamjena",
  financing: "Kredit / lizing",
  warranty: "Sa garancijom",
} as const;
export const CONTACT_TYPE = { phone: "Pozivi", viber: "Viber", whatsapp: "WhatsApp", email: "Email" } as const;
export const LISTING_STATUS = {
  draft: "Nacrt",
  active: "Aktivan",
  sold: "Prodat",
  expired: "Istekao",
  removed: "Obrisan",
} as const;
export const DEALER_STATUS = { pending: "Čeka odobrenje", active: "Aktivan", suspended: "Suspendovan" } as const;
export const FEATURE_GROUP = {
  safety: "Sigurnost",
  comfort: "Komfor",
  multimedia: "Multimedija",
  exterior: "Eksterijer",
  other: "Ostalo",
} as const;

export type FuelKey = keyof typeof FUEL;
export type TransmissionKey = keyof typeof TRANSMISSION;
export type BodyKey = keyof typeof BODY;
export type DriveKey = keyof typeof DRIVE;
export type OriginKey = keyof typeof ORIGIN;
export type EmissionKey = keyof typeof EMISSION;
export type FlagKey = keyof typeof FLAGS;
export type ContactTypeKey = keyof typeof CONTACT_TYPE;
