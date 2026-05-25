#!/bin/bash
set -e

# Fix storage & cache permissions so Laravel can write logs, sessions, cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Install Composer dependencies if vendor is missing (first-time setup)
if [ ! -d "/var/www/html/vendor" ]; then
    echo "[entrypoint] vendor/ not found — running composer install..."
    cd /var/www/html && composer install --no-interaction --prefer-dist --optimize-autoloader
fi

exec "$@"
