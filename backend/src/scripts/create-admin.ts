
import "dotenv/config";

import bcrypt from "bcryptjs";
import db from "../config/database";

async function createAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Password Admin minimal 12 karakter."
    );
  }

  if (name.length > 150) {
    throw new Error("Nama melebihi batas karakter.");
  }

  if (email.length > 255) {
    throw new Error("Email melebihi batas karakter.");
  }

  const existingUser = await db("users")
    .select("id")
    .where({ email })
    .first();

  if (existingUser) {
    throw new Error(
      "Email sudah terdaftar. Script tidak mengubah role atau password akun yang sudah ada."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [admin] = await db("users")
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
  .catch((error: unknown) => {
    console.error(
      "Gagal membuat akun Admin:",
      error instanceof Error ? error.message : error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });