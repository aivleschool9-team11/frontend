#!/bin/bash
set -e

# 배포 디렉터리 준비 및 기존 파일 정리
mkdir -p /var/www/html
rm -rf /var/www/html/*
