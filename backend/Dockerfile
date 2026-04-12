# Этап 1: Сборка
FROM node:20-alpine AS builder

WORKDIR /app

# Отключаем проверку SSL для npm (для корпоративных сетей с прокси)
RUN npm config set strict-ssl false

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm ci || npm install

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Этап 2: Продакшен
FROM node:20-alpine AS production

WORKDIR /app

# Отключаем проверку SSL для npm
RUN npm config set strict-ssl false

# Копируем package.json для продакшен-зависимостей
COPY package*.json ./

# Устанавливаем только продакшен-зависимости
RUN npm install --omit=dev

# Копируем собранный код из builder
COPY --from=builder /app/dist ./dist

# Копируем шрифты для PDF (создаём директорию и копируем файлы)
RUN mkdir -p ./dist/assets/fonts
COPY --from=builder /app/src/assets/fonts/*.ttf ./dist/assets/fonts/

# Открываем порт
EXPOSE 3001

# Переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3001

# Запускаем приложение
CMD ["node", "dist/main.js"]
