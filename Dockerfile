FROM oven/bun:1 AS build

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build


FROM node:22-alpine AS production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nextjs:nodejs /app/public ./public

EXPOSE 3000
CMD node_modules/.bin/next start
