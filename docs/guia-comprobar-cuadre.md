# Guía: comprobar que la partida cuadra

Esta funcionalidad se ha quitado a propósito para que la implementes tú. **Los tests siguen en el repo** y ahora mismo fallan: tu trabajo es ponerlos en verde y después construir la parte visual.

Es pequeña, pero toca las tres capas de la app: **lógica pura**, **un componente de React** y **su integración en los paneles**.

Tiempo estimado: 1–2 horas.

---

## Qué vas a construir

Al final de una partida, el dinero que hay en la mesa (las fichas finales de todos, convertidas a dinero) tiene que ser igual al dinero que se ha puesto (entradas + recompras). Si no coincide, alguien ha contado mal sus fichas o falta apuntar una recompra.

Tienes que mostrar un aviso con tres estados posibles:

| Estado | Condición | Color | Texto de ejemplo |
|---|---|---|---|
| Cuadra | mesa = aportado | verde (`win`) | ✓ Cuadra: 80,00 € aportados = 80,00 € en la mesa |
| Faltan | mesa < aportado | amarillo (`warn`) | ! Faltan 0,25 € en la mesa (79,75 € frente a 80,00 € aportados). Revisa las fichas finales o las recompras. |
| Sobran | mesa > aportado | amarillo (`warn`) | ! Sobran 1,00 € en la mesa (81,00 € frente a 80,00 € aportados). Revisa las fichas finales. |

**Dónde aparece:**

- **Panel de jugadores**: debajo del botón "+ Añadir jugador", siempre que haya al menos un jugador.
- **Panel de resultado**: entre la lista de jugadores y "Quién paga a quién", **solo si no cuadra** (si cuadra, no hace falta decir nada).

Tienes el diseño de referencia en [`design/mockups.html`](../design/mockups.html): busca "Cuadra" y "Ejemplo de aviso".

---

## Lo que vas a practicar

- Leer un test que falla y entender qué te pide (el ciclo rojo → verde de TDD).
- Funciones puras en TypeScript y por qué todo el dinero va en **céntimos enteros**.
- Crear un componente de React tipado con props.
- Clases condicionales de Tailwind usando los tokens del tema (`text-win`, `bg-warn/10`…).
- Renderizado condicional en JSX (`cond && <Componente />`).

---

## Paso 0 · Punto de partida

```bash
git checkout -b feat/comprobar-cuadre
npm run dev
```

En otra terminal, los tests en modo *watch* (se vuelven a ejecutar cada vez que guardas):

```bash
npx vitest
```

Verás esto:

```
 × calcula el neto de cada jugador y comprueba que cuadra
 × detecta cuando las fichas no cuadran

 FAIL  … > calcula el neto de cada jugador y comprueba que cuadra
AssertionError: expected undefined to be 8000
 FAIL  … > detecta cuando las fichas no cuadran
AssertionError: expected undefined to be -25

      Tests  2 failed | 11 passed (13)
```

Y si ejecutas `npm run build`, TypeScript también protesta:

```
src/lib/calc.test.ts(35,14): error TS2339: Property 'totalInvested' does not exist on type 'GameResults'.
src/lib/calc.test.ts(36,14): error TS2339: Property 'difference' does not exist on type 'GameResults'.
```

**Es lo esperado.** Los tests describen lo que todavía no existe. `npm run dev` sigue funcionando, porque Vite no comprueba los tipos.

Archivos que vas a tocar:

| Archivo | Qué haces |
|---|---|
| `src/lib/calc.ts` | Añadir los totales a `GameResults` y calcularlos en `computeResults` |
| `src/lib/calc.test.ts` | Solo leerlo (y, si quieres, añadir tests propios) |
| `src/components/BalanceBanner.tsx` | **Nuevo**: el aviso |
| `src/components/PlayersPanel.tsx` | Mostrar el aviso |
| `src/components/ResultsPanel.tsx` | Mostrar el aviso si no cuadra |

---

## Antes de empezar · TypeScript en 10 minutos

Si es tu primera vez con TypeScript (TS), lee esto antes. Para esta tarea solo necesitas unas pocas ideas, y todas tienen ejemplos en el repo.

### TS es JavaScript con tipos

