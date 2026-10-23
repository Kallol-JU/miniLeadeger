# MiniLedger

Track money lent to friends. React Native (Expo) app + Node.js/TypeScript/PostgreSQL API.

```
backend/   Express + TS + Postgres (JWT auth, mock OTP, loans, receipt upload, tests)
mobile/    React Native (Expo) app
```

## Features
- Phone + OTP login (OTP is printed in the **server log** – mock)
- Add loan (friend, amount, due date, optional **receipt photo**), mark repaid
- List with **overdue entries highlighted** + **summary card** (total lent / repaid / overdue)
- Input validation on client and server (Zod); unit tests for validation

## Run it

### 1. Backend
```bash
cd backend
cp .env.example .env
docker compose up -d      # Postgres (or point DATABASE_URL to your own)
npm install
npm run migrate
npm run dev               # http://localhost:3000
npm test                  # validation tests
```

### 2. Mobile
```bash
cd mobile
npm install
npx expo install --fix    # aligns package versions with your Expo SDK
cp .env.example .env      # set EXPO_PUBLIC_API_URL (see below)
npx expo start            # scan QR with Expo Go, or press 'a' for Android emulator
```
`EXPO_PUBLIC_API_URL`:
- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://localhost:3000`
- Real phone (same Wi‑Fi): `http://<your-PC-LAN-IP>:3000`

### Using the app
1. Enter phone → **Send OTP** → copy the 6-digit code from the backend terminal (`[MOCK OTP] ...`).
2. Verify, then tap **+** to add entries. Pull down to refresh.

## API
| Method | Path | Notes |
|---|---|---|
| POST | /auth/request-otp | `{phone}` |
| POST | /auth/verify-otp | `{phone, otp}` → `{token}` |
| POST | /loans | Bearer; JSON or multipart (`friendName, amount, dueDate, receipt?`) |
| GET | /loans | Bearer |
| PATCH | /loans/:id/repay | Bearer |
| GET | /loans/summary | Bearer → `{totalLent, totalRepaid, overdueAmount}` |

## Design notes
- Layered modules (`routes` → `service` → SQL); add a feature = add a folder under `backend/src/modules`.
- OTPs hashed, 5‑min expiry, single use, 5 attempts max. JWT 7 days; app auto-logs out on 401.
- Summary computed in SQL; all queries scoped by `user_id`.
- Receipts: images only (jpg/png/webp), ≤5 MB, random filenames, stored on local disk (swap for S3 in production).
- Overdue = not repaid and due date before today.
