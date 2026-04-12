# МИС Клиники — Медицинская Информационная Система

Веб-приложение для автоматизации работы клиники: управление пациентами, приёмами, ЭМК, складом и отчётами.

## Стек

- **Бэкенд:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Фронтенд:** React 18 + TypeScript + Webpack
- **Аутентификация:** JWT (access + refresh)

## Функционал

| Модуль | Описание |
|--------|----------|
| Пациенты | CRUD, поиск, карта пациента |
| Приёмы | Планирование, слоты, статусы |
| ЭМК | История болезни, анамнез, аллергии |
| Назначения | Медикаменты, процедуры |
| Склад | Приход/списание, контроль остатков (admin) |
| Отчёты | Сводка, экспорт PDF/Excel (admin) |

## Роли

- **admin** — полный доступ
- **doctor** — пациенты, приёмы, ЭМК

## Быстрый старт (Docker)

```bash
# 1. Настроить окружение и прописать все env переменные
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Запустить
docker-compose up

# 3. Открыть фронтенд
```

## Локальная разработка

```bash
# База данных
createdb mis_clinic
psql -d mis_clinic -f database/schema.sql

# Бэкенд (порт 3001)
cd backend && npm install && npm run start:dev

# Фронтенд (порт 3000)
cd frontend && npm install && npm run dev
```