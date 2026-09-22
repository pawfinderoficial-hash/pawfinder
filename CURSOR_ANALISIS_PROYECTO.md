# Consigna para analizar PawFinder en Cursor

Quiero que actues como arquitecto de software y product engineer senior. Analiza este repositorio completo antes de sugerir cambios. No modifiques archivos ni implementes soluciones durante este analisis.

## Contexto del producto

PawFinder busca reunir mascotas perdidas con las personas que creen haberlas encontrado. La experiencia propuesta combina publicaciones, exploracion mediante tarjetas o lista, mapa, posibles coincidencias, confirmacion del encuentro y notificaciones.

El repositorio actual es un prototipo visual de Fase 1. Esta hecho con Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Leaflet y Framer Motion. La aplicacion corre localmente en `http://localhost:43123`.

Actualmente no hay backend, API, base de datos ni autenticacion real. Los datos principales viven en memoria dentro de un contexto React y solo el nombre de usuario se conserva temporalmente en `sessionStorage`.

## Funcionalidad existente

- Login y registro visual, incluido acceso de demostracion.
- Feed de mascotas perdidas y encontradas.
- Vista de tarjetas deslizables y vista de lista.
- Busqueda por nombre, raza, especie, descripcion y ubicacion.
- Mapa con marcadores simulados en CABA.
- Formularios para publicar mascotas perdidas o encontradas.
- Carga local temporal de una fotografia.
- Flujo de posible match, confirmacion y seleccion de punto de encuentro.
- Notificaciones de matches, actividad y promociones de auspiciantes.
- Gestion de avisos propios: editar, pausar, reactivar y resolver.
- Indicaciones de ubicacion aproximada y contacto protegido.
- Reporte de publicaciones.
- Panel administrativo independiente en `/admin`.
- Moderacion, seguimiento de casos, usuarios y auspiciantes con datos demo.
- Interfaz mobile-first.

## Observaciones iniciales a validar

Estas son hipotesis, no conclusiones obligatorias. Confirmalas o refutalas usando evidencia concreta del codigo:

1. La entidad principal de negocio deberia ser un aviso o reporte, no solamente una mascota. Un mismo animal puede tener un reporte de perdida, varios reportes de hallazgo y una resolucion.
2. Los avisos necesitan estados explicitos, por ejemplo `activo`, `en_revision`, `resuelto`, `cerrado` y `descartado`.
3. La accion "Puede ser" deberia generar una coincidencia candidata entre dos avisos. No deberia confirmar automaticamente que se encontro la mascota.
4. La confirmacion de un match posiblemente deba involucrar a ambas partes y mantener un historial auditable.
5. Mostrar coordenadas exactas o domicilios publicamente implica riesgos de privacidad. El mapa publico deberia considerar ubicaciones aproximadas.
6. Exponer telefonos directamente puede facilitar spam o abuso. Evaluar mensajeria interna o revelado progresivo del contacto.
7. El MVP necesita editar, pausar, cerrar, eliminar y marcar como resuelto un aviso.
8. Debe contemplarse moderacion: reportar publicaciones, bloquear usuarios, revisar contenido y controlar duplicados.
9. Las promociones de auspiciantes no deberian competir visualmente con alertas urgentes o matches.
10. El contexto global actual mezcla datos, estado de interfaz y reglas de negocio, y no deberia convertirse directamente en la arquitectura del backend.

## Alcance de tu analisis

Primero inspecciona, como minimo:

- `README.md`
- `package.json`
- `src/app/`
- `src/components/`
- `src/context/pawfinder-context.tsx`
- `src/lib/`
- `src/types/pet.ts`
- `src/app/admin/`
- `src/components/admin/`
- `src/lib/mock-admin.ts`
- La configuracion de Next.js, TypeScript y ESLint

Despues analiza:

### 1. Estado actual

- Que funcionalidades estan realmente implementadas.
- Cuales son solo simulaciones visuales.
- Como circulan actualmente los datos y el estado.
- Que partes se perderian al recargar o abrir otra sesion.
- Que acciones del panel administrativo son demostraciones locales.
- Errores, inconsistencias o deuda tecnica visible.

### 2. Producto y experiencia

- Si el recorrido actual resuelve adecuadamente el problema de mascotas perdidas y encontradas.
- Que pasos faltan en los flujos de publicacion, coincidencia, contacto y resolucion.
- Riesgos de privacidad, seguridad, fraude, abuso y moderacion.
- Que funcionalidad debe entrar al MVP y que conviene postergar.
- Si el modelo tipo swipe aporta valor o introduce friccion en una situacion urgente.

### 3. Modelo de dominio

Propone las entidades y relaciones necesarias. Considera al menos:

- usuarios;
- avisos o reportes;
- mascotas y caracteristicas observables;
- fotografias;
- ubicaciones publicas aproximadas y ubicaciones privadas;
- candidatos de coincidencia;
- decisiones de cada participante;
- conversaciones o formas de contacto;
- notificaciones;
- reportes de abuso y moderacion;
- puntos de encuentro;
- auspiciantes y promociones;
- historial de estados y auditoria.

Indica que estados y transiciones deberia tener cada flujo importante.

### 4. Arquitectura tecnica

Compara con argumentos estas alternativas:

- Next.js como monolito full-stack;
- Next.js con un backend Express separado;
- servicios administrados como Supabase u opciones equivalentes.

Recomienda una arquitectura concreta para el MVP considerando velocidad de desarrollo, costos iniciales, seguridad, mantenimiento y una futura aplicacion movil. Incluye recomendaciones para:

- PostgreSQL y busquedas por distancia;
- ORM y migraciones;
- autenticacion;
- almacenamiento y procesamiento de imagenes;
- API y validacion;
- notificaciones;
- observabilidad;
- despliegue;
- backups;
- pruebas automatizadas.

No agregues microservicios salvo que exista una necesidad concreta y demostrable.

### 5. Plan de implementacion

Propone fases pequenas y verificables. Para cada fase indica:

- objetivo;
- funcionalidad incluida;
- dependencias;
- criterios de aceptacion;
- pruebas necesarias;
- riesgos principales.

Prioriza primero un recorrido completo que permita publicar un caso real, encontrarlo, contactar de forma segura y cerrarlo como resuelto.

## Formato de respuesta esperado

Entrega el resultado en este orden:

1. Resumen ejecutivo de no mas de 10 puntos.
2. Mapa de la arquitectura y flujo actuales, citando archivos concretos.
3. Hallazgos ordenados por severidad: criticos, importantes y mejoras.
4. Funcionalidades que faltan para un MVP utilizable.
5. Modelo de dominio propuesto.
6. Arquitectura recomendada y alternativas descartadas, con motivos.
7. Roadmap por fases.
8. Preguntas de producto que deben decidirse antes de implementar.
9. Riesgos y medidas de mitigacion.

Para cada hallazgo tecnico, cita el archivo y las lineas relevantes. Distingue claramente hechos observados, inferencias y recomendaciones. No asumas que las observaciones iniciales son correctas: cuestionarlas tambien forma parte del trabajo.

Antes de terminar, ejecuta `npm run lint` y `npx tsc --noEmit`. Informa los resultados, pero no corrijas nada sin autorizacion.
