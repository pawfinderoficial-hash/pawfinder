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

El panel `/admin` sigue siendo **demo visual** sin backend.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev en puerto **43123** |
| `npm run build` | `prisma generate` + build |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run lint` | ESLint |

## Repo

https://github.com/pawfinderoficial-hash/pawfinder
