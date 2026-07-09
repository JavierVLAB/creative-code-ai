# CurateArtAI — Segunda entrega: trabajo con IA, arnés y flujo de desarrollo


## 1. Resumen de la entrega

Para la primera se realizo un desarrollo iterativo de una idea, que una vez que cogio forma se procedio a dar el maximo de detalles para el PRD, para enteder y establecer lo que es realmente el producto.

Para esta entrega el trabajo fue refactorizar el proyecto, crear los specs necesarios y crear y conectar la base de datos y el sistema de agente (backend). Para la base de datos se escogio Supabase, y para el sistema de agentes se escogio Mastra. Ambas ecogencias se hicieron para facilitar el desarrollo y porque actualmente las estoy empezando a usar en otros proyecto, y me gustaría profundizar en su utilización y puesta a punto.

Entonces, para esta entrega se han ido desarrollando historias de usuario y sus respestivos tickets para ir construyendo el sistema. Actualmente el sistema se puede ejecutar y ver en vivo en la url: https://creative-code-ai.vercel.app/playground. En este link se puede ver la pagina demo, donde se pueden observar 3 sketchs ya desarrollados y se puede ver como funcionan y como interactuan con diversos parametros. En esta pantalla no se puede usar la IA pero para la entrega final se podra habilitar. Actualmente funciona pero no esta activado en la nube.

En resumen la app es una app para desarrollar borradores de visualización creativa asistido con IA. Uno crea un borrador y lo puede ir modificando con IA, añadiendo parametros que te permitan interactuar y cambiar el resultado de la visualizacion.

Para la entrega final se quieren hacer más cosas, permitir comparar varios borradores para poder curar el resultado, tener mas completo la app y profundizar en el comportamiento de los agentes que generan los borradores.

Por otro lado, tambien me gustaria mejorar el proceso de desarrollo con IA, establecer un mejor arnes de agentes, revisar el que ya esta y implementar algunas mejoras con hooks, skills y actualizar las instrucciones. Y trabajar con un flujo de PR, que se me ha pasado hacerlo antes.


## 2. Desarrollo con agentes

En este proyecto se han usado casi siempre Claude Code (Sonnet 5 y 4.8, Opus 4.8), y ultimamente estoy probando Codex (GPT 5.5).

El flujo de trabajo suele ser el siguiente:

- Se empieza con una conversación con el agente para definir la funcionalidad o historia de usuario que se quiere tener en la app. 
- Luego cuando se tiene claridad en que se quiere, se pide crear la historia de usuario y el ticket correspondiente,
- Se construye una propuesta con openspec, 
- Reviso la propuesta
- Se le pide que aplique la propuesta de change
- Se aplican test (generalmente estan ya en la propuesta y se hacen directamente)
- Se observan los resultados
- Se ajustan los errores o detalles
- Se archiva el change
- Se hace commit de la rama y se hace merge a main

## 3. Arnés para agentes

Para este proyecto se creo un conjunto de instrucciones para orientar a los agentes en su trabajo.

- [AGENTS.md](/Users/javiervillarroel/Documents/Proyectos/AI4Devs/AI4Devs-finalproject/AGENTS.md:1): reglas generales de trabajo, validación, seguridad y uso de OpenSpec. Por ejemplo, obliga a leer primero las specs, no asumir autorizaciones y no hacer acciones peligrosas sin confirmación.
- [CLAUDE.md](/Users/javiervillarroel/Documents/Proyectos/AI4Devs/AI4Devs-finalproject/CLAUDE.md:1): instrucciones concretas del proyecto, stack, flujo de changes, prompting y uso de subagentes. Por ejemplo, fija que hay que pasar por propose/apply/archive, que no se deben instalar dependencias automáticamente y que al delegar en subagentes hay que darles contexto y verificación.
- [openspec/config.yaml](/Users/javiervillarroel/Documents/Proyectos/AI4Devs/AI4Devs-finalproject/openspec/config.yaml:1): configuración base de OpenSpec. Por ejemplo, define que el proyecto usa un flujo spec-driven.
- `openspec/specs/`: fuente de verdad del comportamiento esperado del sistema y de varias convenciones técnicas. Por ejemplo, se consulta antes de cambiar contratos, flujos de UI o reglas de despliegue.
- `openspec/specs/agent-api/spec.md`: define el contrato del backend del agente. Por ejemplo, qué espera `POST /agent`, qué datos se envían y qué forma debe tener la respuesta.
- `openspec/specs/agent-chat/spec.md`: define cómo se integra el chat en el workspace. Por ejemplo, mensajes, estado de carga, errores, preguntas aclaratorias y sugerencias de memoria.
- `openspec/specs/public-playground/spec.md`: define la demo pública basada en plantillas. Por ejemplo, que `/playground` sea pública, efímera y sin llamadas al agente.
- `openspec/specs/sketch-workspace/spec.md`: define el funcionamiento principal del editor y del sketch. Por ejemplo, cómo se cargan los proyectos, cómo se sincroniza el sketch y cómo se aplican los cambios.
- `openspec/specs/deployment/spec.md`: define el despliegue y la integración entre frontend, backend y Supabase. Por ejemplo, qué variables de entorno necesita cada servicio y en qué orden desplegarlos.

---
## 4. Problemas al trabajar con IA

Las cosas que estoy haciendo me parece que no son muy comunes, entonces me cuesta mucho como cerrar lo que realmente quiero que haga la app. Con la IA paso tiempo dando vuelta a como hacer ciertas cosas hasta que consigo afinar lo que quiero que haga. 

Un problema que he tenido que me costo bastante fue refactorizar el proyecto. Hice una prototipo anterior usando un poco de vibe coding sobretodo para la parte de diseño. Cuando estuvo mas o menos aceptable, me dispuse a crear todo el sistema de openspec y hacer la refactorización y enlazar un base de datos y el sistema de agentes con Mastra, antes fucionaba todo en el front. En este momento los problemas fueron que asumio muchas cosas sin traer los datos reales del codigo, el diseño era muy generico y hardcodeaba mucho las cosas cuando tiene instrucciones de no asumir y que use el sistema de diseño anterior.

Tambien me costo el desarrollo con Mastra ya que asumio algunas cosas que no deberian ser igual en local y en la nube. De hecho el sistema que monto en la nube no se dormia con la inactividad, asi que me consumio 16 horas de CPU de las 24 horas gratis de Mastra.

------------

## 5. Propuesta para la próxima entrega

Para la próxima entrega quiero:

- Mejorar las instrucciones generales del proyecto en CLAUDE.md y AGENTS.md
- Crear un arnés mas completo. 
    - Crear Skills, 
    - Crear subagentes especificos
    - Definir e implementar hooks
- Realizar PR de los nuevos tickets

Con respecto a la app me gustaría completar un par de cosas:
- Poder crear un sketch de cero con la IA
- Poder guardar varios snapshop de versiones del sketch para curar poder curar los mejore
- Mejorar el producto
    - pantalla de perfil
    - gestion de autentificación
- Mejorar la biblioteca de plantillas
- Crear varios sketchs de ejemplos

