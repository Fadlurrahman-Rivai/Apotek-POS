# ============================================================
# Dockerfile — Service: Gateway (Nginx Alpine Reverse Proxy)
# Super ringan (~10MB RAM), static asset caching, dan kompresi Gzip
# ============================================================

FROM nginx:1.27-alpine

# Hapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Pasang konfigurasi kustom Apotek Gateway
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
