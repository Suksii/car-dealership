import Button from "@/features/shared/components/ui/Button";
import { SITE } from "@/config/site";

export default function HomePage() {
  return (
    <section className="container-page py-16 md:py-24">
      <p className="eyebrow mb-3 text-accent">Crna Gora</p>
      <h1 className="max-w-2xl text-hero leading-hero font-extrabold tracking-tight">{SITE.tagline}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{SITE.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/automobili" size="lg">Svi automobili</Button>
        <Button href="/placevi" variant="outline" size="lg">Autoplacevi</Button>
      </div>
    </section>
  );
}
