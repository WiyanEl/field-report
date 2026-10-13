"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== "string" || !email.trim()) {
            res.status(400).json({
                success: false,
                message: "Email wajib diisi",
            });
            return;
        }
        if (typeof password !== "string" || !password) {
            res.status(400).json({
                success: false,
                message: "Password wajib diisi",
            });
            return;
        }
        const user = await (0, database_1.default)("users")
            .select("id", "name", "email", "password_hash", "role", "is_active")
            .where({ email: email.trim().toLowerCase() })
            .first();
        if (!user || !user.is_active || !(await bcryptjs_1.default.compare(password, user.password_hash))) {
            res.status(401).json({
                success: false,
                message: "Email atau password tidak valid",
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
        const token = jsonwebtoken_1.default.sign({ role: user.role }, secret, {
            subject: user.id,
            expiresIn: "1d",
        });
        res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat login",
        });
    }
}
