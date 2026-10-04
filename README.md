# PawFinder

App para reunir mascotas perdidas con quienes las encontraron. UI en español (Argentina), mobile-first, **v1 funcional** con Google OAuth, Postgres (Neon), Cloudinary y flujo match → encuentro.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Auth.js (NextAuth v5) + Google OAuth
- Prisma 6 + PostgreSQL (Neon)
- Cloudinary (fotos de avisos)
- Leaflet / react-leaflet

## Requisitos

- Node.js 20+
- npm
- Cuentas: Google Cloud OAuth, Neon, Cloudinary

## Configuración

1. Cloná el repo y instalá dependencias:

```bash
npm install
```

2. Copiá `.env.example` a `.env.local` y completá:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Connection string Neon |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:43123` en local |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth — redirect `http://localhost:43123/api/auth/callback/google` |
| `CLOUDINARY_*` | Upload de fotos |

3. Migraciones (primera vez o CI):

```bash
set -a && source .env.local && set +a
npx prisma migrate deploy
```

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:43123](http://localhost:43123) e iniciá sesión con Google.

## Flujos v1

- Publicar perdida / encontrada (foto + mapa + DB)
- Explorar: swipe, lista, búsqueda y mapa desde Postgres
- «Puede ser» crea match pendiente + notificación
- Dueño de aviso perdido confirma o rechaza
- Punto de encuentro (domicilio o puntos demo) y cierre (borra foto en Cloudinary)
- Mis avisos y notificaciones in-app (+ auspiciante mock)

El panel `/admin` sigue siendo **demo visual** sin backend ni roles. Requiere sesión,
pero no debe considerarse un panel administrativo seguro hasta implementar permisos.

## Migración a otra computadora

1. Verificá que los cambios estén publicados en el remoto con `git status` y
   `git push origin main`.
2. Cloná el repositorio y ejecutá `npm ci`.
3. Recreá `.env.local` desde `.env.example`. Este archivo contiene secretos y no
   se versiona; transferilo por un canal seguro o generá credenciales nuevas.
4. En Google Cloud agregá el callback local
   `http://localhost:43123/api/auth/callback/google` y el callback de producción.
5. Ejecutá `npm run db:migrate`, `npm run lint` y `npm run build`.
6. Levantá la app con `npm run dev` y abrí
   [http://localhost:43123](http://localhost:43123).

La base Neon y las imágenes Cloudinary son servicios remotos: no hace falta copiar
archivos de datos locales si se conservan sus credenciales.

## Pendientes antes de producción

- Implementar roles y backend real para administración/moderación.
- Validar todos los cuerpos JSON de las APIs y agregar límites de frecuencia.
- Persistir puntos de encuentro; actualmente se muestran datos demo.
- Definir mensajería interna, selección de aviso al crear un match e IA de sugerencias.
- Resolver el historial de imágenes cerradas: hoy Cloudinary borra la foto al cerrar
  un encuentro, pero el aviso conserva su URL.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev en puerto **43123** |
| `npm run build` | `prisma generate` + build |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run lint` | ESLint |

## Repo

https://github.com/pawfinderoficial-hash/pawfinder
