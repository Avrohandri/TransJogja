# 🚌 Web Aplikasi Trans Jogja

Selamat datang di repositori **Trans Jogja Web Application**! Proyek ini merupakan platform berbasis web yang dirancang untuk mempermudah pengguna layanan transportasi umum Trans Jogja dalam mengakses informasi rute, melihat titik halte, serta melakukan berbagai layanan transaksi secara digital.

## 🌟 Tentang Proyek

Aplikasi ini dibangun untuk meningkatkan pengalaman penumpang Trans Jogja dengan antarmuka yang modern, responsif, dan mudah digunakan.

Beberapa fitur utama yang terdapat pada aplikasi ini meliputi:
- **Peta & Rute Interaktif**: Integrasi dengan Google Maps API untuk menampilkan visualisasi rute perjalanan Trans Jogja yang akurat (seperti pemetaan halte dan jalur rute).
- **Sistem Akun Pengguna**: Fitur registrasi, login, dan manajemen profil yang aman terintegrasi dengan **Firebase**.
- **Layanan Transaksi**: Sistem yang memfasilitasi pencatatan dan pengelolaan transaksi terkait perjalanan (di-handle melalui *Transaction Service*).
- **Informasi Real-time**: Mengelola informasi jadwal dan *routing* perjalanan untuk penumpang.

## 🚀 Teknologi yang Digunakan

Proyek ini dibangun menggunakan *stack* teknologi web yang *scalable* dan modern:
- **Framework Utama**: [Next.js](https://nextjs.org/) (React) menggunakan sistem App Router.
- **Bahasa Pemrograman**: TypeScript
- **Styling**: Tailwind CSS
- **Backend & Layanan Utama**: Firebase (untuk Database dan Autentikasi)
- **Peta**: Google Maps JavaScript API

## 🛠️ Cara Menjalankan Proyek secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di perangkat Anda untuk keperluan *development*:

1. **Clone Repositori**
   ```bash
   git clone <url-repositori-anda>
   cd TransJogja
   ```

2. **Instalasi Dependensi**
   Pastikan Anda sudah menginstal Node.js, kemudian jalankan:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Pengaturan Environment Variables**
   Proyek ini menggunakan layanan eksternal (seperti Firebase dan Google Maps) yang membutuhkan API Keys. 
   Salin *template environment* dengan perintah:
   ```bash
   cp .env.example .env.local
   ```
   Lalu buka file `.env.local` dan masukkan kredensial Firebase serta Google Maps API Key Anda.

4. **Menjalankan Server Pengembangan**
   Mulai jalankan server lokal dengan perintah:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Membuka Aplikasi**
   Buka browser Anda dan arahkan ke [http://localhost:3000](http://localhost:3000).

## 🤝 Kolaborasi & Kontribusi

Jika Anda merupakan bagian dari tim *developer* proyek ini, pastikan untuk membuat *branch* fitur baru dan mengajukan *Pull Request* sebelum menggabungkan (*merge*) perubahan ke *branch* utama.

---

*Mobilitas lebih mudah dan efisien bersama Trans Jogja!* 🚌
