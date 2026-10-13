
export type UserRole = "admin" | "reporter" | "approver";

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}