Un archivo `.ts` (o `.tsx` si tiene JSX) es JavaScript normal con **anotaciones de tipo**. Esas anotaciones le dicen al editor y al compilador qué forma tienen los datos. **Desaparecen al ejecutar**: el navegador recibe JavaScript puro.

```ts
function totalInvested(player: Player): number {
  //                   ^^^^^^^^^^^^^^  ^^^^^^
  //                   parámetro y tipo   tipo de lo que devuelve
  return player.buyIns.reduce((sum, amount) => sum + amount, 0)
}
```

Los tipos básicos que vas a ver: `number`, `string`, `boolean`, y los arrays con `[]` detrás (`number[]` es un array de números, `PlayerResult[]` un array de `PlayerResult`).

### `interface`: la forma de un objeto

Una `interface` **no es un archivo ni una clase**. Es la descripción de qué campos tiene un objeto y de qué tipo es cada uno. Ejemplo de `src/lib/types.ts` (simplificado):

```ts
export interface Chip {
  id: string
  name: string
  /** Valor de una ficha, en céntimos. */
  value: number
  enabled: boolean
}
```

Esto significa: "un `Chip` es un objeto con un `id` de texto, un `name` de texto, un `value` numérico…". Si creas un `Chip` y te falta un campo o le pones un tipo que no toca, TS te avisa.

- `export` hace que otros archivos puedan importarla.
- Cada campo va en una línea, `nombre: tipo`, sin comas ni punto y coma (es el estilo del repo).
- Para **ampliar** una interfaz basta con añadir más líneas dentro de las llaves.

### Comentarios JSDoc (`/** … */`)

Un comentario que empieza por `/**` justo encima de un campo o una función es **JSDoc**. TS no lo usa para comprobar nada, pero el editor lo enseña al pasar el ratón por encima del campo, en cualquier archivo donde lo uses. Pruébalo: abre `src/lib/calc.test.ts`, pasa el ratón por encima de `final` en la línea 46 y verás "Valor de las fichas con las que ha terminado". Ese texto sale del comentario que hay en la interfaz `PlayerResult` de `calc.ts`.

Por eso la guía te pide documentar `difference`: dentro de un mes nadie recordará si "−25" significa que faltan o que sobran 25 céntimos.

### Cómo leer un error de TS

```
src/lib/calc.test.ts(35,14): error TS2339: Property 'totalInvested' does not exist on type 'GameResults'.
                     ^^^^^        ^^^^^^             ^^^^^^^^^^^^^                        ^^^^^^^^^^^
                     línea,col    código             qué has usado                        dónde lo ha buscado
```

Traducido: "en la línea 35 del test se lee `r.totalInvested`, pero según la interfaz `GameResults` ese campo no existe". El arreglo **no está en el test**, sino en la interfaz.

En VS Code no hace falta ejecutar nada para ver estos errores: salen subrayados en rojo, y en la pestaña **Problemas** (`Ctrl+Shift+M`).

### Trucos de VS Code que te van a ahorrar tiempo

- **Pasar el ratón** por encima de cualquier variable: te dice su tipo. Es la forma más rápida de saber qué tienes entre manos.
- **`F12`** (o `Ctrl+clic`) sobre un nombre: salta a donde está definido. Pruébalo con `GameResults` en `PlayersPanel.tsx`.
- **`Ctrl+Espacio`** después de un punto (`results.`): lista los campos disponibles.

### Otras cosas que verás en los componentes

| Sintaxis | Qué es | Dónde verlo |
|---|---|---|
| `import type { Game } from '../lib/types'` | Importa **solo el tipo**, no código. Se usa cuando lo importado es una `interface` o un `type`. | Arriba de `PlayersPanel.tsx` |
| `import { settle, type GameResults } from '../lib/calc'` | Lo mismo, mezclando una función (`settle`) y un tipo en la misma línea. | `ResultsPanel.tsx` |
| `type Currency = 'EUR' \| 'USD' \| 'GBP'` | Un tipo que solo admite esos tres textos exactos. | `src/lib/types.ts` |
| `function X({ a, b }: Props)` | El componente recibe un objeto (las props) y lo **desestructura**: saca `a` y `b` como variables. `Props` es una interfaz con la forma de ese objeto. | `ResultsPanel.tsx`, línea 14 |
| `const { rows } = results` | Desestructurar fuera de los parámetros: equivale a `const rows = results.rows`. | `ResultsPanel.tsx`, línea 15 |
| `cond ? a : b` | El "if" en una expresión: si `cond` es verdadero, vale `a`; si no, `b`. | Muchos componentes |

