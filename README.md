# TAMANNA MOTORS — POS & Inventory

This repository contains the current TAMANNA MOTORS application, including the excavator sign-in screen, updated home dashboard, POS terminal, and business modules.

## Current application

- Framework: TanStack Start with React and Vite.
- Entry: `src/routes/index.tsx` renders `src/tamanna/App.tsx`.
- Sign-in: `src/tamanna/components/AuthScreen.tsx`.
- Home: `src/tamanna/components/DashboardView.tsx`.
- Theme: `src/styles.css` defines the design tokens and excavator sign-in; `src/tamanna/tamanna.css` supports the active business screens and home dashboard.
- Real records are stored separately in Lovable Cloud. Downloading or syncing this repository does not export the live database.

Use the branch connected in Lovable when downloading from GitHub. Another branch, an older ZIP, or an existing deployment may still contain an earlier version. Lovable changes sync automatically to its connected GitHub branch; restarting a previously downloaded copy does not update that copy.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a47c811-3c61-4d0e-9774-62f18cec2f66).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
