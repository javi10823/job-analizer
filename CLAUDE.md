# JobMatch — Claude Code Context

## Qué es esto
Herramienta personal de Javier Olivieri (DevLabs) para evaluar fit entre job descriptions y su CV usando Claude API. Vite + React, deploy en Vercel.

## Stack
- Vite + React 18
- Sin UI library — todo CSS-in-JS inline con variables de estilo en `s = {}`
- Anthropic API llamada directo desde el browser con `anthropic-dangerous-direct-browser-access: true`
- API key via `import.meta.env.VITE_ANTHROPIC_API_KEY` (Vercel env var, nunca en código)

## Estructura
```
src/
  App.jsx     ← todo el app en un archivo (intencional, es una herramienta personal)
  main.jsx    ← entry point estándar de Vite
index.html    ← fuentes DM Sans + DM Mono via Google Fonts
```

## CV del candidato
El string `MY_CV` en `App.jsx` contiene el CV de Javier Olivieri hardcodeado. Es editable desde la UI (toggle "CV — click para editar"). Si Javier pide actualizar el CV, editá ese string directamente.

## Estética / diseño
- Dark theme: background `#0a0a0a`, cards `#111`, borders `#1e1e1e`
- Tipografía: DM Sans (UI) + DM Mono (código/tags)
- Colores de score: verde `#4ade80` (≥80), amarillo `#fbbf24` (≥60), rojo `#f87171` (<60)
- Keywords match: verde oscuro `#0a1a0a` bg / `#4ade80` text
- Keywords gap: rojo oscuro `#1a0a0a` bg / `#f87171` text
- NO cambiar el tema a light, NO agregar librerías de UI, NO agregar gradients

## Prompt de análisis
`SYSTEM_PROMPT` en App.jsx. Claude devuelve JSON estructurado con:
- `skills_score`, `strategic_score` (0-100)
- `verdict`, `verdict_type` ('apply'|'skip'|'maybe')
- `summary` (2-3 oraciones)
- `checks[]` (6-10 items con status 'ok'|'warn'|'no')
- `keywords_match[]`, `keywords_gap[]`
- `outreach` (mensaje listo para copiar, en el idioma seleccionado globalmente)

## Language switch (ES / EN)
Toggle en el header. Controla el idioma de **todo** el output de Claude (verdict, summary, checks, keywords, outreach). Se implementa appendeando una instrucción de idioma al `SYSTEM_PROMPT` al momento del call:
- ES: "Respond entirely in Spanish…" (excepción: keywords técnicos quedan en inglés)
- EN: "Respond entirely in English."
Reemplaza el viejo toggle ES/EN que solo afectaba outreach. Ahora hay un solo campo `outreach` en el JSON (no más `outreach_es`/`outreach_en`).

## Progress bar
Barra de progreso fake que aparece debajo del botón durante el análisis:
- `setInterval` cada 100ms, curva exponencial 0→85% en ~8 segundos
- Salta a 100% cuando la API responde, desaparece tras 300ms
- Color: `#4ade80` (mismo verde de scores positivos), 4px de alto, redondeada
- El botón muestra "Analizando..." (disabled) mientras la barra está activa

## Contexto adicional
Textarea opcional entre el CV toggle y el botón de analizar. Permite al candidato agregar contexto libre (ej: aclarar experiencia específica, proyectos relevantes no listados en el CV).
- Estado: `additionalContext`, vacío por defecto
- Si tiene contenido, se appendea al user message después del CV: `"\n\nAdditional context from candidate (prioritize when scoring and writing the verdict):\n{additionalContext}"`
- Si está vacío, no se envía nada extra

## Modelo usado
`claude-sonnet-4-20250514` — no cambiar a otro modelo sin preguntar.

## Lo que NO hay que tocar sin preguntar
- El CV (`MY_CV`) — solo Javier lo actualiza
- El system prompt — está calibrado para dar análisis brutalmente honestos, no flattery
- La lógica de colores de score — está mapeada a criterios específicos
- El modelo de Claude

## Posibles mejoras futuras (no implementar sin que Javier lo pida)
- Historial de análisis (localStorage)
- Export a PDF del reporte
- Múltiples CVs / perfiles
- Campo para nombre del recruiter y empresa (para personalizar outreach)
- Score histórico para comparar JDs entre sí

## Dev local
```bash
cp .env.example .env.local   # agregar VITE_ANTHROPIC_API_KEY real
npm install
npm run dev
```

## Deploy
Vercel. Variable de entorno: `VITE_ANTHROPIC_API_KEY`.
Repo: privado en GitHub de Javier.
