# 🏆 UEFA Champions League Archive API v2.0

Proyecto de **Desarrollo de API RESTful Profesional**, **Panel Web Interactivo de SuperAdmin (`/admin`)**, **Aplicación Cliente Consumidora (`/app`)** y **Documentación OpenAPI 3.0 (`/api-docs`)** para el archivo histórico de la UEFA Champions League (1992 – Presente).

### 👨‍💻 Equipo de Desarrollo (SuperAdmins)
- **👑 Nicolás Nieto** — Arquitecto Backend & Full-Stack Lead (`SUPERADMIN`)
- **🛡️ Alejandro Rodríguez** — Co-Desarrollador • Ingeniería de Datos & API Testing (`SUPERADMIN`)

---

## 🌐 Enlaces en Producción (Cloud)

- **🛡️ Panel SuperAdmin:** `https://ucl-archive-api.onrender.com/admin`
- **🌍 App Cliente Consumidora (Demo API + API Keys + JSON en Vivo):** `https://ucl-archive-api.onrender.com/app`
- **📖 Documentación Interactiva Swagger UI:** `https://ucl-archive-api.onrender.com/api-docs`
- **💓 Health Check / Keep-Alive:** `https://ucl-archive-api.onrender.com/api/v1/health`

---

## 🛠️ Stack Tecnológico Completo (16 Tecnologías Integradas)

1. **🟦 TypeScript (`TS v7 / tsx`):** Tipado estático estricto en todo el backend (`src/`), rutas, middlewares, modelos y validación en compilación (`npx tsc --noEmit`).
2. **🟩 Node.js & Express.js (`v5`):** Servidor HTTP, arquitectura modular REST (`/api/v1`), separación de rutas públicas y administrativas, CORS y archivos estáticos.
3. **🐘 PostgreSQL (`ucl_archive`):** Motor de base de datos relacional SQL con integridad referencial (Foreign Keys), restricciones `UNIQUE` y cascadas para las 7 entidades (`Season`, `Phase`, `Club`, `Player`, `SquadMember`, `Match`, `MatchEvent`).
4. **💎 Prisma ORM (`@prisma/client`):** Modelado declarativo en `prisma/schema.prisma`, Enums oficiales y transacciones atómicas (`prisma.$transaction`) para crear fases automáticas y sumar goles en tiempo real.
5. **⚡ Thunder Client (VS Code):** Pruebas HTTP y auditoría de endpoints (`GET`, `POST`, `PUT`, `DELETE`), cabeceras `Authorization: Bearer <token>` y validación de respuestas JSON.
6. **🔐 JWT (`jsonwebtoken`) & Nodemailer (`SMTP`):** Seguridad de Doble Factor (2FA) con envío de códigos OTP de 6 dígitos al correo y control de roles (`SUPERADMIN` vs `EDITOR`).
7. **🚀 Redis (`ioredis`) & Express Rate Limit:** Caché de alta velocidad con invalidación automática (y respaldo en memoria RAM) y límite de peticiones por IP contra fuerza bruta.
8. **📖 Swagger UI & OpenAPI 3.0:** Portal interactivo de documentación en `/api-docs`.
9. **📸 Multer (`Multipart Upload`):** Subida y validación de escudos de clubes (`/uploads/clubs`) y fotos de jugadores (`/uploads/players`).
10. **🎨 HTML5, CSS3 & JavaScript ES6+ (`Fetch API`):** Interfaz interactiva del SuperAdmin Dashboard (`/admin`) con las 55 federaciones de la UEFA organizadas en 5 regiones geográficas.
11. **🟢 Neon.tech (Serverless PostgreSQL):** Alojamiento cloud de la base de datos PostgreSQL de producción con Connection Pooling y SSL.
12. **☁️ Render.com & GitHub CI/CD:** Despliegue continuo automático conectado a este repositorio de GitHub.
13. **⏱️ Cron-job.org & Auto-Ping (`Keep-Alive`):** Peticiones programadas cada 10–12 minutos a `/api/v1/health` para mantener el servidor activo 24/7 sin suspensión por inactividad.
14. **📨 Google Apps Script (`MailApp` HTTPS Webhook):** Puente Serverless por puerto 443 (`GOOGLE_SCRIPT_URL`) para despacho de correos 2FA en entornos cloud con puertos SMTP restringidos.
15. **🌍 App Cliente Consumidora (`/app`) & Generador de `API Key` (`x-api-key`):** Portal demostrativo con generador de código para **JavaScript (`fetch`)**, **Python (`requests`)** y **cURL**, e inspector de respuestas JSON en tiempo real.
16. **🐙 Git & GitHub (`Nicomszws12/UCL-Archive-API`):** Control de versiones distribuido y trabajo colaborativo seguro.