---

## Paso 1 · Entender los tests que fallan

Abre `src/lib/calc.test.ts` y busca los dos tests marcados con `×`. Antes de escribir código, responde a estas preguntas (de cabeza o en un papel):

1. `sampleGame()` tiene 4 jugadores que ponen 20 € cada uno. ¿Por qué el test espera `8000` y no `80`?
2. En el segundo test se le quitan 5 fichas blancas a Ana (de 15 a 10). Una blanca vale 0,05 €. ¿Por qué el resultado esperado es `-25`?
3. Según ese test, ¿qué significa que `difference` sea **negativa**: que falta dinero en la mesa o que sobra?
4. El test usa `totalInvested` y `difference`, pero la tabla de arriba también necesita lo que hay en la mesa. ¿Qué tercer campo te va a hacer falta?

<details>
<summary>Respuestas</summary>

1. Porque todo el dinero va en céntimos: 4 × 2000.
2. 5 fichas × 5 céntimos = 25 céntimos menos en la mesa.
3. Que **falta**: `difference = mesa − aportado`.
4. `totalFinal`, el valor total de las fichas en la mesa.

</details>

> 💡 **Opcional:** añade tus propios tests en el mismo `describe`. Dos ideas: un jugador con una recompra y sin fichas finales (¿qué diferencia sale?) y un caso en el que sobre dinero (`difference > 0`).

---

## Paso 2 · Poner los tests en verde (`calc.ts`)

Todo este paso ocurre en `src/lib/calc.ts`. Ábrelo y localiza dos cosas:

- La **interfaz** `GameResults` (hacia la línea 12). Ahora mismo solo tiene `rows`.
- La **función** `computeResults` (hacia la línea 31). Al final hace `return { rows }`.

El paso tiene dos mitades, y conviene hacerlas en este orden:

**2a. Ampliar la interfaz (el "contrato").** Dentro de las llaves de `GameResults`, debajo de `rows`, añade tres campos de tipo `number`: `totalInvested`, `totalFinal` y `difference`. Encima de cada uno, un comentario `/** … */` que diga qué es y en qué unidad está (céntimos). En el de `difference`, deja claro el signo: qué resta es y qué significa que salga negativo.

En cuanto guardes pasarán dos cosas, y las dos son buenas señales:

- Los errores rojos de `calc.test.ts` desaparecen: ahora el test pide campos que sí existen en el tipo.
- Aparece un error **nuevo** en el `return { rows }` de `computeResults`, parecido a `Type '{ rows: … }' is missing the following properties from type 'GameResults': totalInvested, totalFinal, difference`. TS te está diciendo: "prometiste que esta función devuelve un `GameResults` (lo pone en su firma, `): GameResults {`), y el objeto que devuelves no tiene todos los campos". Esa es tu lista de tareas para 2b.

**2b. Calcular los valores (la implementación).** En `computeResults`, entre el cálculo de `rows` y el `return`:

1. Suma el `invested` de todas las filas de `rows`.
2. Suma el `final` de todas las filas.
3. Calcula la diferencia con el signo que documentaste en 2a.
4. Devuelve un objeto con `rows` y los tres campos nuevos.

Guarda y mira la terminal de `npx vitest`: cuando salga `Tests 13 passed`, este paso está hecho. Comprueba también que `npm run build` ya no da errores.

<details>
<summary>Pista: cómo funciona <code>reduce</code></summary>

`reduce` recorre un array y va acumulando un resultado. Recibe una función `(acumulado, elemento) => nuevoAcumulado` y el valor inicial. Un ejemplo que no tiene nada que ver con el ejercicio:

```ts
const libros = [{ titulo: 'A', paginas: 120 }, { titulo: 'B', paginas: 300 }]
const totalPaginas = libros.reduce((sum, libro) => sum + libro.paginas, 0)
// vuelta 1: sum = 0,   libro = A → 120
// vuelta 2: sum = 120, libro = B → 420
```

