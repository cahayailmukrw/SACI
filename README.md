# Sistem Akademik Cahaya Ilmu

Sistem manajemen akademik komprehensif untuk **SIT Cahaya Ilmu - Sekolah Islam Terpadu**.

## Fitur Utama

- **Manajemen Siswa**: Pendaftaran, data siswa, riwayat akademik
- **Manajemen Guru**: Profil guru, penugasan mata pelajaran, jadwal mengajar
- **Manajemen Kelas**: Struktur kelas, wali kelas, pembagian siswa
- **Manajemen Mata Pelajaran**: Kurikulum umum dan studi Islam (Tahfidz, Akidah, Fiqih)
- **Sistem Nilai**: Ujian, tugas, rapor semester
- **Absensi**: Tracking kehadiran siswa dan guru
- **Tahfidz Quran**: Tracking hafalan surat dan juz
- **Portal Orang Tua**: Akses informasi anak
- **Dashboard Admin**: Overview statistik dan laporan
- **Laporan & Ekspor**: Cetak rapor, rekap kehadiran, statistik

## Tech Stack

- **Frontend**: React 18 + Vite
- **UI Framework**: TailwindCSS + Lucide Icons
- **Backend**: Node.js + Express
- **Database**: SQLite dengan Prisma ORM (mudah migrasi ke PostgreSQL)
- **Authentication**: JWT

## Struktur Project

```
sistem-akademik-cahaya-ilmu/
├── frontend/          # React application
├── backend/           # Express API
└── database/          # SQLite database
```

## Instalasi

```bash
# Install dependencies
npm install

# Setup database
cd backend
npx prisma generate
npx prisma db push

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`
Backend API akan berjalan di `http://localhost:3001`

## Penggunaan

### Akun Default

- **Admin**: admin@cahayailmu.sch.id / admin123
- **Guru**: guru@cahayailmu.sch.id / guru123
- **Orang Tua**: ortu@cahayailmu.sch.id / ortu123

## Lisensi

© 2024 SIT Cahaya Ilmu
