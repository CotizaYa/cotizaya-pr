# CotizaYa PR — Plan de reinicio de producto con mentalidad de ingeniería

**Autor:** Manus AI  
**Fecha:** 2026-05-08  
**Objetivo:** convertir CotizaYa en una herramienta confiable para contratistas de Puerto Rico, reduciendo promesas vagas y reemplazándolas por flujos verificables, datos reales y pruebas de aceptación.

> **Principio operativo:** gana quien no deja de intentar, pero solo si cada intento reduce incertidumbre. Desde ahora, cada cambio debe responder una pregunta concreta: ¿esto ayuda a un contratista real a cotizar, comprar material, coordinar producción o conseguir clientes con menos errores?

## Diagnóstico inmediato

El producto tenía dos problemas de confianza visibles: un enlace público a fabricantes que terminaba en 404 y una estética visual que se sentía más como ilustración que como herramienta técnica. El primer problema destruye la percepción de confiabilidad antes de que el usuario pruebe el valor real. El segundo debilita la credibilidad frente a contratistas que esperan medidas, materiales, listas de compra y diagramas sobrios.

| Área revisada | Hallazgo | Acción ya tomada | Criterio de aceptación |
|---|---|---|---|
| Fabricantes públicos | El enlace apuntaba a `/buscar`, pero la ruta no existía. | Se creó `/buscar` como directorio público sin login. | Abrir `/buscar` no devuelve 404 y el botón desde `/catalogo` navega correctamente. |
| Catálogo visual | Los renders anteriores podían percibirse como caricatura. | Se reemplazó el estilo por diagramas técnicos sobrios. | El catálogo se percibe como herramienta de fabricación, no como contenido decorativo. |
| Landing | Había botones de precio sin destino y enlaces de footer muertos. | Se convirtieron botones a `Link` reales hacia `/register`, `/catalogo` y `/buscar`. | Ninguna acción principal de la landing debe quedar sin destino. |
| Directorio vacío | Un estado vacío puede parecer producto incompleto. | Se reescribió para comunicar que solo se muestran perfiles reales publicados. | El usuario entiende que no se inventan fabricantes para llenar espacio. |

## Prioridad de producto

La prioridad no debe ser “parecer Luminio”. La prioridad debe ser ganar una cuña clara: **CotizaYa debe resolver el flujo diario de un contratista de aluminio y cristal en Puerto Rico con menos pasos y menor costo operativo**. Si el flujo de cotización, hoja de compra y producción funciona de forma verificable, la comparación con cualquier competidor se vuelve secundaria.

| Prioridad | Resultado buscado | Por qué importa | Prueba mínima |
|---|---|---|---|
| P0 — Confianza pública | Catálogo, fabricantes, login y registro sin errores visibles. | Si el primer clic falla, el usuario no confía en cálculos posteriores. | Prueba móvil y desktop de `/`, `/catalogo`, `/buscar`, `/login`, `/register`. |
| P0 — Cotización real | Crear una cotización con modelo, medidas, precio editable y total sin IVU quemado. | Es el corazón económico del producto. | Cotización de ejemplo con 2 productos y total reproducible. |
| P0 — Hoja de compra | Perfilería, cristalería y misceláneo separados con cantidades claras. | El contratista compra material, no solo envía un PDF bonito. | Comparar hoja generada contra una factura o lista real. |
| P1 — Perfil público | Cada fabricante puede publicar catálogo y contacto sin pantallas rotas. | Es la vía de adquisición orgánica. | Perfil público funcional con catálogo técnico y CTA de contacto. |
| P1 — Calendario | Producción e instalación con estados simples. | Reduce llamadas y desorden operativo. | Crear evento, cambiar estado, ver en móvil. |
| P2 — Diferenciación | Plantillas y reglas por taller: descuentos, desperdicio, perfiles favoritos. | Aquí se supera al competidor con localización real. | Guardar reglas por fabricante y reutilizarlas en cotización. |

