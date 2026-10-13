"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.setUserActive = setUserActive;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
async function getAllUsers() {
    return (0, database_1.default)("users")
        .select("id", "name", "email", "role", "is_active", "created_at", "updated_at")
        .orderBy("created_at", "desc");
}
async function createUser(input) {
    const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
    const [user] = await (0, database_1.default)("users")
        .insert({
        name: input.name,
        email: input.email,
        password_hash: passwordHash,
        role: input.role,
        is_active: true,
    })
        .returning([
        "id",
        "name",
        "email",
        "role",
        "is_active",
        "created_at",
        "updated_at",
    ]);
    return user;
}
async function updateUser(id, input) {
    const [user] = await (0, database_1.default)("users")
        .where({ id })
        .update({
        ...input,
        updated_at: database_1.default.fn.now(),
    })
        .returning([
        "id",
        "name",
        "email",
        "role",
        "is_active",
        "created_at",
        "updated_at",
    ]);
    return user ?? null;
}
async function setUserActive(id, isActive) {
    const [user] = await (0, database_1.default)("users")
        .where({ id })
        .update({
        is_active: isActive,
        updated_at: database_1.default.fn.now(),
    })
        .returning([
        "id",
        "name",
        "email",
        "role",
        "is_active",
        "updated_at",
    ]);
    return user ?? null;
}
