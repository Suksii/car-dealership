import Button from "@/features/shared/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-narrow flex flex-col items-start gap-4 py-24">
      <p className="eyebrow text-muted">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Stranica nije pronađena</h1>
      <p className="text-muted">Oglas je možda uklonjen ili je link pogrešan.</p>
      <Button href="/automobili">Pogledaj sve automobile</Button>
    </div>
  );
}
