# Runchise Performance Test

Repo ini berisi skrip performance test untuk endpoint `product_stocks` Runchise menggunakan [k6](https://k6.io/).

## 📋 Prasyarat

Sebelum menjalankan tes, pastikan Anda sudah menginstal **k6**:

### Windows (Lewat Winget)
```powershell
winget install k6 --source winget
```

### Windows (Lewat Chocolatey)
```powershell
choco install k6
```

### Windows (Lewat MSI Installer)
Download installer resmi di sini: [k6 Installer](https://dl.k6.io/msi/k6-latest-amd64.msi)

Verifikasi instalasi dengan command:
```bash
k6 version
```

## ⚙️ Persiapan Awal

Sebelum mulai, duplikasi file `.env.example` menjadi `.env` agar skrip bisa berjalan dengan konfigurasi lokal Anda.

```bash
cp .env.example .env
```

## ⚙️ Konfigurasi Environment

Secara default, skrip menggunakan URL: `https://pentest-server.runchise.com/api`.

### Cara 1: Menggunakan Flag (Direkomendasikan)
Anda bisa menimpa URL lewat terminal dengan flag `-e`:
```bash
k6 run -e BASE_URL=https://staging-server.runchise.com/api src/scenarios/report/product_stocks/filter_negative.js
```

### Cara 2: File .env (Perlu Update k6)
Jika k6 Anda versi terbaru (v0.42+), Anda bisa pakai file **`.env`** dan flag `--env-file .env`.
Namun jika error `unknown flag: --env-file`, gunakan Cara 1.

---

## 🚀 Cara Menjalankan

### 1. Smoke Test (Cek Cepat)
Jalankan ini untuk memastikan skrip berjalan lancar.
```bash
# Skenario 1: Negative Stock
k6 run --iterations 1 src/scenarios/report/product_stocks/filter_negative.js

# Skenario 2: All Stock
k6 run --iterations 1 src/scenarios/report/product_stocks/filter_all.js
```

### 2. Load Test (Tes Sebenarnya)
Jalankan tes dengan konfigurasi default (1 User selama 30 detik).
```bash
k6 run src/scenarios/report/product_stocks/filter_negative.js
```

### 3. Custom Run (Override Config)
Contoh: 10 user selama 1 menit.
```bash
k6 run --vus 10 --duration 1m src/scenarios/report/product_stocks/filter_all.js
```

### 4. Run Berdasarkan Iterasi (Fixed Loop)
Jalankan tes sebanyak N kali putaran, bukan berdasarkan durasi waktu.
```bash
k6 run --vus 1 --iterations 30 --max-duration 1h src/scenarios/report/product_stocks/filter_negative.js
```
**Penjelasan Command:**
- `--vus 1`: Satu user aktif.
- `--iterations 30`: Tes akan berjalan tepat 30 kali siklus (loop `default` function). Setelah ke-30 selesai, tes berhenti otomatis.
- `--max-duration 1h`: **Safety net** (batas waktu). Jika karena internet lambat 30 iterasi belum selesai dalam 1 jam, tes akan dipaksa berhenti supaya tidak hang selamanya.

---

## 📊 Membaca Report

Setelah tes selesai, file report akan otomatis dibuat di folder **`reports/`**:
- `ProductStocks_Negative.html`
- `ProductStocks_All.html`
Buka file tersebut di browser.

### Penjelasan Istilah Metrik (Penting!)

**Apa itu P(90) dan P(95)?**
Ini adalah **Percentile** (Persentil). Jauh lebih akurat daripada rata-rata (Avg) untuk mengukur kepuasan user.

-   **Avg (Rata-rata):** Sering menipu. Kalau 9 user cepat (1s) dan 1 user lambat banget (100s), rata-ratanya jadi 10s. Terlihat buruk, padahal mayoritas user happy.
-   **P(90) (90th Percentile):** Artinya **90% dari user** mengalami kecepatan DI BAWAH angka ini. Ini membuang 10% data terburuk (outlier).
-   **P(95) (95th Percentile):** Artinya **95% dari user** mengalami kecepatan DI BAWAH angka ini. Ini standar emas performa.

**Contoh:**
Jika P(95) = 2 detik, berarti dari 100 user, 95 user mendapatkan respon < 2 detik. Hanya 5 orang yang apes menunggu lama.

**Target:** Usahakan P(95) di bawah 1-2 detik.

Berikut adalah urutan waktu (lifecycle) sebuah request di k6:

| Metrik | Arti & Diagnosa | Target Ideal |
| :--- | :--- | :--- |
| **http_req_blocked** | Waktu menunggu antrian koneksi (browser limit/DNS). | < 50ms |
| **http_req_connecting** | Waktu membuat koneksi TCP ke server. Jika tinggi = internet lambat/jauh. | < 100ms |
| **http_req_tls_handshaking** | Waktu negosiasi SSL/HTTPS. | < 100ms |
| **http_req_sending** | Waktu upload data request ke server. | < 1ms (kecuali upload file) |
| **http_req_waiting** (TTFB) | **Waktu Server Mikir**. Ini murni performa Backend/DB. Jika tinggi = code/query lambat. | < 500ms |
| **http_req_receiving** | Waktu download respon dari server. Tinggi jika payload response besar. | Tergantung size data |
| **http_req_duration** | **Total Waktu**. Penjumlahan dari sending + waiting + receiving. | < 1000ms (1 detik)|
| **http_req_failed** | Persentase error (bukan 200 OK). | **HARUS 0.00%** |
| **checks** | Validasi logika script (misal: assert token). | **HARUS 100%** |

### Tab di HTML Report:
- **Summary**: Ringkasan hasil tes (Pass/Fail).
- **Charts**: Grafik throughput (RPS) dan latency seiring waktu.
