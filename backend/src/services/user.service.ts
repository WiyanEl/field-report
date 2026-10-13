
import bcrypt from "bcryptjs";
import db from "../config/database";
import type { UserRole } from "../middleware/auth.middleware";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}

export async function getAllUsers() {
  return db("users")
    .select(
      "id",
      "name",
      "email",
      "role",
      "is_active",
      "created_at",
      "updated_at"
    )
    .orderBy("created_at", "desc");
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  const [user] = await db("users")
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

export async function updateUser(
  id: string,
  input: UpdateUserInput
) {
  const [user] = await db("users")
    .where({ id })
    .update({
      ...input,
      updated_at: db.fn.now(),
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

export async function setUserActive(
  id: string,
  isActive: boolean
) {
  const [user] = await db("users")
    .where({ id })
    .update({
      is_active: isActive,
      updated_at: db.fn.now(),
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