.PHONY: dev dev-backend dev-frontend build test lint pint pest fmt e2e

dev:
	cd BACKEND && php artisan serve:all

dev-backend:
	cd BACKEND && php artisan serve --host=localhost --port=8000

dev-frontend:
	cd FRONTEND && pnpm dev

build:
	cd FRONTEND && pnpm build

test:
	cd BACKEND && php artisan test
	cd FRONTEND && pnpm test:run

lint:
	cd BACKEND && ./vendor/bin/pint --test
	cd FRONTEND && pnpm lint

pint:
	cd BACKEND && ./vendor/bin/pint

pest:
	cd BACKEND && ./vendor/bin/pest

fmt: pint
	cd FRONTEND && pnpm lint --fix 2>/dev/null || pnpm lint

e2e:
	@echo "Need BACKEND :8000 + FRONTEND :5174 + playwright. Run: python e2e_test.py"
