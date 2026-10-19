# Poker Calc

Calculadora de ganancias para partidas de póker caseras. Configuras el valor de cada ficha, apuntas lo que ha puesto cada jugador (entrada y recompras) y con cuántas fichas termina, y la app te dice cuánto gana o pierde cada uno y **quién paga a quién**.

Sin registro ni servidor: todo pasa en el navegador.

## Funcionalidades

- **Fichas**: 6 colores clásicos que se pueden activar o desactivar, más fichas personalizadas con selector de color. Cada ficha tiene su valor.
- **Divisas**: EUR, USD y GBP.
- **Jugadores**: entrada inicial, recompras y recuento de fichas finales por color.
- **Resultado**: balance de cada jugador y liquidación con el menor número de pagos posible.
- **Guardado automático** en el navegador (`localStorage`).
- **Compartir por enlace**: la partida va codificada en el `#` de la URL, así que nunca llega a ningún servidor.
- **Responsive**: en móvil va en 3 pasos y en escritorio en 3 columnas.

## Requisitos

- Node.js 22 o superior

## Puesta en marcha

```bash
npm install
```

```bash
npm run dev
```

Abre http://localhost:5173. Para probarla desde el móvil en la misma red wifi:

```bash
npm run dev -- --host
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Comprueba los tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la build de `dist/` en local |
| `npm test` | Ejecuta los tests una vez (`npx vitest` para el modo *watch*) |
| `npm run lint` | Linter (oxlint) |

## Stack

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (los tokens del tema están en `src/index.css`)
- [react-colorful](https://github.com/omgovich/react-colorful) para el selector de color
- [Vitest](https://vitest.dev) para los tests

## Estructura

```
src/
├── App.tsx              Layout, pasos en móvil, compartir y vista de partida compartida
├── index.css            Tema de Tailwind (colores, fuentes) y clases base (.card, .field, .btn-*)
├── hooks/useGame.ts     Estado de la partida + guardado en localStorage
├── lib/
│   ├── types.ts         Tipos: Game, Chip, Player
│   ├── defaults.ts      Fichas por defecto, colores, partida inicial
│   ├── game.ts          Reducer con todas las acciones y validación de datos externos
│   ├── calc.ts          Cálculo de resultados y liquidación
│   ├── money.ts         Formateo y parseo de importes
│   ├── share.ts         Codificar/decodificar la partida en la URL
│   └── storage.ts       localStorage
└── components/          Paneles (Fichas, Jugadores, Resultado) y componentes de UI
design/mockups.html      Paleta, tipografía y mockups (importable en Figma con html.to.design)
docs/                    Guías
```

## Diseño

La paleta, la tipografía y los mockups de móvil y escritorio están en [`design/mockups.html`](design/mockups.html). Ábrelo en el navegador o impórtalo en Figma con el plugin **html.to.design**.

## Despliegue

La web está en [Vercel](https://vercel.com), conectada a este repositorio:

- Cada push a `main` publica en producción.
- Cada push a otra rama genera una URL de vista previa.

Vercel detecta Vite solo (build `npm run build`, salida `dist/`), así que no hace falta configuración extra. La versión de Node sale del campo `engines` de `package.json`.

### SEO y vista previa al compartir

- `index.html` lleva el título, la descripción, las etiquetas Open Graph (la tarjeta que sale en WhatsApp o Instagram), los datos estructurados JSON-LD y una sección de texto estático ("Cómo funciona" y preguntas frecuentes) que Google puede leer sin ejecutar JavaScript.
- La URL pública no está escrita a mano. El plugin `seo` de `vite.config.ts` sustituye `%SITE_URL%` en el build y genera `robots.txt` y `sitemap.xml`. En Vercel la toma de `VERCEL_PROJECT_PRODUCTION_URL`, así que si cambias de dominio se actualiza sola. Para forzarla, define `SITE_URL`.
- Las imágenes están en `public/`: `og-image.png` (1200×630) y los iconos para instalarla en el móvil (`manifest.webmanifest`).

## Por hacer

- [x] Comprobar que la partida cuadra (guía en [`docs/guia-comprobar-cuadre.md`](docs/guia-comprobar-cuadre.md))
- [x] Elegir la fuente definitiva de los títulos (Outfit)
- [x] Despliegue
- [ ] Animación de ficha girando
- [ ] Retos extra de la guía
