import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {
    root: path.resolve(__dirname, "..", "public"),
    port: 5173,
    host: "127.0.0.1",
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root" && argv[i + 1]) {
      args.root = path.resolve(process.cwd(), argv[++i]);
      continue;
    }
    if (a === "--port" && argv[i + 1]) {
      args.port = Number(argv[++i]);
      continue;
    }
    if (a === "--host" && argv[i + 1]) {
      args.host = String(argv[++i]);
      continue;
    }
    if (a === "--help") {
      console.log(
        [
          "Usage: npm run dev -- [--root public] [--port 5173] [--host 127.0.0.1]",
          "",
          "Examples:",
          "  npm run dev",
          "  npm run dev -- --port 3000",
          "  npm run preview",
        ].join("\n")
      );
      process.exit(0);
    }
  }

  if (!Number.isFinite(args.port) || args.port <= 0) {
    throw new Error(`Invalid --port: ${args.port}`);
  }

  return args;
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".webmanifest":
      return "application/manifest+json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".ico":
      return "image/x-icon";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function safeResolve(root, urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  const clean = decoded.split("?")[0].split("#")[0];
  const rel = clean.replace(/^\/+/, "");
  const resolved = path.resolve(root, rel);
  const rootResolved = path.resolve(root);
  if (!resolved.startsWith(rootResolved + path.sep) && resolved !== rootResolved) {
    return null;
  }
  return resolved;
}

const args = parseArgs(process.argv);

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let filePath = safeResolve(args.root, url.pathname);
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    // Treat directories as /index.html
    try {
      const st = await stat(filePath);
      if (st.isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {
      // Fall through; handled below.
    }

    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      // Dev server: avoid cache surprises while iterating (esp. with service worker).
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(args.port, args.host, () => {
  console.log(`Dev server running at http://${args.host}:${args.port}/ (root: ${args.root})`);
});

