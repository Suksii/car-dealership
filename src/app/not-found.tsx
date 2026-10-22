import Button from "@/features/shared/components/ui/Button";
import { LogoMark } from "@/features/shared/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="container-narrow flex flex-col items-center gap-4 py-20 text-center md:py-28">
      <LogoMark size={88} className="mb-2 opacity-15 grayscale" />
      <p className="eyebrow text-muted">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Stranica nije pronađena</h1>
      <p className="text-muted max-w-md">Oglas je možda uklonjen ili je link pogrešan.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button href="/automobili">Pogledaj sve automobile</Button>
        <Button href="/" variant="outline">
          Početna
        </Button>
      </div>
    </div>
  );
}
