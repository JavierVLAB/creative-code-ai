// Tests de ejemplo para Vitest.
// Patrón: describe(it) con descripciones en español.

import { describe, it, expect } from 'vitest'

function sumar(a: number, b: number): number {
  return a + b
}

describe('sumar', () => {
  it('devuelve la suma de dos números positivos', () => {
    expect(sumar(2, 3)).toBe(5)
  })

  it('devuelve un número negativo cuando corresponde', () => {
    expect(sumar(-2, 1)).toBe(-1)
  })

  it('devuelve cero con valores opuestos', () => {
    expect(sumar(5, -5)).toBe(0)
  })
})
