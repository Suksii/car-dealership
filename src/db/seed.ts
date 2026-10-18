import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

// Puni šifarnike iz db/seed_*.sql. Idempotentno: preskače ako već ima podataka.
const files = ["seed_cities.sql", "seed_makes_models.sql", "seed_features.sql"];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const [{ count }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM makes`;
  if (count > 0) {
    console.log(`Šifarnici već postoje (${count} marki), preskačem.`);
  } else {
    for (const f of files) {
      const text = readFileSync(join(process.cwd(), "db", f), "utf8");
      await sql.unsafe(text);
      console.log(`✓ ${f}`);
    }
  }
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
