# Project: Portal Akademik UBD — Remediation

## Architecture
Portal Akademik UBD is an Expo SDK 57 / React Native 0.86 offline-first mobile application utilizing `expo-sqlite` (WAL mode, relational integrity) for local persistence, `expo-router` for file-based routing, and React Context / `AsyncStorage` for session management.
- **Presentation Layer (`src/app/`)**: Expo Router file-based screens (`(tabs)`, `login`, `mahasiswa`, `dosen`, `mata-kuliah`, `jadwal`, `krs`, `presensi`, `nilai`, `kartu`, `pengaturan`).
- **Domain & Service Layer (`src/services/`)**: 12 modular TypeScript services (`database.ts`, `auth`, `mahasiswa`, `dosen`, `mata-kuliah`, `jadwal`, `krs`, `presensi`, `nilai`, `semester`, `statistik`, `storage`).
- **State & Session (`src/context/`)**: `AuthContext` managing authentication lifecycle, session persistence, and route protection.
- **Design Tokens (`src/theme/`, `src/constants/theme.ts`)**: Universitas Buddhi Dharma corporate visual identity (Navy `#002B49`, Gold `#E5A823`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | SQLite Schema Migrations | Add missing columns to `dosen` (`prodi`, `gelar`, `email`), `mata_kuliah` (`semester`), `presensi` (`pertemuan_ke`) | M1 | survey_explorer_1 |
| F2 | Foreign Keys & Connection Recovery | Enforce `PRAGMA foreign_keys = ON;` and reset `initPromise = null` on error in `database.ts` | M1 | survey_explorer_1 |
| F3 | Foreign Key Indexes | Create 10 indexes on foreign keys and frequent lookup queries in `initSchema` | M1 | survey_explorer_1 |
| F4 | Seed Grade & IPK Remediation | Fix seed inserts with `bobot: 4.0, akhir: 85, huruf: 'A'` to ensure 3.75 - 4.00 GPA | M1 | survey_explorer_1 |
| F5 | Atomic Multi-Table Transactions | Wrap `seedInitialData`, `resetDatabase`, and `resetOperationalData` in `withTransactionAsync` | M1 | survey_explorer_1 |
| F6 | Referential Integrity Checks | Prevent transcript wipe on course delete; fix key conflation in `MahasiswaService.delete` | M1 | survey_explorer_1 |
| F7 | Transkrip Query Crash Fix | Replace `s.tahun`, `s.tipe` in `nilai-service.ts` with `s.id ASC, mk.kode ASC` | M1 | survey_explorer_1,2 |
| F8 | Statistik Query Crash Fix | Replace `jenis_kelamin` in `statistik-service.ts` with `gender`; map PRIA/L and WANITA/P | M1 | survey_explorer_1,2 |
| F9 | Jadwal Day Filter Coercion Fix | Distinguish day string from search string in `jadwal-service.ts` | M1 | survey_explorer_1,3 |
| F10 | Matkul Dosen Name Alignment | Ensure `MataKuliahService.getAll()` returns both `dosenNama` and `dosen_nama` | M1 | survey_explorer_1 |
| F11 | Semester Duplicate Prevention | Check duplicate semester names and enforce null-safe computations | M1 | survey_explorer_1,3 |
| F12 | Root Layout Universal Route Guard | Redirect unauthenticated users on ANY screen outside `/login` to `/login` in `_layout.tsx` | M2 | survey_explorer_2 |
| F13 | Logout Stack Cleansing & Back Block | `router.dismissAll()`, `router.replace('/login')`, and `BackHandler.exitApp()` on login screen | M2 | survey_explorer_2 |
| F14 | High-Entropy Tokens & 7-Day TTL | Generate UUID tokens and validate expiration on launch & `AppState` resume | M2 | survey_explorer_2 |
| F15 | Login Form Validation & Demo Chip | Preserve `admin / admin` demo quick-fill chip while validating inputs and showing error feedback | M2 | survey_explorer_2 |
| F16 | Parameterized SQL Enforcement | Verify 100% parameter binding with `?` across all 12 services | M2 | survey_explorer_2 |
| F17 | Presensi Checklist Status Fix | Case-insensitive comparison (`.toUpperCase()`) so buttons highlight properly, not red | M3 | survey_explorer_3 |
| F18 | Jadwal UI Filter Parameter Fix | Pass `{ hari: selectedHari }` object from `src/app/jadwal/index.tsx` | M3 | survey_explorer_3 |
| F19 | Double Confirmation Dialogs | Add two-step alerts for Reset Database and record deletions | M3 | survey_explorer_3 |
| F20 | Form Validation Hardening | Add regex validation for NIM (`^\d{8,12}$`), NIDN (`^\d{10}$`), and schedule time | M3 | survey_explorer_3 |
| F21 | Search Input Debounce (300ms) | Debounce search inputs to prevent SQLite UI stuttering | M3 | survey_explorer_3 |
| F22 | List Empty States | Add `ListEmptyComponent` across `nilai`, `presensi`, `krs` list views | M3 | survey_explorer_3 |
| F23 | Theme Token Consolidation | Shim `src/constants/theme.ts` to canonical `src/theme/`; safe fallback on null scheme | M4 | survey_explorer_3 |
| F24 | TypeScript Strictness & Any Removal | Replace 42 `any` types with strongly-typed interfaces and generics | M4 | survey_explorer_3 |
| F25 | Zero Lint & Typecheck Cleanliness | Achieve 0 errors in `npx tsc --noEmit` and 0 errors/warnings in `npx expo lint` | M4 | survey_explorer_3 |
| F26 | E2E Regression Verification | Verify all demo walkthroughs, security boundaries, and data integrity | M4 | all explorers |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Persistence & Service Layer Remediation | F1-F11 (`src/services/database.ts`, `nilai`, `statistik`, `jadwal`, `matkul`, `mahasiswa`, `semester`) | none | IN_PROGRESS |
| M2 | Security, Route Guard & Session Lifecycle | F12-F16 (`src/app/_layout.tsx`, `src/app/login.tsx`, `src/context/auth-context.tsx`, `src/services/storage.ts`) | none | PLANNED |
| M3 | UI/UX Completeness, Form Validation & Debounce | F17-F22 (`src/app/presensi/checklist`, `jadwal/index`, `pengaturan`, CRUD forms, search debounce) | M1 | PLANNED |
| M4 | Design System, TypeScript Strictness & Full Verification | F23-F26 (`src/constants/theme.ts`, `src/theme/`, `any` elimination, lint zero, tsc zero, E2E tests) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Database (`src/services/database.ts`) ↔ Services
- `initDatabase(): Promise<SQLiteDatabase>`: opens connection, enables `PRAGMA foreign_keys = ON;`, executes DDL + migrations, and creates 10 FK indexes.
- `seedInitialData(db)`: runs in atomic transaction, inserts valid grades (`bobot: 4.0, akhir: 85, huruf: 'A'`).
- `resetDatabase()`: runs in atomic transaction, deletes tables except active session, re-seeds.

### Auth (`src/context/auth-context.tsx`) ↔ UI
- `userSession: UserSession | null`
- `login(username, password)`: validates credentials, saves high-entropy token + 7-day TTL.
- `logout()`: clears storage, nulls session, executes `router.dismissAll()`, replaces to `/login`.
- Global Route Guard in `_layout.tsx`: redirects unauthenticated to `/login` if `segments[0] !== 'login'`.

### Jadwal Service ↔ Jadwal Screen
- `jadwalService.getAll(filter: { hari?: string; search?: string } | string)`: detects day names if string passed; accepts filter object.

### Presensi Checklist ↔ Presensi Service
- Status options: `'Hadir' | 'Izin' | 'Sakit' | 'Alpha'`. Comparison normalized via `.toUpperCase()`.

## Code Layout
- `src/app/`: Expo Router screens & layouts
- `src/components/`: Reusable UI components
- `src/constants/`: Legacy theme shim (`theme.ts`)
- `src/theme/`: Canonical design system tokens (`colors.ts`, `typography.ts`, `spacing.ts`, `index.ts`)
- `src/context/`: React context (`auth-context.tsx`)
- `src/services/`: SQLite services (`database.ts`, `*-service.ts`, `storage.ts`)
- `src/types/`: TypeScript domain interfaces
