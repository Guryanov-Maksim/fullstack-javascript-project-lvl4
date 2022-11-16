setup: prepare install db-migrate

db-migrate:
	npx knex migrate:latest

build:
	npm run build

install:
	npm ci

lint:
	npx eslint .

prepare:
	cp -n .env.example .env || true

start:
	heroku local -f Procfile.dev

start-backend:
	npm start -- --watch --verbose-watch --ignore-watch='node_modules .git .sqlite'

start-frontend:
	npx webpack --watch --progress

test:
	npm test
