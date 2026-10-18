import { useEffect, useMemo, useRef, useState } from 'react'
import { ChipsPanel } from './components/ChipsPanel'
import { Header } from './components/Header'
import { PlayersPanel } from './components/PlayersPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { Stepper } from './components/Stepper'
import { useGame } from './hooks/useGame'
import { computeResults } from './lib/calc'
import { cn } from './lib/cn'
import { buildShareUrl, clearSharedGame, readSharedGame } from './lib/share'
import type { Game } from './lib/types'

function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number>(undefined)
  const show = (text: string) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2500)
  }
  return [message, show] as const
}

export default function App() {
  const [game, dispatch] = useGame()
  const [shared, setShared] = useState<Game | null>(readSharedGame)
  const [step, setStep] = useState(0)
  const [toast, showToast] = useToast()
  const results = useMemo(() => computeResults(game), [game])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const share = async () => {
    const url = buildShareUrl(game)
    // En móvil abrimos el menú nativo; en escritorio copiamos el enlace.
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: 'Poker Calc', text: 'Resultado de la partida', url })
        return
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('Enlace copiado al portapapeles')
    } catch {
      showToast('No se ha podido copiar el enlace')
    }
  }

  const newGame = () => {
    if (confirm('¿Empezar una partida nueva? Se borrarán los jugadores actuales.')) {
      dispatch({ type: 'reset' })
      setStep(0)
    }
  }

  if (shared) {
    const sharedResults = computeResults(shared)
    const close = () => {
      clearSharedGame()
      setShared(null)
    }
    return (
      <div className="min-h-dvh">
        <Header />
        <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-5">
          <div className="card flex flex-col gap-3 border-gold/40">
            <p className="text-sm">Estás viendo una partida que te han compartido.</p>
            <div className="flex gap-2">
              <button type="button" className="btn-outline flex-1 py-2.5 text-sm" onClick={close}>
                Ir a mi partida
              </button>
              <button
                type="button"
                className="btn-primary flex-1 py-2.5 text-sm"
                onClick={() => {
                  if (game.players.length === 0 || confirm('Se sustituirá tu partida actual. ¿Continuar?')) {
                    dispatch({ type: 'load', game: shared })
                    setStep(2)
                    close()
                  }
                }}
              >
                Guardar como mía
              </button>
            </div>
          </div>
          <ResultsPanel results={sharedResults} currency={shared.currency} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <Header>
        <button type="button" className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs hover:border-muted" onClick={newGame}>
          Nueva partida
        </button>
      </Header>
      <Stepper step={step} onChange={setStep} />

      <main className="mx-auto max-w-7xl px-4 pt-3 pb-32 lg:grid lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)_minmax(320px,380px)] lg:items-start lg:gap-6 lg:px-6 lg:pt-6 lg:pb-12">
        <section className={cn(step !== 0 && 'hidden lg:block')}>
          <ChipsPanel game={game} dispatch={dispatch} />
        </section>
        <section className={cn(step !== 1 && 'hidden lg:block')}>
          <PlayersPanel game={game} results={results} dispatch={dispatch} />
        </section>
        <section className={cn('lg:sticky lg:top-24', step !== 2 && 'hidden lg:block')}>
          <ResultsPanel results={results} currency={game.currency} />
          {results.rows.length > 0 && (
            <button type="button" className="btn-primary mt-3 hidden w-full lg:flex" onClick={share}>
              Compartir resultado
            </button>
          )}
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        {step === 0 && (
          <button type="button" className="btn-primary w-full" onClick={() => setStep(1)}>
            Siguiente · Jugadores
          </button>
        )}
        {step === 1 && (
          <button type="button" className="btn-primary w-full" onClick={() => setStep(2)}>
            Calcular resultado
          </button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <button type="button" className="btn-outline flex-1" onClick={() => setStep(1)}>
              Editar
            </button>
            <button type="button" className="btn-primary flex-1" disabled={results.rows.length === 0} onClick={share}>
              Compartir
            </button>
          </div>
        )}
      </footer>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-4 transition-all duration-300 lg:bottom-8',
          toast ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <span className="rounded-full border border-line bg-surface-2 px-4 py-2 text-sm shadow-xl">{toast}</span>
      </div>
    </div>
  )
}
