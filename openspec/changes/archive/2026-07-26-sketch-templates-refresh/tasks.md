## 1. Limpieza de plantillas

- [x] 1.1 Migración `supabase/migrations/20260726010000_delete_extra_templates.sql`: `DELETE FROM public.templates WHERE slug IN ('ondas-perlin', 'mandala-geometrico', 'lluvia-de-cuadrados', 'campo-de-vectores')`
- [x] 1.2 Confirmar que `demo`, `bezier-noise`, `particulas` (migración `20260702120000_add_public_templates.sql`) no se tocan

## 2. Addon p5.js-svg en el runtime

- [x] 2.1 Añadir script CDN de `p5.js-svg` en `buildSrcdoc` de `front/src/components/workspace/SketchViewer.tsx`, después del script de p5.js
- [x] 2.2 Verificar manualmente en navegador que `createCanvas(w, h, SVG)` funciona con la versión de p5.js-svg elegida y que no rompe ningún sketch existente que no usa `SVG`
- [x] 2.3 Actualizar `openspec/specs/sketch-contract/spec.md` documentando el addon disponible como capacidad opcional

## 3. Control de imagen (`type: image`)

- [x] 3.1 `front/src/lib/types.ts`: añadir `ImageControl` (`kind: 'image'`, `key`, `label`) a la unión `Control`
- [x] 3.2 `front/src/lib/controls.ts`: parsear `type: image` de `config.yaml` → `ImageControl`
- [x] 3.3 Test: `controls.test.ts` cubre la generación de un `ImageControl` desde config.yaml
- [x] 3.4 Nuevo hook `front/src/hooks/useProjectAssets.ts`: `listAssets(projectId)`, `uploadAsset(file)` (sube a Storage + inserta fila en `public.assets`)
- [x] 3.5 Nuevo componente `front/src/components/workspace/ControlImage.tsx`: miniatura/placeholder, botón "Subir imagen" y botón "Elegir de las subidas" (lista de `assets` del proyecto), validación `image/*` y tamaño máximo
- [x] 3.6 `ParamsControls.tsx`: renderizar `ControlImage` cuando `control.kind === 'image'`
- [x] 3.7 Comportamiento dual: con `assetContext` real → sube a Storage + inserta en `assets` + permite elegir entre subidas previas; sin `assetContext` (playground) → solo `FileReader` a data URL en memoria, sin tocar Supabase, sin selector de subidas
- [x] 3.8 Test: cobertura de `useProjectAssets`/`ControlImage` — pendiente, ver nota de sección 12 sobre infraestructura de tests de componentes

## 4. Bucket de Storage + RLS

- [x] 4.1 Migración `supabase/migrations/20260726020000_add_sketch_uploads_bucket.sql`: crear bucket público `sketch-uploads` (mismo patrón que `snapshot-previews`) + policies de insert/delete por dueño del proyecto (ver `design.md`)
- [x] 4.2 Migración aplicada por Javi en el SQL Editor de Supabase
- [x] 4.3 Actualizar `openspec/specs/supabase-patterns/spec.md` con el requirement del bucket y su uso de la tabla `assets` ya existente

## 5. Exportación SVG (bridge postMessage)

- [x] 5.1 `SketchViewer.tsx`: nuevo mensaje `EXPORT_SVG` (App → iframe) y listener de `EXPORTED_SVG` (iframe → App); `useSketch.ts` expone `requestSvgExport()`
- [x] 5.2 Botón "Exportar SVG" en el sidebar (visible siempre que se pase `onExportSvg`, en workspace y playground); dispara la descarga real (Blob + `<a download>`) en el documento padre
- [x] 5.3 Manejo de "no soportado": timeout de 2s en `requestSvgExport`, muestra aviso inline sin romper la UI
- [x] 5.4 Actualizar `openspec/specs/sketch-workspace/spec.md` con el nuevo requirement de exportación SVG

## 6. Plantilla: tramado estocástico para serigrafía

