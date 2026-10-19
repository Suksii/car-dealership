export const REPORT_REASON = {
  sold: "Vozilo je već prodato",
  wrong_info: "Netačni podaci (cijena, kilometraža, godište…)",
  scam: "Sumnja na prevaru",
  other: "Nešto drugo",
} as const;
export type ReportReason = keyof typeof REPORT_REASON;
export const REPORT_STATUS = { open: "Otvorena", resolved: "Riješena", dismissed: "Odbačena" } as const;
