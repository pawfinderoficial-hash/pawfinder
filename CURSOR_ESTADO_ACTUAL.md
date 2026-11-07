# PawFinder - Estado actual para Cursor

Actualizado: 13 de octubre de 2026.

Este documento describe el estado real del proyecto después de las últimas iteraciones de producto y desarrollo. Debe leerse antes de proponer o implementar cambios.

> `CURSOR_ANALISIS_PROYECTO.md` es una consigna histórica de análisis. Varias de sus afirmaciones quedaron desactualizadas: ya existen ubicación persistente, filtros por radio, múltiples fotos, avistamientos, WhatsApp directo y notificaciones push.

## 1. Estado del repositorio

- Rama actual: `main`.
- HEAD al redactar este informe: `fc41cd4 stilos`.
- El árbol Git estaba limpio antes de crear este documento.
- Commits recientes relevantes:
  - `55ca7fb bug generales`: ubicación persistente, radio, push, PWA y detalles opcionales.
  - `e58e885 botones`: WhatsApp directo, descarte móvil y horario de 24 horas.
  - `fc41cd4 stilos`: selector móvil de ciudad y métricas compactas.
- La migración `20261012120000_location_push_pet_details` fue aplicada a Neon.

## 2. Decisiones de producto vigentes

1. PawFinder debe seguir siendo minimalista y mobile-first.
2. No se quiere un chat interno en esta etapa. La comunicación se resuelve con WhatsApp después de una acción explícita.
3. El panel administrativo debe evolucionar como plataforma web separada de la experiencia pública. El `/admin` actual continúa como demo.
4. Los formularios deben conservar el flujo por pasos y mostrar sólo la operación actual, especialmente cuando aparece el teclado móvil.
5. Los campos adicionales de mascota son opcionales y se muestran a demanda.
6. GPS no debe ser la única salida: el usuario puede elegir ciudad manualmente.
7. La ciudad y el radio deben recordarse entre sesiones.
8. Las notificaciones urgentes deben estar separadas de promociones de auspiciantes.
9. Todos los horarios visibles deben usar formato de 24 horas.
10. Evitar agregar funciones que aumenten la carga visual sin resolver una necesidad concreta.

## 3. Arquitectura actual

- Next.js `16.3.8`, React `19.2.8`, TypeScript y App Router.
- Backend monolítico mediante Route Handlers en `src/app/api`.
- Auth.js/NextAuth v5 con Google OAuth.
- Prisma 6 y PostgreSQL/Neon.
- Cloudinary para fotografías.
- Leaflet/react-leaflet para mapas.
- Web Push con `web-push`, service worker y VAPID.
- Estado y orquestación del cliente en `src/context/pawfinder-context.tsx`.
- Desarrollo local en `http://localhost:43123`.

## 4. Funcionalidad implementada

### Autenticación

- Inicio de sesión real con Google.
- Callback local esperado: `http://localhost:43123/api/auth/callback/google`.
- El callback de producción debe coexistir con el local en Google Cloud.

### Publicaciones

- Publicación de mascota perdida o encontrada mediante formulario por pasos.
- Hasta cinco fotos por publicación.
- Galería ampliable en publicaciones, avistamientos y detalles.
- Datos obligatorios mínimos y detalles opcionales:
  - color;
  - tamaño;
  - sexo;
  - edad aproximada;
  - collar o identificación.
- Datos persistidos en `PetPost` y expuestos mediante `src/lib/db-mappers.ts`.
- Edición, pausa, reactivación y resolución de avisos propios.

### Explorar y mapa

- Feed tipo swipe y vista de lista.
- Búsqueda por nombre, raza, especie, descripción y zona.
- Ubicación persistida en `localStorage` mediante `src/lib/browser-location.ts`.
- Selección por GPS o ciudad manual.
- Selector móvil propio; no usar un `<select>` nativo de escritorio para ciudades.
- Radios disponibles: 5, 10, 20 y 50 km.
- Filtrado con distancia Haversine en `src/lib/location-distance.ts`.
- Explorar y Mapa consumen la misma preferencia de ubicación.
- El mapa se recentra cuando cambia ciudad o radio.
- La lista de ciudades de `src/lib/argentina-cities.ts` es curada y limitada; no es todavía un catálogo completo.

### Avistamientos y comunicación

- Un usuario puede reportar un avistamiento sobre un aviso de mascota perdida.
- El dueño recibe el avistamiento en Match y puede actuar sobre él.
- La tarjeta tiene sólo dos acciones móviles:
  - `Abrir WhatsApp`: habilita el contacto y abre la conversación directamente.
  - botón `X`: descarta el avistamiento.
- No volver a introducir un paso intermedio de “Ver contacto” salvo nueva decisión de producto.
- `src/lib/whatsapp.ts` normaliza números argentinos y prepara el mensaje.
- Horarios de avistamientos se muestran con `hour12: false`.

### Matches y encuentros

- “Puede ser” crea un `Match` pendiente entre un aviso perdido y uno encontrado.
- El dueño del aviso perdido confirma o rechaza.
- Una confirmación habilita el flujo de encuentro.
- Encuentro en domicilio o punto seguro de demo.
- Al cerrar el encuentro, los avisos se marcan resueltos.
- Los puntos de encuentro todavía provienen de mocks; no están administrados desde base de datos.

### Mis publicaciones

