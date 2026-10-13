"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
async function createAdmin() {
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!name || !email || !password) {
        throw new Error("ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi.");
    }
    if (password.length < 12) {
        throw new Error("Password Admin minimal 12 karakter.");
    }
    if (name.length > 150) {
        throw new Error("Nama melebihi batas karakter.");
    }
    if (email.length > 255) {
        throw new Error("Email melebihi batas karakter.");
    }
    const existingUser = await (0, database_1.default)("users")
        .select("id")
        .where({ email })
        .first();
    if (existingUser) {
        throw new Error("Email sudah terdaftar. Script tidak mengubah role atau password akun yang sudah ada.");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const [admin] = await (0, database_1.default)("users")
        .insert({
        name,
        email,
        password_hash: passwordHash,
        role: "admin",
        is_active: true,
    })
        .returning(["id", "name", "email", "role"]);
    console.log("Akun Admin berhasil dibuat.");
    console.log({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
    });
}
createAdmin()
    .catch((error) => {
    console.error("Gagal membuat akun Admin:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
})
    .finally(async () => {
    await database_1.default.destroy();
});
