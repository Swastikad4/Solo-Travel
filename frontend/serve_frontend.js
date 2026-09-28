const http = require("http");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "build");
const PORT = 3000;
const BACKEND_PORT = 5000;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

http
  .createServer((req, res) => {
    // Proxy API requests to backend on port 5000
    if (req.url.startsWith("/api/")) {
      const options = {
        hostname: "localhost",
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${BACKEND_PORT}`
        }
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxyReq, { end: true });

      proxyReq.on("error", (err) => {
        console.error("Proxy error:", err.message);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Backend proxy connection error" }));
      });
      return;
    }

    let reqPath = req.url.split("?")[0];
    let filePath = path.join(BUILD_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA fallback
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream(path.join(BUILD_DIR, "index.html")).pipe(res);
    }
  })
  .listen(PORT, () => {
    console.log(`Frontend running on http://localhost:${PORT} with /api proxy to :${BACKEND_PORT}`);
  });
