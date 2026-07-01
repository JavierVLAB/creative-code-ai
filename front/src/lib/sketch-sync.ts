// Decisiones puras de sincronización entre estado React y el iframe del sketch.

export type SketchSyncMode = 'init' | 'restart'

/** Decide cómo sincronizar el iframe cuando cambian sketch.js y/o config.yaml. */
export function getSketchSyncMode(
  previousSketch: string | null,
  previousConfig: string | null,
  currentSketch: string,
  currentConfig: string,
): SketchSyncMode {
  const sketchChanged = previousSketch !== null && previousSketch !== currentSketch
  const configChanged = previousConfig !== null && previousConfig !== currentConfig

  return configChanged && !sketchChanged ? 'restart' : 'init'
}