- Dos vistas: `Avisos` y `Avistamientos`.
- Estados de avistamiento explican el siguiente paso:
  - esperando respuesta;
  - te van a contactar;
  - no coincide.
- Métricas compactas en una única franja:
  - `En búsqueda`: avisos activos o en revisión.
  - `Posibles`: matches con estado `PENDING`; no incluye avistamientos.
  - `Resueltos`: avisos con estado `RESOLVED`.
- No volver a usar tres tarjetas altas para estas métricas en móvil.

### Notificaciones push y PWA

- Suscripciones persistidas en `PushSubscription`.
- API: `src/app/api/push/subscriptions/route.ts`.
- Cliente: `src/components/notifications/push-notification-control.tsx`.
- Envío: `src/lib/push-server.ts`.
- Service worker: `public/sw.js`.
- Manifest e íconos instalables para iPhone y Android.
- Push conectado a:
  - nuevo avistamiento;
  - solicitud de contacto;
  - nuevo match;
  - match confirmado o rechazado;
  - encuentro acordado.
- En iPhone, Web Push requiere abrir PawFinder como aplicación agregada a la pantalla de inicio.
- Variables necesarias en local y Vercel:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` como configuración pública;
  - `VAPID_PRIVATE_KEY` como secreto;
  - `VAPID_SUBJECT`.
- Después de cambiar variables en Vercel se necesita un redeploy.

## 5. Modelo de datos relevante

- `User`: usuario autenticado, avisos, avistamientos, notificaciones y suscripciones push.
- `PetPost`: aviso perdido/encontrado, ubicación, contacto, fotos, características y estado.
- `Sighting`: avistamiento vinculado a un aviso perdido.
- `Match`: posible coincidencia entre aviso perdido y encontrado.
- `Notification`: notificación persistida dentro de la aplicación.
- `PushSubscription`: endpoint y claves Web Push por usuario/dispositivo.
- `MeetingPoint`: existe en Prisma, pero la interfaz todavía usa datos demo.

Revisar `prisma/schema.prisma` y las migraciones antes de cambiar contratos. No editar una migración ya aplicada; crear una nueva.

## 6. Archivos principales

- `src/context/pawfinder-context.tsx`: carga APIs, feed, publicaciones propias, matches, avistamientos y notificaciones.
- `src/components/location/location-gate.tsx`: acceso inicial por GPS o ciudad manual.
- `src/components/location/location-settings.tsx`: cambio de ciudad/radio desde Explorar y Mapa.
- `src/lib/browser-location.ts`: persistencia local de ubicación.
- `src/lib/location-distance.ts`: cálculo y filtro por radio.
- `src/components/publish/publish-form.tsx`: publicación perdida/encontrada.
- `src/components/publish/sighting-form.tsx`: formulario de avistamiento.
- `src/app/(app)/match/page.tsx`: matches y avistamientos pendientes.
- `src/app/(app)/mis-avisos/page.tsx`: avisos y avistamientos propios.
- `src/app/(app)/notificaciones/page.tsx`: actividad y activación push.
- `src/app/api/*`: backend de la v1.
- `src/app/admin/*`: panel de demostración, no administración segura.

## 7. Configuración y despliegue

- `.env.local` contiene secretos y no se versiona.
- `.env.example` documenta las variables requeridas.
- Google Cloud debe autorizar callbacks local y de Vercel.
- Neon y Cloudinary son servicios remotos compartidos entre computadoras.
- Ejecutar migraciones con:

```bash
set -a && source .env.local && set +a
npx prisma migrate deploy
```

- Verificación habitual:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 8. Limitaciones y próximos trabajos

### Prioridad alta

1. Confirmar push extremo a extremo en la PWA instalada de iPhone después del redeploy con variables VAPID.
2. Agregar validación estructurada de cuerpos API y límites de frecuencia.
3. Implementar autorización por roles antes de convertir `/admin` en panel real.
4. Incorporar moderación persistida, bloqueo y auditoría.
5. Agregar pruebas automatizadas para publicación, avistamiento, contacto, match y resolución.

### Prioridad media

1. Reemplazar la lista curada de ciudades por búsqueda geográfica completa y confiable.
2. Persistir y administrar puntos de encuentro asociados.
3. Revisar la política de cierre y eliminación de fotos: actualmente Cloudinary puede borrar imágenes mientras el aviso conserva la URL.
4. Desacoplar gradualmente reglas de negocio y estado de interfaz del contexto global.
5. Mejorar observabilidad y registro de errores del backend.

### Evolución futura

- Sugerencias inteligentes de match por fotografía, descripción, ubicación y fecha.
- La IA debe sugerir candidatos, nunca confirmar automáticamente una identidad.
- No implementar chat interno ni microservicios sin una decisión explícita de producto.

## 9. Reglas para continuar trabajando

1. Leer `AGENTS.md` y la documentación local de Next.js 16 antes de cambiar APIs o convenciones.
2. Respetar el diseño mobile-first y comprobar pantallas con teclado abierto.
3. Mantener cabecera y navegación inferior compactas y consistentes.
4. Evitar repetir solicitudes de permisos al navegar.
5. No exponer teléfonos en publicaciones públicas.
6. No mezclar el panel administrativo con la navegación de usuarios.
7. No revertir decisiones UX descritas aquí sin consultar.
8. Antes de terminar, ejecutar lint, TypeScript y build, e informar cualquier limitación de prueba manual.
