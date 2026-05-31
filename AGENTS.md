# Repository Guidelines

## Project Structure & Module Organization

This is a multi-app AI trading platform. Backend code lives in `backend/uteki`, organized by domain under `backend/uteki/domains` such as `agent`, `data`, `company`, `auth`, and `notification`. Backend tests are in `backend/tests`; migrations are in `backend/alembic`.

The web app is in `frontend/src`: UI in `components`, routes in `pages`, API clients in `api`, state in `stores`, and shared types in `types`. Documentation is in `docs` and `docs-site`. Flutter code is in `mobile/lib`, with tests in `mobile/test`. Root-level `scripts` and `docker-compose.yml` support local infrastructure.

## Build, Test, and Development Commands

- `./scripts/start-full.sh`: start local infrastructure services.
- `cd backend && poetry run python -m uteki.main_dev`: run the local FastAPI backend on `localhost:8888`.
- `cd backend && poetry run pytest`: run backend tests with coverage.
- `cd backend && poetry run ruff check . && poetry run mypy .`: lint and type-check Python.
- `cd frontend && npm run dev`: run Vite on `localhost:5173`.
- `cd frontend && npm run build`: build the frontend.
- `cd docs-site && npm run docs:dev`: run the documentation site locally.
- `cd mobile && flutter test`: run Flutter tests.

## Coding Style & Naming Conventions

Python targets 3.10, uses Ruff with 100-character lines, and MyPy strict mode. Use typed functions, `snake_case` modules/functions, `PascalCase` classes, and domain-local services/models.

Frontend code is TypeScript React. Use `PascalCase` components, `camelCase` hooks/utilities, and route-level views in `src/pages`. Run `npm run format` for Prettier formatting.

## Testing Guidelines

Backend tests use Pytest and follow `test_*.py`, `Test*`, and `test_*` naming. Prefer unit tests for domain logic and integration tests for API/database behavior. Keep reusable market/company scenarios in `backend/tests/fixtures`. Coverage reports to terminal and `backend/htmlcov`.

Frontend currently has lint/build checks rather than a committed test runner. For UI changes, run `npm run build` and include manual verification notes. For Flutter changes, update `mobile/test/*_test.dart`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits, for example `feat(company-agent): ...`, `fix(llm): ...`, and `ci: ...`. Use a short imperative subject with an optional scope.

Pull requests should include a summary, linked issue or OpenSpec change when applicable, test commands run, and screenshots or recordings for visible UI changes. Mention migrations, new environment variables, or data backfill needs.

## Security & Configuration Tips

Do not commit secrets. Use `backend/.env` for local API keys and database settings, starting from `.env.example` or `backend/.env.example`. Local SQLite development should stay isolated from production PostgreSQL/Supabase configuration.
