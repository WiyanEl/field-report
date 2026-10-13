
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "admin" | "reporter" | "approver";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !["admin", "reporter", "approver"].includes(
        String(payload.role)
      )
    ) {
      res.status(401).json({
        success: false,
        message: "Token autentikasi tidak valid",
      });
      return;
    }

    req.user = {
      id: payload.sub,
      role: payload.role as UserRole,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
  }
}

export function authorize(...roles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
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