## Pruebas de aceptación obligatorias

Cada despliegue debe pasar estas pruebas antes de considerarse listo. Si una falla, no se debe declarar “terminado”.

| Ruta o flujo | Prueba | Resultado esperado |
|---|---|---|
| `/` | Abrir desde móvil y desktop. | Landing carga, CTAs van a rutas reales, no hay enlaces muertos visibles. |
| `/catalogo` | Abrir y presionar “Ver fabricantes públicos”. | Navega a `/buscar`, sin 404. |
| `/buscar` | Abrir sin iniciar sesión. | Muestra buscador, filtros y estado vacío honesto si no hay perfiles reales. |
| `/register` | Abrir desde CTA de plan. | Carga registro, no login incorrecto ni pantalla rota. |
| `/dashboard/cotizaciones/nueva` | Intentar entrar sin sesión. | Debe redirigir o mostrar auth clara; nunca error crudo. |
| Cotización autenticada | Seleccionar producto, medidas y cantidad. | Total consistente, sin IVU automático si no se configuró. |
| Hoja de compra | Generar desde cotización. | Materiales agrupados en perfilería, cristalería y misceláneo. |
| Perfil público | Abrir `/p/[username]`. | Perfil existe o muestra estado no encontrado profesional. |

## Deuda técnica que no se debe ignorar

La app no puede depender de “parece que funciona”. Hay que convertir los flujos en contratos explícitos entre UI, Supabase y lógica de negocio. Los puntos más peligrosos son las migraciones no aplicadas, RPC inexistentes, botones sin destino, estados vacíos ambiguos y diferencias entre datos demo y datos reales.

| Riesgo | Síntoma | Solución recomendada |
|---|---|---|
| Migraciones no aplicadas | Módulos como suplidores o calendario fallan en producción. | Crear pantalla interna de health-check de tablas/RPC necesarias. |
| RPC ausente | `/buscar` consulta `search_public_fabricantes` y puede fallar si no existe en Supabase. | Añadir migración/versionado de RPC y fallback visual ya implementado. |
| Datos vacíos | El directorio parece abandonado. | Mostrar CTA de publicación y explicar que solo se listan perfiles reales. |
| CTAs falsos | Botones de precios o footer sin acción. | Mantener auditoría automática de enlaces internos. |
| Diferencia local/producción | `localhost` confunde a usuarios. | Verificar siempre en URL pública temporal o producción antes de pedir feedback. |

## Siguiente bloque de ejecución

El próximo bloque no debe ser cosmético. Debe crear una demo real repetible: un contratista entra, selecciona un modelo técnico, introduce medidas, genera una cotización, ve hoja de compra y puede compartir un perfil público. Ese flujo debe probarse con una lista de materiales comparable a facturas reales.

| Orden | Cambio | Resultado esperado |
|---|---|---|
| 1 | Compilar y subir los cambios actuales de landing, catálogo y directorio. | Se elimina otra capa de fricción pública. |
| 2 | Crear prueba manual documentada con capturas de `/`, `/catalogo`, `/buscar`, `/register`. | Evidencia visible para validar desde celular. |
| 3 | Auditar `search_public_fabricantes` y migraciones de perfiles públicos. | Evitar que `/buscar` falle si Supabase no tiene la función. |
| 4 | Crear un “modo demo honesto” con datos internos marcados como ejemplo, si el usuario lo autoriza. | Permite vender el flujo sin inventar fabricantes reales. |
| 5 | Validar cotización contra un caso real de puerta/screen con medidas y materiales. | El producto empieza a competir por precisión, no por diseño. |

## Referencias internas

| Referencia | Archivo |
|---|---|
| [1] | `src/app/page.tsx` |
| [2] | `src/app/catalogo/page.tsx` |
| [3] | `src/app/buscar/page.tsx` |
| [4] | `src/components/product/ProductVisual.tsx` |
