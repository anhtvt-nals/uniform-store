FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY apps/admin-api/package.json apps/admin-api/
COPY apps/storefront-api/package.json apps/storefront-api/
COPY libs/common/package.json libs/common/
COPY libs/database/package.json libs/database/
COPY libs/shared/package.json libs/shared/

RUN npm install

COPY . .

RUN npx nest build common && npx nest build database && npx nest build shared
RUN for lib in common database shared; do \
      rm -rf "node_modules/@app/$lib" \
      && cp -r "dist/libs/$lib" "node_modules/@app/$lib" \
      && printf '{"name":"@app/%s","version":"0.1.0","private":true,"main":"index.js"}' "$lib" > "node_modules/@app/$lib/package.json"; \
    done
RUN npm run build:admin

FROM node:22-alpine
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --chown=app:app --from=build /app/dist ./dist
COPY --chown=app:app --from=build /app/node_modules ./node_modules
COPY --chown=app:app --from=build /app/package.json ./package.json

USER app

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["node", "dist/apps/admin-api/main"]
