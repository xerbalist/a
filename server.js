const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, "dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const filePath = path.resolve(publicDirectory, relativePath);

  if (!filePath.startsWith(`${publicDirectory}${path.sep}`) && filePath !== path.join(publicDirectory, "index.html")) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    const candidate = !statError && stats.isFile() ? filePath : path.join(publicDirectory, "index.html");
    fs.readFile(candidate, (readError, data) => {
      if (readError) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Server error");
        return;
      }

      const extension = path.extname(candidate).toLowerCase();
      response.writeHead(200, {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      });
      response.end(data);
    });
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Signal Portfolio listening on http://0.0.0.0:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, closing server`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
