"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : undefined;
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token autentikasi diperlukan",
        });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({
            success: false,
            message: "Konfigurasi autentikasi belum tersedia",
        });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (typeof payload === "string" ||
            typeof payload.sub !== "string" ||
            !["admin", "reporter", "approver"].includes(String(payload.role))) {
            res.status(401).json({
                success: false,
                message: "Token autentikasi tidak valid",
            });
            return;
        }
        req.user = {
            id: payload.sub,
            role: payload.role,
        };
        next();
    }
    catch {
        res.status(401).json({
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
        });
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Autentikasi diperlukan",
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "Kamu tidak memiliki akses ke fitur ini",
            });
            return;
        }
        next();
    };
}
