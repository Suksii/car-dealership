import { SITE } from "@/config/site";
import LegalPage from "@/features/legal/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politika privatnosti"
      intro="Ovdje piše koje podatke čuvamo, zašto, koliko dugo i koja su tvoja prava."
    >
      <h2>1. Rukovalac podacima</h2>
      <p>
        {`${SITE.operator.name}, ${SITE.operator.city}, ${SITE.operator.country}. Pitanja o podacima: `}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>2. Koje podatke obrađujemo</h2>
      <ul>
        <li>
          <strong>Nalog:</strong> ime i prezime, email, telefon, lozinka (čuva se samo kao hash, ne možemo je vidjeti),
          datum prihvatanja uslova, datum poslednje prijave. Ako se prijaviš preko Google-a, dobijamo ime i email sa
          tvog Google naloga.
        </li>
        <li>
          <strong>Autoplac:</strong> naziv, adresa, grad, telefoni, Viber i WhatsApp, email, web sajt, radno vrijeme,
          lokacija na mapi, logo i fotografije. Ovi podaci su javni jer su dio oglasa.
        </li>
        <li>
          <strong>Oglasi:</strong> sve što plac unese o vozilu, uključujući fotografije. Iz fotografija pri obradi
          uklanjamo tehničke podatke (EXIF, uključujući lokaciju snimanja).
        </li>
        <li>
          <strong>Sačuvani oglasi</strong> prijavljenog korisnika.
        </li>
        <li>
          <strong>Prijave oglasa:</strong> razlog, poruka i, ako si prijavljen, tvoj nalog.
        </li>
        <li>
          <strong>Statistika:</strong> broj pregleda oglasa i klikova na kontakt, bez podataka o tome ko je kliknuo. IP
          adresa se privremeno koristi samo za zaštitu od zloupotrebe (ograničenje broja zahtjeva) i ne čuva se u bazi.
        </li>
      </ul>

      <h2>3. Zašto i po kom osnovu</h2>
      <ul>
        <li>
          Da bi sajt radio: nalog, prijava, objava i prikaz oglasa, kontakt sa placem (izvršenje ugovora, to jest uslova
          korišćenja).
        </li>
        <li>Statistika placu i zaštita od zloupotreba (naš legitimni interes).</li>
        <li>
          Obavještenja o promjenama uslova ili cijena emailom (legitimni interes); reklamne poruke šaljemo samo uz tvoj
          pristanak.
        </li>
      </ul>

      <h2>4. Kolačići</h2>
      <p>
        Koristimo samo kolačiće neophodne za rad: sesiju prijavljenog korisnika i zaštitu od falsifikovanih zahtjeva.
        Nema reklamnih kolačića ni praćenja preko drugih sajtova, pa nema ni bannera za pristanak. Ako to promijenimo,
        tražićemo pristanak.
      </p>

      <h2>5. Ko još vidi podatke</h2>
      <ul>
        <li>Javni dio oglasa i podaci o placu vidljivi su svima, uključujući pretraživače.</li>
        <li>
          Tehnički pružaoci koji za nas čuvaju podatke: server i baza (hosting u EU), skladište slika i mreža za
          isporuku. Oni podatke ne koriste za svoje svrhe.
        </li>
        <li>Google, samo ako izabereš prijavu preko Google naloga.</li>
        <li>Državni organi kad to zakon zahtijeva.</li>
      </ul>

      <h2>6. Koliko dugo čuvamo</h2>
      <ul>
        <li>Nalog i plac: dok ih ne obrišeš ili dok ne budu neaktivni 3 godine.</li>
        <li>
          Oglasi: istekli i prodati oglasi ostaju placu u panelu 12 mjeseci, pa se brišu zajedno sa fotografijama.
        </li>
        <li>Statistika pregleda i kontakata: 24 mjeseca, bez ličnih podataka.</li>
        <li>Prijave oglasa: 12 mjeseci od rješavanja.</li>
      </ul>

      <h2>7. Tvoja prava</h2>
      <p>
        Imaš pravo da zatražiš uvid u podatke koje imamo o tebi, ispravku, brisanje, ograničenje obrade i prenos
        podataka, kao i da se usprotiviš obradi na osnovu legitimnog interesa. Zahtjev pošalji na{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>; odgovaramo u roku od 30 dana. Pritužbu možeš podnijeti
        Agenciji za zaštitu ličnih podataka i slobodan pristup informacijama Crne Gore.
      </p>

      <h2>8. Bezbjednost</h2>
      <p>
        Veza sa sajtom je šifrovana (HTTPS), lozinke se čuvaju kao hash, pristup bazi imaju samo administratori, a broj
        zahtjeva sa jedne adrese je ograničen radi zaštite od zloupotreba.
      </p>

      <h2>9. Izmjene</h2>
      <p>
        Politiku možemo mijenjati; važeća verzija je ona sa datumom na vrhu stranice. O bitnim promjenama obavještavamo
        emailom korisnike sa nalogom.
      </p>
    </LegalPage>
  );
}
