FROM php:8.1-fpm-alpine
WORKDIR /var/www/html
RUN apk add --no-cache composer
COPY . .
RUN composer install --no-interaction --prefer-dist
EXPOSE 8000 8080

