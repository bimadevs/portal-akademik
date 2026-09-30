# Local Storage Menggunakan AsyncStorage untuk Persistensi Data

Aplikasi portal akademik ini tidak memerlukan backend server terpisah untuk memenuhi spesifikasi tugas kuliah. Kami memutuskan untuk menggunakan `@react-native-async-storage/async-storage` sebagai mekanisme persistensi data lokal (offline-first) karena instalasi ringan, tidak membutuhkan konfigurasi native database yang rumit, dan memudahkan demo langsung di depan dosen tanpa dependensi jaringan.
