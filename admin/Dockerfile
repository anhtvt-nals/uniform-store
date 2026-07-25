FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json


ENV NODE_ENV=production
ENV PORT=5002

USER app

EXPOSE 5002

CMD ["node_modules/.bin/next", "start", "--port", "5002"]
