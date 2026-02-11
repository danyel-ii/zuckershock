import { rm, cp } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "public");
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await cp(src, dist, { recursive: true });

console.log(`Built static site to ${dist}`);

