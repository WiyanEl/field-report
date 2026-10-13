"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const report_route_1 = __importDefault(require("./routes/report.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Field Report API is running",
    });
});
app.use('/api/auth', auth_route_1.default);
app.use('/api/users', user_route_1.default);
app.use('/api/reports', report_route_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
    });
});
exports.default = app;
