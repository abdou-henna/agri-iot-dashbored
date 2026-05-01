# Smart Farm IoT Project

This repository contains two main parts:

- `dashboard/` — React + Vite frontend for the Smart Farm IoT dashboard
- `WebService/` — Node.js/Express backend service with PostgreSQL access

## Notes for the team

- Do not commit private credentials or env files.
- `dashboard/database_connection.private.md` is local-only and should remain untracked.
- `dashboard/node_modules/` and `WebService/node_modules/` are ignored.
- The frontend is built with Vite and TypeScript.

## Quick start for the dashboard

```bash
cd dashboard
npm install
npm run dev
```

## Backend notes

The `WebService/` folder already contains its own Git repository. If you want to include it in the root repository as a subproject, keep it as a separate module or remove its nested `.git` metadata before adding the root repo.

## Recommended GitHub setup

1. Initialize Git in the root folder:

```bash
git init
```

2. Add files and commit:

```bash
git add .
git commit -m "Initial project import"
```

3. Add a remote and push:

```bash
git remote add origin <your-github-url>
git push -u origin main
```

## What to include in GitHub

- All source code under `dashboard/src`
- `dashboard/package.json`, `dashboard/tsconfig.json`, `dashboard/vite.config.ts`
- Docs and architecture files
- `WebService/src`, `WebService/package.json`, `WebService/sql/`

## What not to include

- `dashboard/database_connection.private.md`
- `dashboard/validation_report_data.json`
- any local `.env` files
- node_modules and build output
