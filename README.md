# 🚌 Web Aplikasi Trans Jogja

Selamat datang di repositori **Trans Jogja Web Application**! Proyek ini merupakan platform berbasis web yang dirancang untuk mempermudah pengguna layanan transportasi umum Trans Jogja dalam mengakses informasi rute, melihat titik halte, serta melakukan berbagai layanan transaksi secara digital.

## 🌟 Tentang Proyek

Aplikasi ini dibangun untuk meningkatkan pengalaman penumpang Trans Jogja dengan antarmuka yang modern, responsif, dan mudah digunakan.

Beberapa fitur utama yang terdapat pada aplikasi ini meliputi:
- **Peta & Rute Interaktif**: Integrasi dengan Google Maps API dan pemrosesan data **GeoJSON** untuk menampilkan visualisasi rute perjalanan Trans Jogja yang presisi (seperti jalur Rute 14 Bandara Adisucipto ke Terminal Pakem).
- **Pelacakan Lokasi Bus**: Fitur pemantauan pergerakan dan posisi armada bus (melalui *Bus Location Service*).
- **Analisis Permintaan (Demand)**: Layanan analisis kebutuhan operasional dan pergerakan penumpang (*Demand Service*).
- **Ekspor Laporan (CSV)**: Sistem yang memungkinkan admin/pengguna mengekspor data laporan atau transaksi ke dalam bentuk file CSV (*CSV Export Service*).
- **Sistem Akun Pengguna**: Fitur registrasi, login, dan manajemen profil yang aman terintegrasi dengan **Firebase**.
- **Layanan Transaksi**: Sistem yang memfasilitasi pencatatan dan pengelolaan transaksi terkait perjalanan pengguna (*Transaction Service*).

## 🚀 Teknologi yang Digunakan

Proyek ini dibangun menggunakan *stack* teknologi web yang *scalable* dan modern:
- **Framework Utama**: [Next.js](https://nextjs.org/) (React) menggunakan sistem App Router.
- **Bahasa Pemrograman**: TypeScript
- **Styling**: Tailwind CSS
- **Backend & Layanan Utama**: Firebase (untuk Database Firestore dan Autentikasi)
- **Peta & Data Geospasial**: Google Maps JavaScript API & format GeoJSON

---

*Mobilitas lebih mudah dan efisien bersama Trans Jogja!* 🚌
