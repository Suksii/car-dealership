import sharp from "sharp";
// Pravi test JPG 1600x1200 sa gradijentom, za provjeru upload rute
const out = process.argv[2] ?? "/tmp/test-car.jpg";
const w = 1600,
  h = 1200;
const raw = Buffer.alloc(w * h * 3);
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    raw[i] = (x / w) * 255;
    raw[i + 1] = (y / h) * 255;
    raw[i + 2] = 120;
  }
await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
  .jpeg({ quality: 85 })
  .toFile(out);
console.log(out);
