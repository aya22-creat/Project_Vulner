FROM node:20-alpine AS builder

WORKDIR /app

COPY code-scan-api/package*.json ./

RUN npm ci

COPY code-scan-api/ .

RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY code-scan-api/next.config.mjs .

EXPOSE 3001

ENV NEXT_PUBLIC_API_BASE_URL=http://api:5284
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001', r => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["npm", "start"]
