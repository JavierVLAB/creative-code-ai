## 1. Reorganizar el contrato del arnés

- [x] 1.1 Reescribir `AGENTS.md` para que contenga solo el contrato compartido del proyecto, el flujo OpenSpec y los límites operativos estables
- [x] 1.2 Reescribir `CLAUDE.md` como overlay específico de ejecución para Claude/OpenCode, eliminando duplicación innecesaria con `AGENTS.md`
- [x] 1.3 Verificar que ambos documentos remiten a la misma estructura del arnés sin contradicciones sobre cuándo explorar, proponer o implementar

## 2. Crear la capa operativa en `.agents/`

- [x] 2.1 Crear `.agents/README.md` como índice del arnés con ruta de arranque de sesión y mapa de documentos
- [x] 2.2 Añadir una checklist de inicio de sesión que indique qué leer y en qué orden antes de explorar o implementar
- [x] 2.3 Añadir un catálogo de skills del proyecto, distinguiendo entre skills disponibles y skills deseadas
- [x] 2.4 Documentar hooks como automation hooks del workflow y proponer candidatos concretos para el repo

## 3. Definir especialistas de subagentes

- [x] 3.1 Crear un formato base de especialista con objetivo, cuándo usarlo, contexto mínimo, salida esperada, validación y acciones prohibidas
- [x] 3.2 Crear especialistas iniciales para exploración de repo, frontend, backend/Mastra y alineación spec-código
- [x] 3.3 Añadir un especialista para detección de huecos de tests coherente con `testing-patterns`
- [x] 3.4 Revisar que los especialistas favorecen separación por dominio, mejor salida y menor consumo de tokens

## 4. Validar coherencia del change

- [x] 4.1 Revisar que el nuevo arnés no introduce dependencias nuevas ni mezcla este trabajo con PRs, CI o automatizaciones externas
- [x] 4.2 Comprobar que la terminología de skills, especialistas y hooks es consistente en `AGENTS.md`, `CLAUDE.md` y `.agents/`
- [x] 4.3 Hacer una lectura final del arnés completo desde cero para verificar que una sesión nueva puede orientarse sin contexto adicional

## 5. Activar hooks locales de advertencia

- [x] 5.1 Actualizar el change para que los hooks 1 y 4 pasen de propuesta a implementación local no bloqueante
- [x] 5.2 Crear un script local en `.claude/hooks/` que inspeccione ediciones y emita advertencias basadas en `openspec list --json` y el scope inferido del change
- [x] 5.3 Configurar `.claude/settings.local.json` para ejecutar el hook en `PreToolUse` sobre herramientas de edición
- [x] 5.4 Verificar que la configuración local preserve los permisos existentes y no introduzca bloqueo duro
