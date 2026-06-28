FROM php:8.2-cli

WORKDIR /var/www

# System packages
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    wget \
    ffmpeg \
    ghostscript \
    imagemagick \
    libreoffice \
    p7zip-full \
    unrar-free \
    python3 \
    python3-pip \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install zip

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel
RUN cp .env.example .env || true
RUN php artisan key:generate --force || true

# Permissions
RUN chmod -R 775 storage bootstrap/cache

# Render uses PORT env variable
EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}