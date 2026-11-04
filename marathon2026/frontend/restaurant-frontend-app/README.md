# Restaurant frontend

Angular frontend для статичного хостингу на Render.

## Деплой на Render

1. Підключіть репозиторій у Render і вкажіть Root Directory:
   `marathon2026/frontend/restaurant-frontend-app`.
2. Використайте конфігурацію з [`render.yaml`](./render.yaml). Вона виконує
   `npm install && npm run build` і публікує
   `dist/restaurant-frontend-app/browser`.
3. `BACKEND_URL` необов'язкова: якщо її не задано або вказано `https://example.com`,
   збірка працює в демо-режимі з мок-меню. З URL реального API фронтенд використовує backend,
   а `/signup?demo` створює локального демо-користувача без мережевого запиту.
4. Запустіть Deploy. SPA-маршрути автоматично перенаправляються на
   `index.html` через rewrite-правило.

## Локальна збірка

```bash
npm install
BACKEND_URL=https://api.example.org npm run build
```

Для PowerShell:

```powershell
$env:BACKEND_URL = "https://api.example.org"
npm run build
```

У локальному режимі `npm start` використовує backend URL із
`src/environments/environment.development.ts`.