TS deduce solo que `totalPaginas` es un `number`: no hace falta anotarlo. Compruébalo pasando el ratón por encima.

</details>

<details>
<summary>Pista: devolver un objeto con varios campos</summary>

En JavaScript, `{ rows }` es una abreviatura de `{ rows: rows }`: sirve cuando la variable se llama igual que el campo. Si se llaman distinto, escribes `campo: variable`. Las dos formas se pueden mezclar en el mismo objeto, separadas por comas:

```ts
const titulo = 'Hola'
const n = 3
return { titulo, cantidad: n } // → { titulo: 'Hola', cantidad: 3 }
```

</details>

<details>
<summary>Pista: cómo sumar un campo de un array</summary>

Fíjate en cómo está hecha `totalInvested(player)` un poco más arriba en el mismo archivo: `reduce` con un acumulador que empieza en `0`.

</details>

<details>
<summary>Pista: cuidado con los nombres</summary>

Ya existe una **función** llamada `totalInvested` en `calc.ts`. Si dentro de `computeResults` creas una variable con el mismo nombre, la función queda tapada. Usa otro nombre para la variable local (`invested`, `sumInvested`…) y asígnala al campo al devolver el objeto.

</details>

<details>
<summary>Pista: ¿por qué no hay problemas de redondeo?</summary>

Porque todo son enteros (céntimos × número de fichas). Si trabajáramos con euros con decimales, `0.1 + 0.2` daría `0.30000000000000004` y la comparación `=== 0` fallaría. Por eso **nunca** conviertas a euros hasta el momento de mostrar el texto (`formatMoney`).

</details>

---

## Paso 3 · El componente `BalanceBanner`

Crea `src/components/BalanceBanner.tsx`.

**Props:** el componente recibe `results` (un `GameResults`) y `currency` (un `Currency`).

> 💡 **Tienes un modelo perfecto:** `ResultsPanel.tsx` recibe **exactamente las mismas props**. Mira sus primeras 15 líneas: los `import`, la `interface Props { … }` y cómo la usa en `function ResultsPanel({ results, currency }: Props)`. Tu archivo empieza igual, cambiando el nombre de la función.

Un archivo de componente en este repo siempre tiene tres partes, en este orden:

1. **Imports.** Funciones (`cn`, `formatMoney`) con `import { … }` y tipos (`GameResults`, `Currency`) con `import type { … }`. Si te equivocas de ruta, VS Code lo subraya en rojo. Truco: escribe el nombre (`formatMoney`), pulsa `Ctrl+Espacio` y elige la sugerencia: VS Code añade el import solo.
2. **`interface Props`** con la forma de las props. No hace falta exportarla, solo la usa este archivo.
3. **`export function NombreDelComponente({ …props… }: Props) { … }`**, que devuelve JSX. Exporta la función (con nombre, sin `default`), porque así es como la importarán los paneles.

**Requisitos:**

- Un `div` con `role="status"` (los lectores de pantalla anuncian el cambio cuando pasa de "faltan" a "cuadra").
- Borde, fondo y texto en verde si cuadra y en amarillo si no. Usa los tokens del tema que hay en `src/index.css`: `border-win/35 bg-win/10 text-win` y lo mismo con `warn`.
- Un icono a la izquierda (`✓` o `!`) con `aria-hidden`, y el texto a la derecha.
- Formatea los importes con `formatMoney(cents, currency)` de `src/lib/money.ts`. Ojo: cuando faltan, `difference` es negativo, pero en el texto quieres "Faltan 0,25 €", no "Faltan −0,25 €". (Pista: `Math` tiene una función para eso.)
- Usa `cn()` de `src/lib/cn.ts` para combinar las clases fijas con las condicionales.

<details>
<summary>Pista: clases base que encajan con el resto de la app</summary>

```
flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] leading-snug
```

</details>

<details>
<summary>Pista: estructura del componente</summary>

