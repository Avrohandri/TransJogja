# 🍲 Web Game Kuliner Nusantara

Selamat datang di repositori **Web Game Kuliner Nusantara**! Proyek ini merupakan platform permainan edukatif interaktif berbasis web yang didedikasikan untuk memperkenalkan dan melestarikan kekayaan kuliner tradisional dari berbagai daerah di Indonesia (seperti Jogja, Bali, Aceh, dan Maluku).

## 🎮 Tentang Proyek

Aplikasi ini mengajak pemain untuk merasakan pengalaman memasak hidangan tradisional melalui berbagai minigame seru. Tujuannya adalah untuk memberikan edukasi seputar proses pembuatan, bahan-bahan, dan keunikan kuliner khas Nusantara dengan cara yang menyenangkan.

Beberapa fitur dan minigame yang tersedia di dalam web ini antara lain:
- **Pisang Asar Minigame**: Simulasi pembuatan hidangan khas, lengkap dengan interaksi alat dan bahan.
- **Samaloyang Minigame**: Simulasi memasak dengan efek visual dan audio yang menarik.
- **Suki Kuliner**: Game interaktif dengan mekanik interaksi *drop and merge* yang menantang.
- **Papan Peringkat (Leaderboard)**: Sistem akumulasi skor untuk melacak pencapaian pemain dari berbagai level daerah.
- **Admin Dashboard**: Panel manajemen untuk memantau aktivitas dan mengatur konten permainan.

## 🚀 Teknologi yang Digunakan

Proyek ini dibangun menggunakan *stack* teknologi modern untuk memastikan pengalaman bermain yang lancar dan antarmuka pengguna yang memukau:
- **Framework Utama**: [Next.js](https://nextjs.org/) (React)
- **Bahasa Pemrograman**: TypeScript
- **Styling**: Tailwind CSS
- **Peta & Rute**: Google Maps JavaScript API (untuk rute interaktif)

## 🛠️ Cara Menjalankan Proyek secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di perangkat Anda:

1. **Clone Repositori**
   ```bash
   git clone <url-repositori-anda>
   cd TransJogja
   ```

2. **Instalasi Dependensi**
   Pastikan Anda memiliki Node.js terinstal. Jalankan perintah:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Pengaturan Environment Variables**
   Salin template environment dengan cara mengubah nama `.env.example` menjadi `.env.local`, lalu isi nilai yang dibutuhkan (seperti API Keys):
   ```bash
   cp .env.example .env.local
   ```

4. **Menjalankan Server Pengembangan (Development)**
   Mulai jalankan proyek dengan perintah:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. **Membuka Aplikasi**
   Buka browser Anda dan arahkan ke [http://localhost:3000](http://localhost:3000) untuk mulai bermain!

## 🤝 Berkontribusi

Kontribusi Anda sangat berharga bagi pengembangan game ini. Jika Anda menemukan *bug*, memiliki saran fitur baru, atau ingin ikut berkontribusi dalam kode, jangan ragu untuk membuka *Issue* atau mengirimkan *Pull Request*.

---

*Mari bermain, belajar, dan lestarikan kuliner khas Nusantara!* 🇮🇩
