
import { apiRequest } from "./api";
import type { ManagedUser, UsersApiResponse, CreateUserPayload, UpdateUserPayload } from "../types/user";

export async function getUsers(): Promise<ManagedUser[]> {
  const response = await apiRequest<UsersApiResponse>("/users");

  if (!response.success) {
    throw new Error(response.message || "Gagal mengambil pengguna.");
  }

  if (!Array.isArray(response.data)) {
    throw new Error("Format data pengguna tidak sesuai.");
  }

  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<void> {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
  }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new Error(response.message || "Gagal membuat pengguna.");
  }
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
  }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    throw new Error(response.message || "Gagal memperbarui pengguna.");
  }
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  const response = await apiRequest<{
    success: boolean;
    message?: string;
  }>(`/users/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.success) {
    throw new Error(
      response.message || "Gagal mengubah status akun pengguna."
    );
  }
}