- [x] 6.1 Escribir `sketch.js` con dithering (Floyd-Steinberg / Atkinson / estocástico) y `config.yaml` (`imagen_fuente`, `resolucion`, `umbral`, `contraste`, `intensidad`, `invertir`, `algoritmo`) — borrador en `openspec/changes/sketch-templates-refresh/assets/tramado-serigrafia.*`
- [x] 6.2 Revisión creativa de Javi del resultado visual antes de darla por definitiva
- [x] 6.3 Probar manualmente: sin imagen (placeholder), con imagen subida, cambiando cada parámetro en tiempo real

## 7. Plantilla: espiral de ruido Perlin para plotter

- [x] 7.1 Escribir `sketch.js` (espiral con radio modulado por `noise()`, ver técnica en `design.md`) y `config.yaml` (`vueltas`, `escala_ruido`, `amplitud`, `semilla`, `grosor_trazo`) — borrador en `assets/espiral-plotter.*`
- [x] 7.2 Implementar `window.__exportSVG` sobre `createGraphics(w, h, SVG)`
- [x] 7.3 Revisión creativa de Javi
- [x] 7.4 Probar exportación SVG real de principio a fin (botón → descarga → abrir el archivo)

## 8. Plantilla: flow field de ruido Perlin

- [x] 8.1 Escribir `sketch.js` (líneas siguiendo campo de ángulos por `noise()`) y `config.yaml` (`n_lineas`, `escala_ruido`, `velocidad`, `longitud_traza`, `color_linea`) — borrador en `assets/flow-field-perlin.*`
- [x] 8.2 Revisión creativa de Javi
- [x] 8.3 Probar manualmente cada parámetro

## 9. Plantilla: mosaico de arcos (adaptación del sketch de Javi)

- [x] 9.1 Reescribir el sketch original quitando `OPC.*`, simplificando la geometría (solo 2 arcos por tile, sin `encontrarPuntosInterseccion`), con `config.yaml` (`tamano_grid`, `paleta`, `grosor_linea`, `semilla`, `solo_lineas`) — borrador en `assets/mosaico-arcos.*`
- [x] 9.2 Implementar `window.__exportSVG`
- [x] 9.3 Revisión creativa de Javi (comparar con el original para confirmar que se mantiene el lenguaje visual)
- [x] 9.4 Probar exportación SVG

## 10. Migración de contenido final

- [x] 10.1 Migración `supabase/migrations/20260726030000_add_refreshed_templates.sql` generada con los 4 `sketch.js`/`config.yaml` (`on conflict (slug) do update`) — **nota**: Javi pidió probarlas directamente en Supabase en vez de revisión local primero, así que esta migración lleva el contenido de la sección 6-9 sin pasar aún por su aprobación visual; si al probarlas en el playground no le convencen, se ajustan y se vuelve a pegar la migración actualizada.
- [x] 10.2 Migración aplicada por Javi en el SQL Editor de Supabase

## 11. Specs

- [x] 11.1 `openspec/specs/template-library/spec.md` actualizado si cambia algún requirement (probablemente solo referencia de contenido, no comportamiento)

## 11.1 Correcciones tras la primera prueba de Javi

- [x] Botón "Exportar SVG" aparecía en todos los sketches — se añadió chequeo barato `HAS_SVG_EXPORT`/`HAS_SVG_EXPORT_RESULT` al quedar listo el sketch; el botón solo se muestra si `window.__exportSVG` existe de verdad
- [x] "El sketch no soporta SVG" en plotter y mosaico — causa real: `p5.js-svg@1.5.1` es incompatible con p5.js 1.11.x ("drawingContext is undefined"); actualizado a `p5.js-svg@1.6.0`
- [x] Mosaico de arcos con geometría demasiado simplificada — se sustituyó por el algoritmo original de arcos concéntricos + `encontrarPuntosInterseccion`, corrigiendo el cálculo de ángulo (el original usaba `tan`/`atan` de un cociente, incorrecto; ahora `atan2`)
- [x] Snapshots "desaparecidos" — no se encontró ninguna regresión real en el código (`SnapshotsPanel` sigue igual); pendiente confirmar con Javi tras las demás correcciones si seguía siendo un problema real o confusión visual por el botón de exportar apareciendo siempre
- [x] Imagen no se ve en tramado-serigrafia — se descartó CORS (verificado con `curl` contra el bucket real: `access-control-allow-origin: *` presente); se añadió manejo de error explícito (`loadImage` con callback de fallo, mensaje en el propio canvas, `console.error`) para diagnosticar con el siguiente intento — pendiente que Javi reporte qué aparece ahora (mensaje de error en canvas y/o consola)