```tsx
export function BalanceBanner({ results, currency }: Props) {
  const { difference, totalInvested, totalFinal } = results
  const ok = difference === 0

  return (
    <div role="status" className={cn('…clases base…', ok ? '…verde…' : '…amarillo…')}>
      <span aria-hidden>{ok ? '✓' : '!'}</span>
      <span>{/* elige el texto según ok / difference > 0 / difference < 0 */}</span>
    </div>
  )
}
```

</details>

---

## Paso 4 · Integrarlo en los paneles

**`PlayersPanel.tsx`**: este panel ya recibe `results` por props. Muestra el aviso al final del todo, solo si `game.players.length > 0`.

**`ResultsPanel.tsx`**: entre la tarjeta con las barras y la de "Quién paga a quién", muéstralo solo si `results.difference !== 0`.

En los dos casos:

1. Importa el componente arriba del archivo, como los demás componentes (`import { PanelHeader } from './PanelHeader'`).
2. Para que algo solo se pinte si se cumple una condición, en JSX se usa `{condición && <Componente … />}`. Busca `results.rows.length > 0 &&` en `App.tsx` para ver un ejemplo.
3. Pásale las props igual que a cualquier otro componente: `<BalanceBanner results={…} currency={…} />`. Fíjate en de dónde saca cada panel la divisa: `ResultsPanel` la recibe como prop, pero `PlayersPanel` tiene la partida entera (`game`).

Aquí TS te ayuda: si te falta una prop o le pasas algo del tipo equivocado, el `<BalanceBanner` se subraya en rojo y el mensaje te dice cuál.

> 💡 En escritorio se ven los dos paneles a la vez. ¿Tiene sentido que el aviso salga dos veces cuando no cuadra? Decide tú; no hay una única respuesta buena.

---

## Paso 5 · Probarlo a mano

Con `npm run dev`, en móvil (DevTools → modo dispositivo) y en escritorio:

- [ ] Sin jugadores no aparece ningún aviso.
- [ ] Añade un jugador sin fichas: "Faltan 20,00 €".
- [ ] Mete sus fichas hasta llegar a 20 €: pasa a verde.
- [ ] Añade una recompra: vuelve a "Faltan".
- [ ] Mete fichas de más: "Sobran".
- [ ] Cambia la divisa a USD: el aviso usa `$`.
- [ ] En el paso Resultado, el aviso solo sale cuando no cuadra.

---

## Terminado cuando…

```bash
npm test
```

```bash
npm run build
```

```bash
npm run lint
```

Los tres pasan sin errores (`Tests 13 passed`, o más si añadiste los tuyos), la lista del paso 5 está completa y has borrado la sección "Funcionalidad reservada" de `AGENTS.md`.

---

## Retos extra (opcionales)

1. **Bloquear el compartir**: deshabilita el botón "Compartir" si no cuadra, o pide confirmación antes.
2. **Pista útil**: si faltan 0,25 € y la ficha más pequeña vale 0,05 €, di "equivale a 5 fichas blancas".
3. **Animación**: que el aviso cambie de color con una transición suave al pasar de amarillo a verde (`transition-colors`).

---

## Si te atascas

Errores de TS que te puedes encontrar en esta tarea:

| Mensaje (resumido) | Qué suele significar |
|---|---|
| `Property 'X' does not exist on type 'Y'` | Usas un campo que la interfaz `Y` no declara. O falta añadirlo a la interfaz, o está mal escrito (las mayúsculas cuentan). |
| `Type '{…}' is missing the following properties from type 'Y': …` | Devuelves o pasas un objeto al que le faltan campos que `Y` exige. El mensaje te los lista. |
| `Cannot find name 'X'` | Usas algo que no has importado ni declarado en ese archivo. |
| `'X' is declared but its value is never read` | Has importado o creado algo que no usas. En el navegador funciona, pero este repo tiene activado `noUnusedLocals` y `npm run build` falla: bórralo. |
| `Type 'string' is not assignable to type 'number'` | Pasas un valor de un tipo donde se esperaba otro. Pasa el ratón por encima de cada lado para ver qué tipo tiene. |

Puedes pedirle ayuda a Claude, pero dile que **te guíe sin darte la solución**, por ejemplo:

> "Estoy haciendo la guía de comprobar el cuadre. Revisa mi `BalanceBanner.tsx` y dime qué está mal, pero sin escribirme el código."
