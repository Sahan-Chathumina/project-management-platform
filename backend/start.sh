#!/bin/sh
set -e

php artisan migrate --force
php artisan db:seed --force

apache2-foreground