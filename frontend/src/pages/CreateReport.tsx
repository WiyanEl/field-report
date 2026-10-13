
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../services/reportService";
import "./CreateReport.css";

export default function CreateReport() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Nama dan deskripsi laporan wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      await createReport({
        name: trimmedName,
        description: trimmedDescription,
      });

      setSuccess("Laporan berhasil dibuat.");

      window.setTimeout(() => {
        navigate("/reports");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat laporan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="create-report-page">
      <div className="create-report-heading">
        <div>
          <span className="create-report-breadcrumb">
            Laporan / Buat Laporan
          </span>
          <h1>Buat Laporan Baru</h1>
          <p>
            Isi informasi kejadian atau kondisi yang ingin kamu laporkan.
          </p>
        </div>
      </div>

      <div className="create-report-card">
        <div className="create-report-card-heading">
          <h2>Informasi Laporan</h2>
          <p>Lengkapi kedua kolom berikut sebelum mengirim laporan.</p>
        </div>

        {error && (
          <div className="create-report-alert create-report-alert-error"
            role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="create-report-alert create-report-alert-success"
            role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="create-report-field">
            <label htmlFor="report-name">
              Nama laporan <span>*</span>
            </label>
            <input
              id="report-name"
              type="text"
              placeholder="Contoh: Jembatan mengalami kerusakan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={200}
              required
              disabled={loading}
            />
            <small>Gunakan judul singkat yang menggambarkan laporan.</small>
          </div>

          <div className="create-report-field">
            <label htmlFor="report-description">
              Deskripsi laporan <span>*</span>
            </label>
            <textarea
              id="report-description"
              placeholder="Jelaskan kondisi, lokasi, dan detail yang ditemukan..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              required
              disabled={loading}
            />
            <small>
              Berikan informasi yang jelas agar laporan mudah ditinjau.
            </small>
          </div>

          <div className="create-report-actions">
            <button
              type="button"
              className="create-report-button-secondary"
              onClick={() => navigate("/reports")}
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              className="create-report-button-primary"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}