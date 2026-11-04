# Restaurant frontend

Angular frontend для статичного хостингу на Render.

## Деплой на Render

1. Підключіть репозиторій у Render і вкажіть Root Directory:
   `marathon2026/frontend/restaurant-frontend-app`.
2. Використайте конфігурацію з [`render.yaml`](./render.yaml). Вона виконує
   `npm install && npm run build` і публікує
   `dist/restaurant-frontend-app/browser`.
3. У Render додайте змінну середовища `BACKEND_URL` зі URL API. Вона потрібна
   скрипту production-збірки.
4. Запустіть Deploy. SPA-маршрути автоматично перенаправляються на
   `index.html` через rewrite-правило.

## Локальна збірка

```bash
npm install
BACKEND_URL=https://example.com npm run build
```

Для PowerShell:

```powershell
$env:BACKEND_URL = "https://example.com"
npm run build
```
