# To be run from the repo root
FROM node:20.17-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY ./package.json ./package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./src ./src
COPY ./index.html ./index.html
COPY ./public ./public
COPY ./package.json ./vite.config.ts ./tsconfig.json ./tsconfig.*.json ./

ENV GENERATE_SOURCEMAP=false

RUN NODE_ENV=production npm run build

# Production image
FROM nginx:alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./public

COPY ./config/nginx.conf /etc/nginx/nginx.conf

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]
