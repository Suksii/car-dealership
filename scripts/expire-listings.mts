// Označava istekle oglase (expires_at < now) kao 'expired' da plac vidi status u panelu.
// Javne liste ih i bez ovoga ne prikazuju (filter expires_at > now()). Cron jednom dnevno, npr. 0 3 * * *.
import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const rows =
  await sql`UPDATE listings SET status = 'expired' WHERE status = 'active' AND expires_at < now() RETURNING id`;
console.log(`isteklo: ${rows.length} oglasa`);
await sql.end();
