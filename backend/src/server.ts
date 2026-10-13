
import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    console.log("HTTP server ditutup");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);