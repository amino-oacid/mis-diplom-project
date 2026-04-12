# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости (включая devDependencies для сборки)
RUN npm ci --silent --verbose

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап 2: Продакшен с nginx
FROM nginx:alpine AS production

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
