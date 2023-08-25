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


FROM backend_deps as backend_build

RUN npm run build

FROM frontend_deps as frontend_build

RUN apk add --no-cache libc6-compat

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

USER runner

EXPOSE 3000
EXPOSE 9000

CMD ["pm2-runtime", "start", "process.json"]