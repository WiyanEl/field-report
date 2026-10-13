
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createUser,
  getUsers,
  setUserActive,
  updateUser,
} from "../services/userService";
import type { UserRole } from "../types/auth";
import type {
  ManagedUser,
  CreateUserPayload,
} from "../types/user";
import "./AdminUsers.css";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "reporter",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  reporter: "Reporter",
  approver: "Approver",
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil daftar pengguna."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function resetForm() {
    setForm(emptyForm);
    setEditingUser(null);
    setError("");
  }

  function startEdit(user: ManagedUser) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name || !email) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setError("Password wajib diisi untuk pengguna baru.");
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name,
          email,
          role: form.role,
        });

        setNotice("Data pengguna berhasil diperbarui.");
      } else {
        const payload: CreateUserPayload = {
          name,
          email,
          password: form.password,
          role: form.role,
        };

        await createUser(payload);
        setNotice("Pengguna baru berhasil dibuat.");
      }

      resetForm();
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data pengguna."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleActiveToggle(user: ManagedUser) {
    const nextActive = !user.is_active;
    const action = nextActive ? "mengaktifkan" : "menonaktifkan";

    if (
      !window.confirm(
        `Yakin ingin ${action} akun ${user.name}?`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");
    setProcessingId(user.id);

    try {
      await setUserActive(user.id, nextActive);
      setNotice(
        `Akun ${user.name} berhasil ${
          nextActive ? "diaktifkan" : "dinonaktifkan"
        }.`
      );
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status pengguna."
      );
    } finally {
      setProcessingId(null);
    }
  }

  const filteredUsers = users.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query);

    const matchesRole =
      roleFilter === "all" || item.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <section className="admin-users-page">
      <div className="admin-users-heading">
        <div>
          <h1>Kelola Pengguna</h1>
          <p>
            Buat akun dan kelola akses Admin, Reporter, serta Approver.
          </p>
        </div>

        <button
          type="button"
          className="admin-users-primary"
          onClick={() => {
            resetForm();
            setNotice("");
          }}
        >
          Tambah Pengguna
        </button>
      </div>

      {error && (
        <div className="admin-users-alert admin-users-alert-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="admin-users-alert admin-users-alert-success" role="status">
          {notice}
        </div>
      )}

      <div className="admin-users-layout">
        <div className="admin-users-panel">
          <div className="admin-users-panel-heading">
            <div>
              <h2>Daftar Pengguna</h2>
              <p>{filteredUsers.length} pengguna ditemukan</p>
            </div>

            <button
              type="button"
              className="admin-users-secondary"
              onClick={() => void loadUsers()}
              disabled={loading}
            >
              Muat ulang
            </button>
          </div>

          <div className="admin-users-filters">
            <input
              type="search"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Cari pengguna"
            />

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter role"
            >
              <option value="all">Semua role</option>
              <option value="admin">Admin</option>
              <option value="reporter">Reporter</option>
              <option value="approver">Approver</option>
            </select>
          </div>

          {loading ? (
            <div className="admin-users-empty">Memuat pengguna...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-users-empty">
              Tidak ada pengguna yang cocok.
            </div>
          ) : (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Pengguna</th>
                    <th>Role</th>
                    <th>Status akun</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-user-identity">
                          <strong>{item.name}</strong>
                          <span>{item.email}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`admin-user-role admin-user-role-${item.role}`}>
                          {roleLabels[item.role]}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-user-active ${
                            item.is_active ? "is-active" : "is-inactive"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-user-actions">
                          <button
                            type="button"
                            className="admin-user-edit"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-user-toggle"
                            disabled={
                              processingId === item.id ||
                              String(currentUser?.id) === String(item.id)
                            }
                            title={
                              String(currentUser?.id) === String(item.id)
                                ? "Kamu tidak dapat menonaktifkan akun sendiri."
                                : undefined
                            }
                            onClick={() => void handleActiveToggle(item)}
                          >
                            {processingId === item.id
                              ? "Memproses..."
                              : item.is_active
                                ? "Nonaktifkan"
                                : "Aktifkan"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="admin-users-form-panel">
          <div className="admin-users-panel-heading">
            <div>
              <h2>{editingUser ? "Edit Pengguna" : "Tambah Pengguna"}</h2>
              <p>
                {editingUser
                  ? "Perbarui identitas dan role pengguna."
                  : "Buat akun baru untuk mengakses aplikasi."}
              </p>
            </div>
          </div>

          <form className="admin-users-form" onSubmit={handleSubmit}>
            <div className="admin-users-field">
              <label htmlFor="user-name">Nama lengkap *</label>
              <input
                id="user-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                maxLength={150}
                required
                disabled={saving}
              />
            </div>

            <div className="admin-users-field">
              <label htmlFor="user-email">Email *</label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
                disabled={saving}
              />
            </div>

            {!editingUser && (
              <div className="admin-users-field">
                <label htmlFor="user-password">Password *</label>
                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  minLength={8}
                  autoComplete="new-password"
                  required
                  disabled={saving}
                />
                <small>Gunakan minimal 12 karakter.</small>
              </div>
            )}

            <div className="admin-users-field">
              <label htmlFor="user-role">Role *</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as UserRole,
                  })
                }
                disabled={saving}
              >
                <option value="reporter">Reporter</option>
                <option value="approver">Approver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="admin-users-form-actions">
              <button
                type="button"
                className="admin-users-secondary"
                onClick={resetForm}
                disabled={saving}
              >
                {editingUser ? "Batal edit" : "Reset"}
              </button>

              <button
                type="submit"
                className="admin-users-primary"
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : editingUser
                    ? "Simpan Perubahan"
                    : "Buat Akun"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}