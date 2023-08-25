FROM node:18.7-alpine as base

FROM base as backend_deps
WORKDIR /app

COPY ./backend ./


RUN npm ci
RUN npx prisma generate

FROM base as frontend_deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY ./frontend ./

RUN npm ci


FROM base as backend_build
WORKDIR /app

COPY --from=backend_deps /app .

RUN npm run build

FROM base as frontend_build
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=frontend_deps /app .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


FROM base as production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 runner
RUN npm install -g pm2
RUN apk add curl

COPY --from=backend_build --chown=runner:nodejs /app ./backend
COPY --from=frontend_build --chown=runner:nodejs /app ./frontend
COPY ./process.json .

RUN ls -la ./frontend/.next

USER runner

EXPOSE 3000
EXPOSE 9000

CMD ["pm2-runtime", "start", "process.json"]