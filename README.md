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
```

> **Status note:** the UI, mocked data layer, and Capacitor packaging are built.
> PostgreSQL + Prisma (and the real-time API layer) are the planned backend and
> are not wired up yet — see [Status](#status).

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
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
EMAIL_PROVIDER_API_KEY=
SMS_AUTH_TOKEN=
REALTIME_URL=
```

See [`.env.example`](.env.example) for the full list.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
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
