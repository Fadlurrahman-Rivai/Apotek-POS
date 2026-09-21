# ============================================================
# Dockerfile — Service: Backend API (Node.js/Express)
# Sangat ringan (~70MB image), memory footprint < 40MB
# ============================================================

FROM node:20-alpine
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/healthz || exit 1

CMD ["node", "server.js"]
