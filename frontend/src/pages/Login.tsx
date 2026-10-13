
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/auth";
import "./Login.css";

function getDashboardPath(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "reporter":
      return "/reports";
    case "approver":
      return "/approvals";
  }
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email.trim(), password);

      navigate(getDashboardPath(user.role), {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat login. Silakan coba kembali.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">FR</div>
          <p className="brand-eyebrow">FIELD REPORT SYSTEM</p>
          <h1>Every report matters.</h1>
          <p className="brand-description">
            Kelola laporan lapangan, pantau proses persetujuan,
            dan pastikan setiap data tercatat dengan baik.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="mobile-logo">FR</div>

          <p className="form-eyebrow">SELAMAT DATANG KEMBALI</p>
          <h2>Login ke akun Anda</h2>
          <p className="form-description">
            Masukkan email dan password yang diberikan Admin.
          </p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Login"}
          </button>

          <p className="login-note">
            Belum memiliki akun? Hubungi Admin untuk mendapatkan
            akses ke sistem.
          </p>
        </form>
      </section>
    </main>
  );
}