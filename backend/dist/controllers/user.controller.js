"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.addUser = addUser;
exports.editUser = editUser;
exports.changeUserActive = changeUserActive;
const database_1 = __importDefault(require("../config/database"));
const user_service_1 = require("../services/user.service");
const roles = ["reporter", "approver"];
function isValidUUID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isDuplicateEmail(error) {
    const e = error;
    return e?.code === "23505" &&
        (!e.constraint || e.constraint.includes("email"));
}
async function listUsers(_req, res) {
    try {
        const users = await (0, user_service_1.getAllUsers)();
        if (users.length === 0) {
            res.status(404).json({
                success: false,
                message: "Daftar pengguna tidak ditemukan",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil daftar pengguna",
        });
    }
}
async function addUser(req, res) {
    try {
        const { name, email, password, role } = req.body ?? {};
        if (typeof name !== "string" || !name.trim()) {
            res.status(400).json({
                success: false,
                message: "Nama wajib diisi!",
            });
            return;
        }
        if (name.trim().length > 150) {
            res.status(400).json({
                success: false,
                message: "Nama tidak boleh melebihi 150 karakter",
            });
            return;
        }
        if (typeof email !== "string" || !isValidEmail(email.trim())) {
            res.status(400).json({
                success: false,
                message: "Email wajib diisi / Email tidak valid",
            });
            return;
        }
        if (typeof password !== "string") {
            res.status(400).json({
                success: false,
                message: "Password wajib diisi",
            });
            return;
        }
        if (password.length < 12) {
            res.status(400).json({
                success: false,
                message: "Password minimal 12 karakter",
            });
            return;
        }
        if (!roles.includes(role)) {
            res.status(400).json({
                success: false,
                message: "Role reporter atau approver wajib diisi",
            });
            return;
        }
        const user = await (0, user_service_1.createUser)({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
        });
        res.status(201).json({
            success: true,
            message: "Pengguna berhasil dibuat",
            data: user,
        });
    }
    catch (error) {
        if (isDuplicateEmail(error)) {
            res.status(409).json({
                success: false,
                message: "Email sudah terdaftar",
            });
            return;
        }
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: "Gagal membuat pengguna",
        });
    }
}
async function editUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body ?? {};
        if (typeof id !== "string" || !isValidUUID(id)) {
            res.status(400).json({
                success: false,
                message: "ID pengguna tidak valid",
            });
            return;
        }
        const updates = {};
        if (name !== undefined) {
            if (typeof name !== "string" ||
                !name.trim() ||
                name.trim().length > 150) {
                res.status(400).json({
                    success: false,
                    message: "Nama tidak valid",
                });
                return;
            }
            updates.name = name.trim();
        }
        if (email !== undefined) {
            if (typeof email !== "string" ||
                !isValidEmail(email.trim()) ||
                email.trim().length > 255) {
                res.status(400).json({
                    success: false,
                    message: "Email tidak valid",
                });
                return;
            }
            updates.email = email.trim().toLowerCase();
        }
        if (role !== undefined) {
            if (!["admin", "reporter", "approver"].includes(role)) {
                res.status(400).json({
                    success: false,
                    message: "Role tidak valid",
                });
                return;
            }
            if (role !== "admin") {
                const target = await (0, database_1.default)("users")
                    .select("role")
                    .where({ id })
                    .first();
                if (!target) {
                    res.status(404).json({
                        success: false,
                        message: "Pengguna tidak ditemukan",
                    });
                    return;
                }
                if (target.role === "admin") {
                    const adminCount = await (0, database_1.default)("users")
                        .where({ role: "admin", is_active: true })
                        .count("id as count")
                        .first();
                    if (Number(adminCount?.count ?? 0) <= 1) {
                        res.status(409).json({
                            success: false,
                            message: "Tidak dapat mengubah role Admin aktif terakhir",
                        });
                        return;
                    }
                }
            }
            updates.role = role;
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({
                success: false,
                message: "Tidak ada data yang dapat diperbarui",
            });
            return;
        }
        const user = await (0, user_service_1.updateUser)(id, updates);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Pengguna berhasil diperbarui",
            data: user,
        });
    }
    catch (error) {
        if (isDuplicateEmail(error)) {
            res.status(409).json({
                success: false,
                message: "Email sudah terdaftar",
            });
            return;
        }
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Gagal memperbarui pengguna",
        });
    }
}
async function changeUserActive(req, res) {
    try {
        const { id } = req.params;
        const { is_active } = req.body ?? {};
        if (typeof id !== "string" || !isValidUUID(id)) {
            res.status(400).json({
                success: false,
                message: "ID pengguna tidak valid",
            });
            return;
        }
        if (typeof is_active !== "boolean") {
            res.status(400).json({
                success: false,
                message: "is_active harus berupa boolean",
            });
            return;
        }
        if (id === req.user?.id && !is_active) {
            res.status(400).json({
                success: false,
                message: "Kamu tidak dapat menonaktifkan akun sendiri",
            });
            return;
        }
        if (!is_active) {
            const target = await (0, database_1.default)("users")
                .select("role", "is_active")
                .where({ id })
                .first();
            if (!target) {
                res.status(404).json({
                    success: false,
                    message: "Pengguna tidak ditemukan",
                });
                return;
            }
            if (target.role === "admin" && target.is_active) {
                const adminCount = await (0, database_1.default)("users")
                    .where({ role: "admin", is_active: true })
                    .count("id as count")
                    .first();
                if (Number(adminCount?.count ?? 0) <= 1) {
                    res.status(409).json({
                        success: false,
                        message: "Tidak dapat menonaktifkan Admin aktif terakhir",
                    });
                    return;
                }
            }
        }
        const user = await (0, user_service_1.setUserActive)(id, is_active);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Status akun berhasil diperbarui",
            data: user,
        });
    }
    catch (error) {
        console.error("Error changing user status:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengubah status akun",
        });
    }
}
