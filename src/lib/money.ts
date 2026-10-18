import { CURRENCIES } from './defaults'
import type { Currency } from './types'

const formatters = new Map<string, Intl.NumberFormat>()

function formatter(currency: Currency, signed: boolean) {
  const key = `${currency}:${signed}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      signDisplay: signed ? 'exceptZero' : 'auto',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    formatters.set(key, f)
  }
  return f
}

/** 1475 → "14,75 €" (o "+14,75 €" con signed). Usa el signo menos tipográfico. */
export function formatMoney(cents: number, currency: Currency, { signed = false } = {}): string {
  return formatter(currency, signed).format(cents / 100).replace('-', '−')
}

/** 25 → "0,25", para mostrar dentro de un input. */
export function formatPlain(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

/** Acepta "1,25", "1.25", "3" o "". Devuelve céntimos, o null si el texto no es un importe válido. */
export function parseMoney(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '') return 0
  if (!/^\d*\.?\d*$/.test(normalized) || normalized === '.') return null
  return Math.round(Number(normalized) * 100)
}

export function currencySymbol(currency: Currency): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency
}