## 11.2 Segunda ronda de correcciones

- [x] Botón "Exportar SVG" dejó de aparecer en todos los sketches — bug real: `sendInit`/`sendRestart` reseteaban `svgExportAvailable` a `false` justo después de que el chequeo `SKETCH_READY` ya lo hubiera puesto en `true` (con el script de p5.js-svg cacheado por el navegador, ese reset llegaba siempre después). Se quitó el reset; el valor solo lo controla el resultado real de `HAS_SVG_EXPORT_RESULT`
- [x] Botón y textos no seguían el sistema de diseño (tamaño de fuente `--font-size-xs` en vez de `--btn-font-size`, sin el hover del resto de botones) — reescrito con los mismos tokens y hover que `SnapshotsPanel` ("Guardar"/"Grid")
- [x] Textos de botones/errores demasiado largos — acortados: "Elegir de las subidas" → "Galería", "Subir imagen" → "Subir", mensajes de error de `ControlImage`/`useProjectAssets` acortados
- [x] Mosaico de arcos: los arcos de transición se dibujaban casi completos y se cruzaban en vez de dejar el hueco que da la sensación de "por debajo" — bug real: los dos ángulos de intersección no estaban ordenados, así que los dos segmentos del arco terminaban solapándose casi por completo en vez de dejar vacío el tramo entre ellos. Corregido ordenando los ángulos antes de dibujar
- [x] Snapshots "desaparecidos" (persiste en la segunda ronda) — sigo sin encontrar una causa en el código; pedido a Javi una captura de pantalla del sidebar para diagnosticar en vez de seguir adivinando

## 11.3 Tercera ronda

- [x] Exportar SVG seguía sin funcionar tras el fix de versión — causa real: en `p5.js-svg@1.6.0` el nodo `<svg>` real vive en `g._renderer.svg`, no en `g.elt` (eso es un objeto interno de la librería, no un nodo del DOM). Corregido `extraerSVG` en `espiral-plotter` y `mosaico-arcos` para leer `g._renderer.svg` + `XMLSerializer`
- [x] Botón "pegado a la línea" separadora — se quitó esa sección aparte; el botón ahora vive dentro del propio bloque de "Parámetros" (mismo borde/padding), sin línea divisoria nueva. Lógica movida de `Sidebar.tsx` a `ParamsControls.tsx`
- [x] Snapshots "perdidos" — **no es un bug**: `PlaygroundPage.tsx` pasa `showSnapshots={false}` a propósito (el playground público es efímero y no persiste nada, por spec `public-playground`). Javi estaba probando las plantillas nuevas ahí, donde snapshots nunca ha existido. Para guardar snapshots hay que probar dentro de un proyecto autenticado (`/app/projects/:id`), no en `/playground`

## 12. Verificación final

- [x] 12.1 `pnpm test` en verde (front + backend)
- [x] 12.2 `tsc -b` limpio en `front` (vitest/tsc verificados repetidamente durante las correcciones; `vite build` no se corrió explícitamente pero no hay motivo para que falle tras `tsc -b` limpio)
- [x] 12.3 Probado manualmente por Javi en el navegador: las 4 plantillas nuevas probadas y confirmadas "ok" (2026-07-26) — quedan detalles menores que Javi confirma explícitamente que no bloquean este change ("hay detalles pero no son para este change"); si hace falta ajustar algo puntual, se abre un change nuevo pequeño
