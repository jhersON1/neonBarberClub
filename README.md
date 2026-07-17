# Neon Barber Club

Sitio público y sistema de pre-reservas de Neon Barber Club, barbería ubicada en Plan 3 Mil, Santa Cruz de la Sierra.

## Stack

- Angular 20 con componentes standalone, señales, `OnPush` y detección de cambios sin Zone.js.
- Tailwind CSS 4.
- Renderizado estático (SSG) con Angular SSR para entregar HTML indexable.
- API externa para servicios, barberos, disponibilidad y reservas.

## Desarrollo

Requiere Node.js 20 y pnpm 11.

```bash
pnpm install
pnpm start
```

La aplicación queda disponible en `http://localhost:4200/`.

## Verificación

```bash
pnpm test:ci
pnpm build
```

La compilación de producción se genera en `dist/neon-barber-club/` e incluye el HTML prerenderizado.

## Datos públicos y SEO

La información pública del negocio tiene una fuente única en `src/app/core/config/business.config.ts`. Si cambian teléfono, dirección, horarios, adelanto o coordenadas, actualiza primero ese archivo y alinea también los datos estructurados de `src/index.html`.

El proyecto incluye metadatos Open Graph, JSON-LD de negocio local y preguntas frecuentes, `robots.txt`, sitemap y permisos para rastreadores de búsqueda asistida por IA. No se mantiene un `llms.txt`: el contenido canónico debe seguir siendo el HTML visible e indexable.

## Despliegue

Los cambios enviados a `develop` ejecutan pruebas, compilación estática y despliegue a GitHub Pages mediante `.github/workflows/deploy.yaml`.
