
import type { UserRole } from "./auth";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsersApiResponse {
  success: boolean;
  message?: string;
  data: ManagedUser[] | ManagedUser;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}