# Use a small, supported Node.js runtime
FROM node:22-alpine

WORKDIR /app

# Compatibility layer for native packages on Alpine
RUN apk add --no-cache libc6-compat

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the application source (secrets are excluded via .dockerignore)
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 4987

# Build once on first container start; later restarts reuse .next
CMD ["sh", "-c", "if [ ! -f .next/BUILD_ID ]; then npm run build; fi && npm start"]
