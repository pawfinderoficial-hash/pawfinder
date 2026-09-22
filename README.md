# PawFinder

Prototipo estático **Fase 1** de PawFinder: una app estilo Tinder para reunir mascotas perdidas con quienes las encontraron. UI en español (Argentina), mobile-first, sin backend ni autenticación real.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- Leaflet / react-leaflet (mapa con datos mock)
- Framer Motion (gestos en el feed)

## Requisitos

- Node.js 20+
- npm

## Desarrollo local

```bash
npm install
npm run dev -- -p 43123
```

Abrí [http://localhost:43123](http://localhost:43123).

## Pantallas incluidas

1. **Login / registro** — visual; “Continuar” o “Probar demo” entran al app.
2. **Feed** — tarjetas deslizables (perdidas y encontradas).
3. **Mapa** — pines mock en CABA.
4. **Publicar perdida / encontrada** — formulario + mapa (estado en memoria de la sesión).
5. **Match** — confirmar o rechazar un posible hallazgo y elegir un punto de encuentro (demo).
6. **Mis publicaciones** — crear, editar, pausar, reactivar y marcar casos como resueltos.
7. **Notificaciones** — actividad importante separada de promociones.
8. **Administración** — panel independiente con resumen, moderación, casos, usuarios y auspiciantes en `/admin`.

## Flujos de producto representados

- Ubicación pública aproximada y aviso de privacidad.
- Contacto protegido hasta confirmar una coincidencia.
- Reporte de publicaciones para revisión.
- Ciclo de vida de avisos propios.
- Cola de moderación con decisiones de demostración.
- Búsqueda administrativa de casos y usuarios.
- Alta de auspiciantes como borrador.

Todas estas acciones siguen usando datos mock y estado en memoria. Sirven para validar el producto antes de conectar persistencia y permisos reales.

## Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `npm run dev`  | Servidor de desarrollo   |
| `npm run build`| Build de producción      |
| `npm run start`| Servir build             |
| `npm run lint` | ESLint                   |

## Fuera de alcance (Fase 2+)

Express, Prisma, PostgreSQL, auth real, almacenamiento de imágenes en la nube, email.
