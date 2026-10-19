// Osvježava materijalizovani view price_stats (procjena cijene na oglasu). Pokretati iz crona, npr. jednom dnevno:
//   0 4 * * * cd /var/www/autoplac && npx tsx scripts/refresh-stats.mts
import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY price_stats`;
const [{ n }] = await sql`SELECT count(*)::int AS n FROM price_stats`;
console.log(`price_stats osvježen: ${n} redova`);
await sql.end();
