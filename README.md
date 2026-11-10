# 🏆 UEFA Champions League Archive API v2.0

API REST Histórica y Oficial de la UEFA Champions League (1992 – Presente) construida con **Node.js, Express, TypeScript, Prisma ORM y PostgreSQL**, acompañada de un **Panel Web Interactivo de SuperAdmin (`/admin`)** y documentación interactiva con **Swagger UI (`/api-docs`)**.

---

## ✨ Características Principales (v2.0)

- **Seguridad SuperAdmin con Doble Factor (2FA por Correo):**
  - Soporta múltiples cuentas de **SuperAdmin** (Propietario + Co-Desarrollador) con envío de código OTP de 6 dígitos al correo electrónico.
  - Rol secundario **Colaborador / Editor (`EDITOR`)** mediante Token JWT (permite registrar y editar datos, pero bloquea el vaciado de la base de datos).
- **Panel Web Interactivo (`/admin`):**
  - **1. Temporadas:** Creación automática de fases según el formato (`CLASSIC_GROUPS` de 32 equipos o `SWISS_LEAGUE` de 36 equipos).
  - **2. Clubes UEFA:** Validación estricta de las 55 federaciones miembro de la UEFA organizadas en 5 regiones geográficas, con subida de escudos (`crest_url`).
  - **3. Jugadores y Ranking de Goleadores:** Registro biográfico, fotos (`photo_url`) y tabla en vivo conectada a `/api/v1/players/top-scorers`.
  - **4. Plantillas (`Squads`):** Asignador rápido y explorador dinámico por temporada y club (`STARTER`, `SUBSTITUTE`, `RESERVE`).
  - **5. Partidos, Suspensiones e Incidencias Unificadas:** Registro atómico en transacción (`prisma.$transaction`) de partidos, estados (`FINISHED`, `SUSPENDED`, `POSTPONED`, `RESUMED_AND_FINISHED`, `CANCELLED`) y los 12 tipos de eventos oficiales de un partido.
- **Caché con Redis (`ioredis`) + Fallback en Memoria** y **Rate Limiting (`express-rate-limit`)**.

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Nicomszws12/UCL-Archive-API.git
   cd UCL-Archive-API
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y completa tus credenciales:
   ```bash
   cp .env.example .env
   ```

4. **Sincronizar el esquema con PostgreSQL:**
   ```bash
   npm run build
   ```

5. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
   - **Panel SuperAdmin:** `http://localhost:3000/admin`
   - **Swagger UI:** `http://localhost:3000/api-docs`

---

## 🌐 Despliegue Gratuito en la Nube (Conectado a GitHub)

Dado que este proyecto incluye un servidor **Node.js + Express** y una base de datos **PostgreSQL**, GitHub Pages no puede ejecutarlo (ya que GitHub Pages solo aloja HTML estático). Sin embargo, puedes desplegarlo **100% gratis** conectando directamente este repositorio de GitHub a **Render.com** + **Neon.tech**:

1. **Base de Datos PostgreSQL Gratis (Neon.tech o Render Postgres):**
   - Crea una cuenta gratuita en [Neon.tech](https://neon.tech) o en [Render](https://render.com) y copia tu cadena de conexión `DATABASE_URL`.
2. **Servidor Node.js Gratis en Render.com:**
   - Entra a [Render.com](https://render.com) -> **New +** -> **Web Service**.
   - Conecta tu repositorio `Nicomszws12/UCL-Archive-API` de GitHub.
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - En **Environment Variables**, pega las variables de tu `.env` (`DATABASE_URL`, `JWT_SECRET`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_2_EMAIL`, `SUPERADMIN_2_PASSWORD`, `SMTP_USER`, `SMTP_PASS`).
   - ¡Listo! Render te dará una URL pública (`https://ucl-archive-api.onrender.com/admin`) para que tú y tu amigo entren desde cualquier lugar.
