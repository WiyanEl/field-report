"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 3000;
const server = app_1.default.listen(PORT, () => {
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
