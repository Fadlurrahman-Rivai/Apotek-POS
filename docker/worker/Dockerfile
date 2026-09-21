# ============================================================
# Dockerfile — Service: Background Worker
# Sangat ringan (~50MB image), memory footprint < 20MB
# ============================================================

FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY worker.js ./

ENV NODE_ENV=production
ENV CHECK_INTERVAL_SECONDS=3600

CMD ["node", "worker.js"]
