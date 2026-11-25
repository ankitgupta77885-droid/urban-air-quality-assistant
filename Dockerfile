# Stage 1: Build stage
FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime stage
FROM node:22-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=7860

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY src ./src
COPY tsconfig.json ./

USER node

EXPOSE 7860

CMD npx tsx src/server/index.ts
