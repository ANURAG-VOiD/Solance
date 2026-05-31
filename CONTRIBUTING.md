# Contributing to Solance

Thank you for contributing. This guide covers the essentials for local development and pull requests.

## Local setup

See [COMMANDS.md](COMMANDS.md) for running Postgres, the Rust backend, the Next.js frontend, and the full Docker stack.

## Branch strategy

- Do all work on feature branches off `main`.
- Open pull requests into `main`; do not push directly to `main`.

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling, deps, config
- `docs:` — documentation only

## Environment

- Never commit `.env` or other secret files.
- Copy from `.env.example` (root and `backend/.env.example`) and fill in values locally.

## Before opening a PR

Run these from the repo root:

```bash
cd backend && cargo test
cd frontend && npm run build
./scripts/smoke-test.sh   # with the stack running
```

Ensure CI would pass: backend tests, frontend production build, and smoke checks against a healthy stack.
