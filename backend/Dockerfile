# ─────────────────────────────────────────────────────────────────────────────
# ConvertHub – production Dockerfile
# Works on Render (Linux/amd64) and locally on Windows via Docker Desktop.
# ─────────────────────────────────────────────────────────────────────────────
FROM php:8.2-cli

# Avoid interactive prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# ── System packages ───────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl unzip zip ca-certificates \
        ffmpeg \
        ghostscript \
        imagemagick \
        libreoffice-writer \
        libreoffice-impress \
        libreoffice-calc \
        libreoffice-draw \
        p7zip-full \
        python3 \
        python3-pip \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install zip mbstring xml \
    # Install unrar (non-free). Try the non-free package first; fall back to
    # unrar-free (which provides the same CLI as `unrar` on Debian 12+).
    && ( apt-get install -y --no-install-recommends unrar \
         || apt-get install -y --no-install-recommends unrar-free ) \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ── ImageMagick: unlock PDF processing ───────────────────────────────────────
# Debian ships a hardened policy that disallows PDF by default.
# We patch both possible policy locations (IM6 and IM7).
RUN for policy in \
        /etc/ImageMagick-6/policy.xml \
        /etc/ImageMagick-7/policy.xml \
        /usr/local/etc/ImageMagick-7/policy.xml ; do \
    if [ -f "$policy" ]; then \
        sed -i \
            's|<policy domain="coder" rights="none" pattern="PDF" />|<policy domain="coder" rights="read|write" pattern="PDF" />|g' \
            "$policy"; \
    fi; \
done

# ── Python: install python-pptx (needed by pdf_to_pptx.py) ───────────────────
RUN pip3 install --break-system-packages python-pptx Pillow 2>/dev/null || \
    pip3 install python-pptx Pillow

# ── Verify that key binaries are present ─────────────────────────────────────
RUN ffmpeg -version 2>&1 | head -1 \
 && gs    --version \
 && soffice --version \
 && python3 --version \
 && 7z i 2>&1 | head -2 \
 && (magick -version 2>/dev/null || convert -version 2>/dev/null | head -1)

# ── Composer ─────────────────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Application ──────────────────────────────────────────────────────────────
WORKDIR /var/www/html

# Copy dependency manifests first for better layer caching
COPY composer.json composer.lock ./

RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-progress

# Copy rest of the application (vendor/ is excluded by .dockerignore and
# already installed above, so this layer is just source files)
COPY . .

# ── Entrypoint script ─────────────────────────────────────────────────────────
RUN printf '#!/usr/bin/env bash\nset -e\nPORT="${PORT:-10000}"\ncase "${1:-serve}" in\n  serve)\n    echo "Starting Laravel on 0.0.0.0:${PORT}"\n    exec php artisan serve --host=0.0.0.0 --port="${PORT}"\n    ;;\n  worker)\n    echo "Starting queue worker"\n    exec php artisan queue:work --tries=1 --timeout=0\n    ;;\n  *)\n    exec "$@"\n    ;;\nesac\n' > /usr/local/bin/docker-entrypoint.sh \
 && chmod +x /usr/local/bin/docker-entrypoint.sh

# ── Laravel bootstrap ─────────────────────────────────────────────────────────
# Create .env from example if no real .env is present (Render injects real
# values via environment variables at runtime; the file only needs to exist).
RUN cp .env.example .env || true
RUN php artisan key:generate --force || true

# Clear any stale Windows-generated cache files that were copied in
RUN php artisan cache:clear --no-ansi || true \
 && php artisan config:clear --no-ansi || true \
 && php artisan route:clear  --no-ansi || true \
 && php artisan view:clear   --no-ansi || true

# Storage directories + permissions
RUN mkdir -p \
        storage/app/conversions \
        storage/app/tokens \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache

# Rebuild caches from the clean Linux environment
RUN php artisan config:cache  || true \
 && php artisan route:cache   || true \
 && php artisan view:cache    || true

# ── Runtime ──────────────────────────────────────────────────────────────────
EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["serve"]
