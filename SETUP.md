# Setup — GitHub Profile Ihya

Paket ini dibuat untuk repository profil GitHub **ihyaabrar/ihyaabrar**.

## Struktur file

```text
ihyaabrar/
├─ README.md
├─ SETUP.md
├─ assets/
│  ├─ hero.png
│  └─ design-preview.png
└─ .github/
   └─ workflows/
      ├─ profile-cards.yml
      ├─ profile-3d.yml
      └─ snake.yml
```

Beberapa file SVG di folder `assets/` dan `profile-3d-contrib/` akan dibuat otomatis oleh GitHub Actions setelah repository di-push.

## Cara pasang

1. Pastikan kamu memiliki repository profil bernama persis:
   `ihyaabrar/ihyaabrar`

2. Upload **semua isi folder paket ini** ke root repository tersebut, termasuk folder tersembunyi `.github`.

3. Commit dan push ke branch `main`.

4. Buka:
   `GitHub repository → Actions`

5. Jalankan workflow berikut sekali secara manual jika belum otomatis berjalan:
   - **Profile Cards**
   - **GitHub Profile 3D Contrib**
   - **Contribution Snake**

6. Tunggu workflow selesai. Workflow akan membuat:
   - `assets/overview.light.svg`
   - `assets/overview.dark.svg`
   - `assets/contributions.light.svg`
   - `assets/contributions.dark.svg`
   - `assets/languages.light.svg`
   - `assets/languages.dark.svg`
   - `assets/repositories.light.svg`
   - `assets/repositories.dark.svg`
   - `assets/github-snake.svg`
   - `assets/github-snake-dark.svg`
   - `profile-3d-contrib/*.svg`

7. Refresh halaman profil GitHub.

## Jika workflow tidak dapat melakukan push

Buka repository:

`Settings → Actions → General → Workflow permissions`

Pastikan workflow diizinkan memiliki **Read and write permissions** jika kebijakan akun/repository mengharuskannya.

## Tentang statistik

`profile-cards.yml` membuat SVG statistik di repository sendiri. Ini sengaja dipilih agar bagian statistik utama tidak tergantung pada URL card publik yang dapat pause atau terkena rate limit.

Secara default workflow memakai `GITHUB_TOKEN` bawaan GitHub Actions untuk data publik.

## Mengganti Featured Projects

Di `README.md`, cari bagian:

- `PULSAR`
- `Game Project`
- `BKMT Website`

Saat repository project sudah ditentukan, ganti link pencarian GitHub dengan URL repository langsung.

## Mengganti Tech Stack

Cari parameter berikut di `README.md`:

```text
https://skillicons.dev/icons?i=python,js,ts,react,nodejs,html,css,git,docker,mysql
```

Tambahkan atau hapus teknologi sesuai kebutuhan.

## File desain

`assets/design-preview.png` adalah mockup desain penuh yang menjadi acuan visual.

`assets/hero.png` adalah potongan hero yang digunakan langsung di README.
