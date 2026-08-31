# Piggy Bank Mobile Banking App

A premium family banking application for parents and kids, built with **Next.js, TypeScript, Tailwind CSS, PostCSS, shadcn/ui, Lucide React, Motion for React and Capacitor**.

## Features

* Login / Logout
* Create Account
* Email or SMS PIN verification
* Forgot Password
* Parent Personal Account
* Kids Accounts
* Parent → Kid transfers
* Kid → Parent transfers with permission
* Account balances
* Transaction history
* Kids bank cards
* Freeze / Unfreeze cards
* Lock / Unlock accounts
* Notifications
* Monthly analytics graph
* Avatar upload
* Responsive Mobile / Tablet / Desktop UI
* Cookie consent management

## Tech Stack

```text
Next.js
TypeScript
Tailwind CSS
PostCSS
shadcn/ui
Lucide React
Motion for React
Capacitor
PostgreSQL
Prisma
Supabase Auth
Supabase Realtime
```

The authenticated banking backend uses PostgreSQL as its source of truth,
Prisma for server-only access, Supabase Auth for identity, and Supabase
Realtime for live cache refreshes. See [backend architecture](docs/backend-architecture.md).

## Getting Started

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.example .env.local
```

Run development server:

```bash
npm run dev
```

Apply the database migration first:

```bash
npm run db:generate
npm run db:migrate
```

Open:

```text
http://localhost:3000
```

## Project Structure

```text
app/
components/
hooks/
services/
lib/
store/
types/
styles/
public/
android/
ios/
```

## Environment Variables

Never commit real secrets.

`.env.example` documents every required variable with safe placeholder values only — copy it to `.env.local` (or `.env`) and fill in real values there. `.env.local`/`.env` are gitignored; `.env.example` is committed. A representative excerpt:

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
BACKUP_DATABASE_URL=
BACKUP_ENCRYPTION_KEY=
```

See [`.env.example`](.env.example) for the full list.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:backup
npm run cap:sync
```

## Mobile App

Capacitor is used for iOS and Android packaging.

```bash
npx cap sync
npx cap open ios
npx cap open android
```

## UI / UX

The design should use:

* Premium UK banking style
* Deep blue primary colour
* White and soft-neutral backgrounds
* Rounded cards
* Subtle shadows
* Responsive layouts
* Lucide icons
* Smooth Motion animations
* Accessible controls

## Security

Sensitive actions must be validated server-side.

Do not trust client-side values for:

* Balances
* Transfers
* PIN verification
* Card status
* Account permissions

## Status

This project is under active development.

## License

Private project. All rights reserved.
