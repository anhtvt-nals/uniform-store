FROM node:22-alpine AS build
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY apps/storefront-api/package.json apps/storefront-api/
COPY libs/common/package.json libs/common/
COPY libs/database/package.json libs/database/
COPY libs/shared/package.json libs/shared/

RUN npm ci

COPY . .

RUN npm run build:storefront

FROM node:22-alpine
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --chown=app:app --from=build /app/dist ./dist
COPY --chown=app:app --from=build /app/node_modules ./node_modules

USER app

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/apps/storefront-api/main"]
