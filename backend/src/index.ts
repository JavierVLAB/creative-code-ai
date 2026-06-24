// Punto de entrada del backend.
// En desarrollo: pnpm dev (mastra dev) auto-descubre src/mastra/index.ts y levanta el servidor.
// En producción: mastra build genera el bundle; este archivo re-exporta la instancia.
export { mastra } from './mastra/index.js'
