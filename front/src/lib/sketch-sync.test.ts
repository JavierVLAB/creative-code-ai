import { describe, expect, it } from 'vitest'

import { getSketchSyncMode } from './sketch-sync'

describe('getSketchSyncMode', () => {
  it('usa init en la primera carga', () => {
    expect(getSketchSyncMode(null, null, 'sketch', 'config')).toBe('init')
  })

  it('usa init si cambia solo sketch.js', () => {
    expect(getSketchSyncMode('sketch-a', 'config', 'sketch-b', 'config')).toBe('init')
  })

  it('usa restart si cambia solo config.yaml', () => {
    expect(getSketchSyncMode('sketch', 'config-a', 'sketch', 'config-b')).toBe('restart')
  })

  it('usa init si cambian sketch.js y config.yaml', () => {
    expect(getSketchSyncMode('sketch-a', 'config-a', 'sketch-b', 'config-b')).toBe('init')
  })
})
