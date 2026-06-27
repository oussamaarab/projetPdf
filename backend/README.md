# ConvertHub Laravel 12 Backend

Production-ready REST backend for the React frontend in `../frontend`.

## No Database

This backend intentionally uses no database, migrations, models, or Eloquent.

- Sessions: `file`
- Cache and rate limiting: `file`
- Queue default: `sync`
- Temporary API tokens: JSON files in `storage/app/tokens`
- Conversions/history/favorites: JSON files in `storage/app/conversions`

## Required System Binaries

Install these on the server and set the paths in `.env` when they are not available on `PATH`.

- FFmpeg and FFprobe
- Ghostscript
- LibreOffice
- ImageMagick
- 7-Zip
- UnRAR

Windows examples:

```env
FFMPEG_BINARY=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_BINARY=C:\ffmpeg\bin\ffprobe.exe
GHOSTSCRIPT_BINARY=C:\Program Files\gs\gs10.05.1\bin\gswin64c.exe
LIBREOFFICE_BINARY=C:\Program Files\LibreOffice\program\soffice.exe
IMAGEMAGICK_BINARY=C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe
SEVEN_ZIP_BINARY=C:\Program Files\7-Zip\7z.exe
UNRAR_BINARY=C:\Program Files\WinRAR\UnRAR.exe
```

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

Do not run migrations. None are required.

For the React app, set:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Queue

The default `QUEUE_CONNECTION=sync` works without a database and runs conversions during the request.

For production background processing without a database, use Redis:

```env
QUEUE_CONNECTION=redis
CACHE_STORE=redis
```

Then run:

```bash
php artisan queue:work --tries=1 --timeout=0
```

## Cleanup

Temporary files expire according to `CONVERSION_TEMP_TTL_MINUTES`.

Run manually:

```bash
php artisan conversions:cleanup
```

Or schedule Laravel's scheduler:

```bash
php artisan schedule:work
```

## Main API

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/user`
- `POST /api/convert`
- `GET /api/conversions`
- `GET /api/conversions/{id}`
- `GET /api/conversions/{id}/download`
- `DELETE /api/conversions/{id}`
- `GET /api/tools`
- `GET /api/tools/{tool}`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/{tool}`

Tool-specific aliases such as `POST /api/pdf/merge`, `POST /api/video/trim`, and `POST /api/archive/extract` are also registered.
