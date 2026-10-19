# AGENTS.md

Instrucciones para agentes de IA (Claude Code, Codex, Copilot…) que trabajen en este repositorio. Para la descripción general del proyecto, ver [README.md](README.md).

## Contexto

Web de una sola página (React 19 + TypeScript + Vite + Tailwind v4) para calcular las ganancias de una partida de póker casera. No hay backend ni login: el estado vive en `localStorage` y se comparte codificado en el hash de la URL.

**La interfaz, los textos y los comentarios del código están en español.** Mantenlo así.

## Comandos

```bash
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm test         # vitest run
npm run build    # tsc -b && vite build (también comprueba los tipos)
npm run lint     # oxlint
```

Antes de dar una tarea por terminada, `npm test`, `npm run build` y `npm run lint` tienen que pasar.

## Arquitectura

- `src/lib/` contiene **lógica pura, sin React**. Todo lo que se pueda testear va aquí y lleva tests en `src/lib/*.test.ts`.
- El estado de la partida es un único objeto `Game` (`src/lib/types.ts`) que se modifica **solo** a través de `gameReducer` (`src/lib/game.ts`). Para un cambio nuevo, añade una acción a `GameAction`; no mutes el estado desde los componentes.
- `computeResults(game)` (`src/lib/calc.ts`) deriva todo lo que muestra la UI. Los componentes no recalculan importes por su cuenta.
- Los datos que vienen de fuera (localStorage, enlace compartido) pasan siempre por `sanitizeGame` antes de usarse. Si añades un campo a `Game`, actualiza también `sanitizeGame`.
- Layout responsive: en móvil hay 3 pasos con `Stepper` y botón fijo abajo; desde `lg:` se ven las 3 columnas a la vez. Cualquier pantalla nueva tiene que funcionar a 375 px de ancho.

## Convenciones

- **Dinero siempre en céntimos enteros** (`number`). Solo se convierte a texto al mostrarlo, con `formatMoney` / `formatPlain`. Nunca uses euros con decimales en los cálculos.
- Los colores, las fuentes y las sombras salen de los tokens de `@theme` en `src/index.css` (`bg-surface`, `text-gold`, `border-line`, `text-win`, `text-loss`, `text-warn`…). No metas hex sueltos en los componentes salvo los colores de las fichas o de los jugadores, que son datos.
- Reutiliza las clases base `.card`, `.field`, `.btn-primary`, `.btn-outline`, `.btn-ghost` y `.label`.
- Usa `cn()` (`src/lib/cn.ts`) para las clases condicionales.
- Inputs de importe: `MoneyInput`. Inputs de cantidad: `CountInput` (los dos en `src/components/inputs.tsx`).
- Accesibilidad: `aria-label` en los botones que solo tienen un icono, `role="switch"` / `role="radiogroup"` donde toca y `aria-hidden` en lo decorativo.
- Estilo de código: sin punto y coma, comillas simples y 2 espacios. Imita el archivo que estés tocando.
- No añadas dependencias sin un motivo claro. Si añades una, que encaje visualmente con el tema.
