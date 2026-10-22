import { describe, it, expect } from "vitest";
import { escapeHtml, passwordResetEmail, newReportEmail, verifyEmailEmail } from "./templates";

describe("email šabloni", () => {
  it("escapeHtml neutrališe HTML iz korisničkog unosa", () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;");
  });
  it("reset lozinke sadrži link u HTML-u i tekstu, ime je escapovano", () => {
    const m = passwordResetEmail("<b>Ana</b>", "https://autivo.me/nova-lozinka?token=abc", 60);
    expect(m.html).toContain("https://autivo.me/nova-lozinka?token=abc");
    expect(m.text).toContain("https://autivo.me/nova-lozinka?token=abc");
    expect(m.html).toContain("&lt;b&gt;Ana&lt;/b&gt;");
    expect(m.html).not.toContain("<b>Ana</b>");
  });
  it("prijava oglasa ne pušta HTML iz poruke korisnika", () => {
    const m = newReportEmail({
      listingTitle: "Golf",
      listingUrl: "https://x/oglas/golf",
      reason: "Prevara",
      message: "<img src=x>",
    });
    expect(m.html).not.toContain("<img src=x>");
  });

  it("dugme ima i tekstualni link, a pregled u inboxu je postavljen", () => {
    const m = verifyEmailEmail("Ana", "https://autivo.me/potvrda-emaila?token=xyz", 24);
    // href dugmeta, href tekstualnog linka i sam tekst linka
    expect(m.html.match(/potvrda-emaila\?token=xyz/g)?.length).toBe(3);
    expect(m.html).toContain("Ako dugme ne radi");
    expect(m.html).toContain("Još jedan klik");
    expect(m.text).toContain("https://autivo.me/potvrda-emaila?token=xyz");
  });
});
