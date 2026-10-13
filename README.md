# Field Report MAPID

Aplikasi pelaporan lapangan dengan sistem autentikasi dan alur persetujuan laporan berdasarkan role pengguna.

## 📋 Deskripsi

**Field Report MAPID** merupakan aplikasi untuk membuat, mengelola, memantau, dan memproses laporan lapangan. Aplikasi ini memiliki tiga role pengguna, yaitu Admin, Reporter, dan Approver, dengan hak akses yang berbeda.

Proyek ini menggunakan React dan Vite untuk frontend, Express.js dan TypeScript untuk backend, serta PostgreSQL sebagai database.

## ✨ Fitur Utama

### 1. Autentikasi dan Hak Akses

* Login menggunakan email dan password.
* Autentikasi menggunakan JWT.
* Pembatasan akses berdasarkan role pengguna.
* Registrasi publik tidak tersedia; akun dikelola oleh Admin.

### 2. Reporter

* Membuat laporan baru.
* Melihat daftar laporan milik sendiri.
* Mengedit nama dan deskripsi laporan selama status masih `pending`.
* Memantau status laporan.

### 3. Approver

* Melihat daftar laporan yang perlu ditinjau.
* Menyetujui laporan (`approved`).
* Menolak laporan (`rejected`).
* Mengubah keputusan laporan melalui proses approval yang tersedia.
* Melihat riwayat persetujuan laporan.

### 4. Admin

* Melihat ringkasan dan statistik laporan.
* Memantau jumlah laporan berdasarkan status.
* Melihat jumlah pengguna dan status keaktifannya.
* Melihat daftar laporan terbaru.
* Membuat akun pengguna.
* Mengubah data pengguna dan role.
* Mengaktifkan atau menonaktifkan akun pengguna.

### 5. Riwayat Persetujuan

* Menyimpan informasi keputusan persetujuan.
* Mencatat approver, keputusan, catatan, dan waktu keputusan.
* Menampilkan riwayat keputusan berdasarkan laporan.

## 🛠️ Teknologi

**Frontend**

* React
* Vite
* TypeScript
* React Router
* CSS

**Backend**

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Knex.js

**Database dan Deployment**

* PostgreSQL — Supabase
* Backend — Render
* Frontend — Vercel

## 📁 Struktur Repository

```text
field-report/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   ├── knexfile.cjs
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
│
└── README.md
```

*Struktur di atas merupakan gambaran umum. Sesuaikan dengan file aktual di repository.*

## 🚀 Instalasi dan Menjalankan Aplikasi

### Prasyarat

Pastikan sudah terpasang:

* Node.js dan npm.
* PostgreSQL atau database PostgreSQL Supabase.
* Git.

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY_GITHUB>
cd field-report
```

### 2. Menjalankan Backend

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file `.env` berdasarkan `.env.example`, lalu isi konfigurasi database dan autentikasi.

Contoh konfigurasi:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=GANTI_DENGAN_SECRET_YANG_KUAT
JWT_EXPIRES_IN=1d
```

Sesuaikan nama variabel dengan konfigurasi backend aktual. Jangan menggunakan nilai rahasia contoh untuk production.

Jalankan migrasi database jika belum dilakukan:

```bash
npm run db:migrate
```

Jalankan backend dalam mode development:

```bash
npm run dev
```

Backend berjalan di `http://localhost:3000`, apabila menggunakan port tersebut.

### 3. Menjalankan Frontend

Buka terminal baru dari root repository:

```bash
cd frontend
npm install
```

Buat file `.env` di folder frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

Pastikan nilai tersebut sesuai dengan konfigurasi `apiRequest` dan prefix API backend.

Jalankan frontend:

```bash
npm run dev
```

Vite akan menampilkan alamat lokal frontend di terminal, biasanya `http://localhost:5173`.

### 4. Build Frontend

Untuk membuat build production:

```bash
npm run build
```

Hasil build Vite secara default berada di folder `dist`.

## 🔌 API

