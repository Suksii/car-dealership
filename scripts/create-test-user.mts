import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";
// Dev korisnici: test@autoplac.me / lozinka123 (private), admin@autoplac.me / lozinka123 (admin)
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const hash = await bcrypt.hash("lozinka123", 10);
await sql`INSERT INTO users (email,name,phone,password_hash,role,email_verified_at) VALUES
  ('test@autoplac.me','Test Korisnik','067000001',${hash},'private',now()),
  ('admin@autoplac.me','Admin','067000002',${hash},'admin',now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`;
console.log("test korisnici upisani");
await sql.end();
