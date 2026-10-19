import { SITE } from "@/config/site";
import LegalPage from "@/features/legal/components/LegalPage";

export default function TermsPage() {
  const who = `${SITE.operator.name}, ${SITE.operator.city}`;
  return (
    <LegalPage title="Uslovi korišćenja" intro={`Ovi uslovi važe za sve posjetioce i korisnike sajta ${SITE.name}.`}>
      <h2>1. Ko stoji iza sajta</h2>
      <p>
        {`Sajt ${SITE.name} (${SITE.domain}) vodi ${who} (u daljem tekstu „mi“). Kontakt: `}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>2. Šta je sajt</h2>
      <p>
        {`${SITE.name} je oglasnik: autoplacevi objavljuju vozila koja prodaju, a posjetioci ih pregledaju i kontaktiraju
        plac direktno. Mi nismo strana u kupoprodaji, ne prodajemo vozila, ne posredujemo u plaćanju i ne garantujemo
        za stanje vozila, tačnost oglasa ni za ponašanje prodavca ili kupca.`}
      </p>

      <h2>3. Nalog</h2>
      <ul>
        <li>Nalog može otvoriti punoljetno lice sa tačnim podacima. Jedan nalog po osobi, lozinku čuvaš ti.</li>
        <li>Možemo privremeno ili trajno ukinuti nalog koji krši ove uslove, bez prethodne najave.</li>
        <li>Nalog možeš obrisati slanjem zahtjeva na naš email; podaci se brišu u roku od 30 dana.</li>
      </ul>

      <h2>4. Pravila za autoplaceve</h2>
      <ul>
        <li>
          Plac registruje odgovorno lice sa stvarnim podacima o firmi, adresi i telefonu. Plac objavljujemo kad ga
          odobrimo.
        </li>
        <li>
          Oglas smije sadržati samo vozilo koje plac stvarno nudi, sa tačnom cijenom, kilometražom, godištem i stanjem
          (carina, udaranost).
        </li>
        <li>
          Prodato ili povučeno vozilo plac označava kao prodato u roku od 3 dana. Oglas automatski ističe posle 60 dana
          i može se obnoviti.
        </li>
        <li>
          Fotografije moraju prikazivati baš to vozilo i plac mora imati pravo da ih objavi. Objavom nam daješ
          neisključivo pravo da ih prikazujemo, umanjujemo i obrađujemo radi prikaza na sajtu i u dijeljenju linkova.
        </li>
        <li>
          Nije dozvoljeno: lažne cijene radi privlačenja, isti auto u više oglasa, oglasi za vozila koja nisu na placu,
          kontakt podaci u fotografijama, bilo kakav sadržaj koji krši zakon ili tuđa prava.
        </li>
        <li>
          Možemo skinuti oglas ili cijeli plac koji krši pravila, bez obrazloženja. Prijave posjetilaca provjeravamo i o
          ishodu ne moramo obavještavati.
        </li>
      </ul>

      <h2>5. Cijene i naplata</h2>
      <ul>
        <li>
          Objavljivanje je trenutno <strong>besplatno</strong> za autoplaceve. Nema skrivenih troškova.
        </li>
        <li>
          Uvođenje naplate ili promjenu cijena najavljujemo najmanje 30 dana unaprijed emailom i u panelu. Ko ne
          prihvati novu cijenu, može prestati da koristi sajt bez ikakve obaveze; već objavljeni oglasi se tada skidaju.
        </li>
        <li>Nema ekskluzive: plac može istovremeno oglašavati bilo gdje drugo.</li>
      </ul>

      <h2>6. Pravila za posjetioce i kupce</h2>
      <ul>
        <li>
          Podatke iz oglasa koristiš samo da stupiš u kontakt sa prodavcem radi kupovine. Zabranjeno je masovno
          preuzimanje oglasa, slanje reklama prodavcima ili bilo kakva automatizovana obrada bez našeg pismenog
          odobrenja.
        </li>
        <li>
          Prije kupovine provjeri vozilo i dokumentaciju. Mi ne odgovaramo za štetu nastalu iz odnosa kupca i prodavca.
        </li>
        <li>Lažne prijave oglasa i zloupotreba funkcija sajta vode ukidanju naloga.</li>
      </ul>

      <h2>7. Statistika i dostupnost</h2>
      <p>
        Bilježimo preglede oglasa i klikove na telefon, Viber i WhatsApp, bez identiteta posjetioca, i te brojke
        prikazujemo placu. Trudimo se da sajt radi stalno, ali ne garantujemo neprekidnu dostupnost i možemo ga
        mijenjati ili ugasiti dio funkcija uz razumnu najavu.
      </p>

      <h2>8. Odgovornost</h2>
      <p>
        Sajt koristiš na sopstvenu odgovornost. U mjeri u kojoj zakon dozvoljava, ne odgovaramo za posrednu štetu,
        izgubljenu dobit ni za sadržaj koji objave korisnici. Za sadržaj oglasa odgovara plac koji ga je objavio.
      </p>

      <h2>9. Izmjene i pravo</h2>
      <p>
        Uslove možemo mijenjati; nova verzija važi od datuma na vrhu stranice, a bitne promjene najavljujemo emailom.
        Primjenjuje se pravo Crne Gore, a za sporove je nadležan sud u Podgorici.
      </p>
    </LegalPage>
  );
}