Endpoint berikut menggunakan prefix API `/api` sebagai contoh. Sesuaikan prefix dan path riwayat dengan mount router yang digunakan backend.

| Method | Endpoint                   | Deskripsi                               |
| ------ | -------------------------- | --------------------------------------- |
| POST   | `/api/auth/login`          | Login pengguna                          |
| GET    | `/api/report`              | Mengambil daftar laporan                |
| POST   | `/api/report`              | Membuat laporan                         |
| PATCH  | `/api/report/:id`          | Mengedit laporan pending milik reporter |
| PATCH  | `/api/report/:id/status`   | Mengubah status laporan                 |
| GET    | `/api/reports/:id/history` | Mengambil riwayat persetujuan           |
| GET    | `/api/users`               | Mengambil daftar pengguna               |
| POST   | `/api/users`               | Membuat pengguna                        |
| PATCH  | `/api/users/:id`           | Mengubah data pengguna                  |
| PATCH  | `/api/users/:id/active`    | Mengubah status aktif pengguna          |

Endpoint yang memerlukan autentikasi harus menyertakan token JWT:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Status Laporan

| Status     | Keterangan                  |
| ---------- | --------------------------- |
| `pending`  | Menunggu keputusan approver |
| `approved` | Laporan disetujui           |
| `rejected` | Laporan ditolak             |

Reporter hanya diperbolehkan mengedit laporan miliknya selama status masih `pending`. Validasi kepemilikan dan status tetap dilakukan di backend.

## ☁️ Deployment

### Backend — Render

1. Hubungkan repository GitHub ke Render.

2. Pilih folder `backend` sebagai Root Directory.

3. Atur Build Command:

   ```bash
   npm install && npm run build
   ```

4. Atur Start Command:

   ```bash
   npm start
   ```

5. Konfigurasikan environment variables yang diperlukan, termasuk `DATABASE_URL`, `JWT_SECRET`, dan `NODE_ENV`.

6. Jalankan migrasi database sesuai prosedur deployment.

7. Pastikan backend dapat diakses dan koneksi database berhasil.

### Frontend — Vercel

1. Hubungkan repository GitHub ke Vercel.
2. Pilih folder `frontend` sebagai Root Directory.
3. Gunakan perintah build `npm run build`.
4. Gunakan output directory `dist`.
5. Atur environment variable `VITE_API_URL` ke URL API backend production yang sesuai dengan implementasi `apiRequest`.
6. Deploy dan uji login serta akses berdasarkan role.

Pastikan konfigurasi CORS backend mengizinkan origin frontend production.

## 🔐 Akun Demo

Isi bagian berikut setelah akun demo dibuat dan diuji.

| Role     | Email                    | Password              |
| -------- | ------------------------ | --------------------- |
| Admin    | systemadmin@mapid.com    | qwertybnm1234         |
| Reporter | firstreporter@mapid.com  | qwertybnm1234         |
| Approver | firstapprover@mapid.com  | qwertybnm1234         |

**Catatan keamanan:** gunakan akun demo khusus dengan data non-sensitif. Jangan mencantumkan kredensial production atau secret database di repository publik.

## 🧪 Skenario Pengujian

* Login berhasil untuk setiap role.
* Reporter dapat membuat laporan dan mengedit laporan yang masih `pending`.
* Reporter tidak dapat mengedit laporan milik pengguna lain.
* Laporan yang sudah `approved` atau `rejected` tidak dapat diedit.
* Approver dapat menyetujui atau menolak laporan.
* Riwayat persetujuan tercatat dan dapat ditampilkan.
* Admin dapat mengelola pengguna dan melihat ringkasan laporan.
* Pengguna yang tidak memiliki izin tidak dapat mengakses endpoint terproteksi.

## 👨‍💻 Pengembang

**Wiyan Barkah Elmansyah**

Fullstack Developer

GitHub: [WiyanEl](https://github.com/WiyanEl)

---

Dibuat sebagai proyek Field Report MAPID.
