# Asset Management System 🚀

Aplikasi Manajemen Asset berbasis web dengan integrasi Persona HRIS. Dibangun menggunakan Next.js, Supabase, dan TailwindCSS.

## 📋 **FITUR UTAMA**

### 🔐 **Autentikasi & Role Management**
- Login dengan email & password (NextAuth)
- Role-based access: **USER**, **ADMIN**, **SUPER_ADMIN**
- Registrasi user baru
- Session management dengan JWT

### 📊 **Dashboard Analytics**
- Statistik real-time (total asset, tersedia, dipinjam, rusak)
- Grafik tren peminjaman 6 bulan
- Pie chart status asset
- Top 5 asset paling sering dipinjam
- Aktivitas terbaru (10 peminjaman terakhir)

### 📦 **Manajemen Asset**
- CRUD Asset (Create, Read, Update, Delete)
- List asset dengan status (TERSEDIA/DIPINJAM/RUSAK)
- Filter & search asset
- Detail asset halaman khusus
- Kode asset unik

### 📝 **Manajemen Peminjaman**
- Ajukan peminjaman dengan pilih asset + karyawan
- **Integrasi Persona HRIS** untuk data karyawan real-time
- Search karyawan by NIK, nama, email
- Auto-fill data karyawan
- List peminjaman dengan status (PENDING/APPROVED/REJECTED/RETURNED)
- Approve/Reject peminjaman (admin)
- Proses pengembalian asset
- Filter & search peminjaman
- Pagination
- Hapus peminjaman dengan konfirmasi

### 👥 **Manajemen User (Admin)**
- List semua user
- Tambah user baru
- Edit user (nama, email, role, jabatan)
- Reset password user
- Hapus user (kecuali diri sendiri)
- Role badges (SUPER_ADMIN, ADMIN, USER)

### 📜 **Activity Log (Super Admin)**
- Mencatat semua aktivitas sistem:
  - Login success/failed
  - Create/Update/Delete asset
  - Create/Approve/Reject/Return loan
  - Create/Update/Delete user
- Menyimpan IP address & user agent
- Filter berdasarkan aksi, user, tanggal
- Export ke Excel & PDF
- Pagination

### 🎨 **UI/UX Features**
- Sidebar responsif (mobile friendly)
- Loading states dengan spinner
- Toast notifications (success/error)
- Modal konfirmasi untuk hapus
- Form validasi client-side
- Status badges dengan warna berbeda
- Search & filter di semua halaman list

### 🔗 **Integrasi External**
- **Persona HRIS API** untuk data karyawan real-time
- Proxy API di Next.js untuk bypass CORS

---

## 🛠️ **TEKNOLOGI**

- **Frontend**: Next.js 16.1.6 (App Router)
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Export**: XLSX, jsPDF, jspdf-autotable
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

---

## 🚀 **DEMO AKUN**

### **Super Admin**
```
Email: diki@gmail.com
Password: password123
```

### **Admin**
```
Email: sela@gmail.com  
Password: password123
```

---

## ⚙️ **INSTALASI**

### **Prerequisites**
- Node.js 18+
- npm / yarn / pnpm
- Supabase account
- Persona HRIS API (opsional)

### **Langkah-langkah**

1. **Clone repository**
```bash
git clone https://github.com/Wizardx15/asset-management-next.git
cd asset-management-next
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_PERSONA_API_URL=https://persona-hris.vercel.app
```

4. **Setup database**
Jalankan SQL di Supabase:
- Tabel users, assets, asset_loans, activity_logs
- (lihat file `schema.sql` di repository)

5. **Jalankan development server**
```bash
npm run dev
```

6. **Buka di browser**
```
http://localhost:3000
```

---

## 📁 **STRUKTUR FOLDER**

```
asset-management-next/
├── app/
│   ├── (auth)/           # Halaman login & register
│   ├── (main)/           # Halaman utama (dashboard, assets, loans)
│   │   ├── admin/        # Halaman admin (users, activity, settings)
│   │   ├── assets/       # Manajemen asset
│   │   ├── dashboard/    # Dashboard
│   │   └── loans/        # Manajemen peminjaman
│   └── api/              # API routes (auth, activity, persona proxy)
├── components/           # Komponen UI
├── lib/                  # Utilities (auth, supabase, activity logger)
├── public/               # Static files
├── middleware.ts         # NextAuth middleware
└── package.json
```

---

## 🌐 **DEPLOYMENT**

### **Deploy ke Vercel**

1. Push ke GitHub
```bash
git add .
git commit -m "ready to deploy"
git push origin main
```

2. Import project di [Vercel](https://vercel.com)
   - Connect GitHub repository
   - Add environment variables
   - Deploy

3. Update `NEXTAUTH_URL` di Vercel dengan URL production

---

## 📊 **DATABASE SCHEMA**

### **Users**
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  jabatan TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Assets**
```sql
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kategori TEXT,
  lokasi TEXT,
  status TEXT DEFAULT 'TERSEDIA',
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Asset Loans**
```sql
CREATE TABLE asset_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id),
  employee_nik TEXT,
  peminjam_nama TEXT NOT NULL,
  peminjam_email TEXT,
  peminjam_department TEXT,
  peminjam_position TEXT,
  keperluan TEXT,
  tgl_pinjam DATE,
  tgl_kembali DATE,
  catatan TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Activity Logs**
```sql
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  user_name TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤝 **KONTRIBUSI**

Silakan buat pull request atau laporkan issues di [GitHub repository](https://github.com/Wizardx15/asset-management-next).

---

## 📝 **LISENSI**

########

---

## 👨‍💻 **DEVELOPER**

Dibuat oleh **Wizardx** untuk keperluan demo portfolio.

---

**© 2026 Asset Management System. All rights reserved.**
