#!/bin/bash
set -e

# 권한 정리 (Amazon Linux=nginx, Ubuntu=www-data 자동 대응)
chown -R nginx:nginx /var/www/html 2>/dev/null \
  || chown -R www-data:www-data /var/www/html

# nginx 설정 검사 후 재적용
nginx -t
systemctl reload nginx
