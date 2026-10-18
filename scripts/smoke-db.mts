import "dotenv/config";
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
try {
  await sql.begin(async (tx) => {
    const [u] = await tx`INSERT INTO users (email,name,role) VALUES ('Test@Example.com','Test','dealer') RETURNING id`;
    const [d] = await tx`INSERT INTO dealers (owner_user_id,slug,name,city_id,phone,status) VALUES (${u.id},'test-plac','Test plac',1,'067000000','active') RETURNING id`;
    const [mk] = await tx`SELECT m.id AS make_id, mo.id AS model_id FROM makes m JOIN models mo ON mo.make_id=m.id WHERE m.slug='volkswagen' AND mo.slug='golf'`;
    const [l] = await tx`INSERT INTO listings (public_id,slug,dealer_id,user_id,make_id,model_id,year,mileage_km,fuel,transmission,body_type,price_eur,city_id,status)
      VALUES ('a7k3m9','volkswagen-golf-2016',${d.id},${u.id},${mk.make_id},${mk.model_id},2016,150000,'diesel','manual','hatchback',9500,1,'active') RETURNING id`;
    const [c1] = await tx`SELECT active_listings_count FROM dealers WHERE id=${d.id}`;
    await tx`UPDATE listings SET status='sold' WHERE id=${l.id}`;
    const [c2] = await tx`SELECT active_listings_count, (SELECT updated_at > created_at FROM listings WHERE id=${l.id}) AS updated_moved FROM dealers WHERE id=${d.id}`;
    const [dup] = await tx`SELECT count(*)::int AS n FROM users WHERE email='test@example.com'`;
    console.log({ afterInsert: c1.active_listings_count, afterSold: c2.active_listings_count, updatedAtTrigger: c2.updated_moved, citextMatch: dup.n });
    throw new Error("ROLLBACK");
  });
} catch (e: any) { if (e.message !== "ROLLBACK") throw e; }
await sql.end();
