# VAVOY Design System

## Guía de Estilo Visual

**VAVOY** — Sistema de diseño para una plataforma de movilidad compartida hiperlocal

---

## 🎯 Principios de Diseño

### Esencia de la Marca
VAVOY representa movilidad sostenible, conexión local y confianza comunitaria. Nuestro diseño debe reflejar:

- **Naturaleza y sostenibilidad** — Inspiración en espacios abiertos y entornos naturales
- **Claridad y eficiencia** — Información directa, sin ruido visual
- **Calidez humana** — Amigable, accesible, digno de confianza
- **Minimalismo funcional** — Solo lo esencial, diseñado con propósito

---

## 🎨 Sistema de Color

### Paleta Principal

#### Primary — Verde Naturaleza
```
#2D7A4F
RGB: 45, 122, 79
Uso: Acciones principales, botones CTA, elementos activos
Contexto: Evoca naturaleza, sostenibilidad y movimiento
Contraste: AAA sobre blanco, AA sobre neutros claros
```

**Variaciones:**
- **Primary Light**: `#48A876` — Hover states, fondos suaves
- **Primary Dark**: `#1E5A3A` — Pressed states, énfasis
- **Primary Subtle**: `#E8F5EF` — Fondos de secciones, highlights

#### Secondary — Azul Confianza
```
#3B82C4
RGB: 59, 130, 196
Uso: Información, links, elementos secundarios
Contexto: Profesionalismo, confianza, claridad
Contraste: AA sobre blanco
```

**Variaciones:**
- **Secondary Light**: `#5FA1D8` — Estados hover
- **Secondary Dark**: `#2B6399` — Estados pressed
- **Secondary Subtle**: `#EBF4FA` — Fondos informativos

#### Accent — Naranja Energía
```
#F59E42
RGB: 245, 158, 66
Uso: Notificaciones, urgencia suave, destacados
Contexto: Energía, optimismo, llamadas a la acción secundarias
Contraste: AA sobre blanco
```

### Neutrales

Sistema de grises cálidos (ligeramente sesgados hacia tonos naturales)

```css
--neutral-50:  #FAFAF9   /* Fondos, superficies principales */
--neutral-100: #F5F5F3   /* Fondos alternativos, separadores sutiles */
--neutral-200: #E7E7E3   /* Bordes, divisores */
--neutral-300: #D1D1CC   /* Bordes activos, placeholders */
--neutral-400: #A3A39A   /* Texto deshabilitado, iconos secundarios */
--neutral-500: #737369   /* Texto secundario, subtítulos */
--neutral-600: #52524B   /* Texto principal */
--neutral-700: #3A3A35   /* Encabezados, énfasis */
--neutral-800: #242420   /* Texto destacado, máximo contraste */
```

**Reglas de uso:**
- **50-100**: Fondos de página, cards
- **200-300**: Bordes, separadores, inputs
- **400-500**: Texto secundario, íconos
- **600-800**: Texto principal, títulos

### Colores Semánticos

#### Éxito
```
--success-main:   #2D7A4F  (Primary)
--success-light:  #E8F5EF
--success-dark:   #1E5A3A
```
**Uso:** Confirmaciones, viajes completados, estados activos

#### Advertencia
```
--warning-main:   #F59E42  (Accent)
--warning-light:  #FEF3E8
--warning-dark:   #D47A1E
```
**Uso:** Alertas informativas, tiempo limitado, cambios pendientes

#### Error
```
--error-main:     #DC3545
--error-light:    #FDEAEC
--error-dark:     #B02A37
```
**Uso:** Errores críticos, cancelaciones, validación fallida

#### Información
```
--info-main:      #3B82C4  (Secondary)
--info-light:     #EBF4FA
--info-dark:      #2B6399
```
**Uso:** Tips, información contextual, ayuda

---

## ✍️ Tipografía

### Familias Tipográficas

#### Títulos y Headings
**Inter** (Google Fonts)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Características:**
- Geométrica, moderna, altamente legible
- Excelente para interfaces digitales
- Spacing óptimo en todos los tamaños

#### Cuerpo y Texto
**Inter** (misma familia para coherencia)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Alternativa del sistema:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Escala Tipográfica

Basada en escala modular con ratio 1.250 (Mayor Third)

```css
/* Display */
--font-size-2xl:   48px   /* Hero titles, landing pages */
--font-size-xl:    38px   /* Page titles principales */

/* Headings */
--font-size-h1:    32px   /* Títulos de página */
--font-size-h2:    26px   /* Secciones principales */
--font-size-h3:    21px   /* Subsecciones */
--font-size-h4:    18px   /* Títulos de cards, grupos */

/* Body */
--font-size-lg:    18px   /* Destacados, intro text */
--font-size-base:  16px   /* Texto principal (body default) */
--font-size-sm:    14px   /* Texto secundario, labels */
--font-size-xs:    12px   /* Microcopy, timestamps, badges */
--font-size-2xs:   10px   /* Legal, footnotes (usar con moderación) */
```

### Pesos (Weights)

```css
--font-weight-regular:    400   /* Texto body estándar */
--font-weight-medium:     500   /* Énfasis suave, subtítulos */
--font-weight-semibold:   600   /* Botones, labels importantes */
--font-weight-bold:       700   /* Títulos, headings */
```

### Line Heights

```css
--line-height-tight:     1.2    /* Títulos grandes, headings */
--line-height-snug:      1.4    /* Títulos pequeños, h3-h4 */
--line-height-normal:    1.5    /* Texto body principal */
--line-height-relaxed:   1.6    /* Párrafos largos, contenido denso */
--line-height-loose:     1.8    /* Textos muy extensos (raras ocasiones) */
```

### Guías de Uso

#### Títulos y Encabezados
```css
/* H1 — Título de página */
font-size: 32px;
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.02em;
color: var(--neutral-800);

/* H2 — Secciones principales */
font-size: 26px;
font-weight: 700;
line-height: 1.3;
color: var(--neutral-700);

/* H3 — Subsecciones */
font-size: 21px;
font-weight: 600;
line-height: 1.4;
color: var(--neutral-700);

/* H4 — Títulos de cards */
font-size: 18px;
font-weight: 600;
line-height: 1.4;
color: var(--neutral-700);
```

#### Texto Body
```css
/* Párrafo principal */
font-size: 16px;
font-weight: 400;
line-height: 1.5;
color: var(--neutral-600);

/* Texto secundario */
font-size: 14px;
font-weight: 400;
line-height: 1.5;
color: var(--neutral-500);

/* Microcopy */
font-size: 12px;
font-weight: 400;
line-height: 1.4;
color: var(--neutral-500);
```

#### Botones y CTAs
```css
/* Botón estándar */
font-size: 16px;
font-weight: 600;
letter-spacing: 0.01em;

/* Botón pequeño */
font-size: 14px;
font-weight: 600;
```

---

## 🧩 Componentes UI

### Botones

#### Primary Button
**Uso:** Acción principal en cada pantalla (máx. 1 por vista)

```css
/* Normal */
background: var(--primary-main, #2D7A4F);
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-size: 16px;
font-weight: 600;
border: none;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Hover */
background: var(--primary-light, #48A876);
box-shadow: 0 2px 6px rgba(45, 122, 79, 0.2);

/* Pressed */
background: var(--primary-dark, #1E5A3A);
box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

/* Disabled */
background: var(--neutral-200, #E7E7E3);
color: var(--neutral-400, #A3A39A);
cursor: not-allowed;
```

#### Secondary Button
**Uso:** Acciones secundarias, alternativas

```css
/* Normal */
background: transparent;
color: var(--primary-main, #2D7A4F);
padding: 12px 24px;
border-radius: 8px;
font-size: 16px;
font-weight: 600;
border: 2px solid var(--primary-main, #2D7A4F);

/* Hover */
background: var(--primary-subtle, #E8F5EF);
border-color: var(--primary-dark, #1E5A3A);

/* Pressed */
background: var(--primary-subtle, #E8F5EF);
border-color: var(--primary-dark, #1E5A3A);
```

#### Ghost Button
**Uso:** Acciones terciarias, navegación

```css
/* Normal */
background: transparent;
color: var(--neutral-700, #3A3A35);
padding: 12px 24px;
border-radius: 8px;
font-size: 16px;
font-weight: 600;
border: none;

/* Hover */
background: var(--neutral-100, #F5F5F3);

/* Pressed */
background: var(--neutral-200, #E7E7E3);
```

#### Tamaños de Botones

```css
/* Large */
padding: 16px 32px;
font-size: 18px;
border-radius: 10px;

/* Medium (default) */
padding: 12px 24px;
font-size: 16px;
border-radius: 8px;

/* Small */
padding: 8px 16px;
font-size: 14px;
border-radius: 6px;

/* Extra Small */
padding: 6px 12px;
font-size: 12px;
border-radius: 4px;
```

### Inputs y Formularios

#### Text Input
```css
/* Normal */
background: #FFFFFF;
border: 2px solid var(--neutral-200, #E7E7E3);
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
color: var(--neutral-700, #3A3A35);

/* Placeholder */
color: var(--neutral-400, #A3A39A);

/* Focus */
border-color: var(--primary-main, #2D7A4F);
box-shadow: 0 0 0 3px rgba(45, 122, 79, 0.1);
outline: none;

/* Error */
border-color: var(--error-main, #DC3545);
box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);

/* Disabled */
background: var(--neutral-50, #FAFAF9);
border-color: var(--neutral-200, #E7E7E3);
color: var(--neutral-400, #A3A39A);
cursor: not-allowed;
```

#### Label
```css
font-size: 14px;
font-weight: 600;
color: var(--neutral-700, #3A3A35);
margin-bottom: 6px;
display: block;
```

#### Helper Text
```css
font-size: 12px;
color: var(--neutral-500, #737369);
margin-top: 4px;
```

#### Error Message
```css
font-size: 12px;
color: var(--error-main, #DC3545);
margin-top: 4px;
display: flex;
align-items: center;
gap: 4px;
```

### Cards

#### Card de Viaje (Principal)
```css
/* Container */
background: #FFFFFF;
border-radius: 12px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
border: 1px solid var(--neutral-100, #F5F5F3);

/* Hover */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
border-color: var(--neutral-200, #E7E7E3);
transform: translateY(-2px);
transition: all 0.2s ease;
```

**Estructura interna:**
```
[ Avatar + Nombre del conductor ] 14px, medium, neutral-700
[ Origen → Destino ]              18px, semibold, neutral-800
[ Hora de salida ]                14px, regular, neutral-500
[ Plazas disponibles + Precio ]   Badges + 18px bold primary
```

#### Card Elevada (Modal, Drawer)
```css
background: #FFFFFF;
border-radius: 16px;
padding: 24px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
```

### Badges y Chips

#### Badge — Información Rápida
```css
/* Éxito (Plazas disponibles) */
background: var(--success-light, #E8F5EF);
color: var(--success-dark, #1E5A3A);
padding: 4px 10px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;

/* Información (Estado) */
background: var(--info-light, #EBF4FA);
color: var(--info-dark, #2B6399);

/* Advertencia */
background: var(--warning-light, #FEF3E8);
color: var(--warning-dark, #D47A1E);
```

#### Chip — Seleccionable/Filtro
```css
/* Normal */
background: var(--neutral-100, #F5F5F3);
color: var(--neutral-700, #3A3A35);
padding: 8px 16px;
border-radius: 20px;
font-size: 14px;
font-weight: 500;
border: 2px solid transparent;

/* Hover */
background: var(--neutral-200, #E7E7E3);

/* Selected */
background: var(--primary-subtle, #E8F5EF);
color: var(--primary-dark, #1E5A3A);
border-color: var(--primary-main, #2D7A4F);
```

### Header y Navegación

#### App Header (Mobile)
```css
height: 64px;
background: #FFFFFF;
border-bottom: 1px solid var(--neutral-100, #F5F5F3);
padding: 0 16px;
display: flex;
align-items: center;
justify-content: space-between;

/* Logo */
font-size: 24px;
font-weight: 700;
color: var(--primary-main, #2D7A4F);
```

#### Bottom Navigation (Mobile)
```css
height: 64px;
background: #FFFFFF;
border-top: 1px solid var(--neutral-100, #F5F5F3);
box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
display: flex;
justify-content: space-around;
align-items: center;
padding: 8px 0;

/* Nav Item */
font-size: 12px;
color: var(--neutral-500, #737369);
text-align: center;

/* Nav Item Active */
color: var(--primary-main, #2D7A4F);
font-weight: 600;
```

### Iconografía

**Estilo:** Outlined (contorno), trazo de 2px
**Librería recomendada:** Lucide Icons, Heroicons (Outline)
**Tamaños:**
```css
--icon-xs:   16px   /* Badges, inline text */
--icon-sm:   20px   /* Botones pequeños, lista items */
--icon-md:   24px   /* Botones estándar, navegación */
--icon-lg:   32px   /* Headers, iconos destacados */
--icon-xl:   48px   /* Onboarding, empty states */
```

**Color:**
- Por defecto: `var(--neutral-600)`
- Activo/Selected: `var(--primary-main)`
- Deshabilitado: `var(--neutral-400)`

---

## 📐 Layout y Espaciado

### Sistema de Espaciado

Basado en múltiplos de **4px** (sistema 4pt)

```css
--spacing-1:    4px
--spacing-2:    8px
--spacing-3:    12px
--spacing-4:    16px
--spacing-5:    20px
--spacing-6:    24px
--spacing-8:    32px
--spacing-10:   40px
--spacing-12:   48px
--spacing-16:   64px
--spacing-20:   80px
--spacing-24:   96px
```

### Reglas de Uso

**Espaciado interno (padding):**
- Botones: 12px vertical, 24px horizontal
- Cards: 16px (mobile), 24px (desktop)
- Inputs: 12px vertical, 16px horizontal
- Modal/Sheet: 24px

**Espaciado entre elementos (margin/gap):**
- Items relacionados: 8px
- Secciones pequeñas: 16px
- Secciones principales: 24px–32px
- Separación de página: 48px

### Grid System

**Mobile First** — breakpoints:

```css
/* Mobile (default) */
@media (min-width: 0) {
  --container-padding: 16px;
  --grid-columns: 4;
  --grid-gap: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  --container-padding: 24px;
  --grid-columns: 8;
  --grid-gap: 24px;
}

/* Desktop */
@media (min-width: 1024px) {
  --container-padding: 32px;
  --grid-columns: 12;
  --grid-gap: 24px;
  --max-width: 1200px;
}
```

### Layout Patterns

#### Mobile Card List
```
Padding lateral: 16px
Espacio entre cards: 12px
Card padding interno: 16px
```

#### Desktop Grid de Viajes
```
Grid: 2-3 columnas (según breakpoint)
Gap: 24px
Max width: 1200px centrado
```

### Elevación y Sombras

Sistema de sombras (depth) para jerarquía:

```css
/* Nivel 1 — Cards en reposo */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Nivel 2 — Cards hover, inputs focus */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);

/* Nivel 3 — Dropdowns, tooltips */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Nivel 4 — Modals, drawers */
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
```

### Bordes y Radios

```css
--radius-sm:     4px   /* Badges, tags pequeños */
--radius-md:     8px   /* Botones, inputs, cards estándar */
--radius-lg:     12px  /* Cards destacadas */
--radius-xl:     16px  /* Modals, sheets */
--radius-full:   999px /* Pills, avatares */
```

---

## 🎭 Principios de Composición

### White Space (Espacio en Blanco)

**Regla de oro:** Más espacio = más claridad

- Deja respirar los elementos importantes
- No tengas miedo al espacio vacío
- Usa márgenes generosos entre secciones (32px+)
- En mobile, mantén padding lateral consistente (16px mínimo)

### Jerarquía Visual

**Orden de importancia:**
1. Acción principal (botón CTA)
2. Información crítica (origen/destino, hora, precio)
3. Información secundaria (nombre conductor, valoraciones)
4. Metadatos (timestamp, badges de estado)

**Herramientas para jerarquía:**
- Tamaño de fuente
- Peso tipográfico (weight)
- Color (saturación y contraste)
- Espaciado
- Posición

### Alineación y Consistencia

- Mantén alineación consistente (izquierda en lecturas de texto)
- Usa grid de 4px para alinear elementos
- Los botones principales deben estar alineados en la misma posición en toda la app
- Mantén paddings consistentes en componentes similares

---

## 📱 Mobile-First Guidelines

### Principios Mobile

1. **Zona de pulgar:** Coloca acciones principales en la zona inferior o media de la pantalla
2. **Tap targets:** Mínimo 44x44px para botones y elementos interactivos
3. **Scroll vertical:** Diseña para scroll natural, evita scroll horizontal
4. **Estados de carga:** Siempre muestra feedback visual al cargar
5. **Gestos naturales:** Pull-to-refresh, swipe para eliminar (con confirmación)

### Safe Areas

Respeta las áreas seguras en dispositivos modernos:

```css
/* iOS notch/island */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## ♿ Accesibilidad

### Contraste

Todos los textos deben cumplir **WCAG AA** mínimo:
- Texto normal: contraste 4.5:1
- Texto grande (18px+): contraste 3:1

### Estados de Focus

Todos los elementos interactivos deben mostrar un estado de focus visible:

```css
outline: 3px solid var(--primary-main);
outline-offset: 2px;
```

### Lectores de Pantalla

- Usa labels semánticos en formularios
- Añade `alt` text en todas las imágenes
- Usa roles ARIA cuando sea necesario
- Mantén orden lógico de tabs (tab index)

---

## 🚀 Ejemplos de Composición

### Pantalla: Buscar Viaje

```
[ Header: Logo + Avatar ]           64px altura
[ Search Bar Grande ]               Padding 16px
[ Filtros (Chips) ]                 Horizontal scroll
--- 24px ---
[ Cards de Viajes ]
  Card 1: padding 16px, radius 12px
  --- 12px ---
  Card 2
  --- 12px ---
  Card 3
--- 32px ---
[ Bottom Navigation ]               64px altura
```

### Card de Viaje — Anatomía

```
┌─────────────────────────────┐
│ [Avatar] Ana M.  ⭐ 4.8     │ 14px, neutral-500
│                             │
│ Madrid → Segovia            │ 18px, semibold, neutral-800
│ Hoy, 18:30                  │ 14px, neutral-500
│                             │
│ [Badge: 2 plazas] [15€]     │ 16px bold, primary
│                             │
│ [Botón: Reservar ahora] →   │ Primary button
└─────────────────────────────┘
   12px radius, shadow-sm
```

---

## 🎨 Tono Visual y Voz

### Personalidad de Marca

- **Cercana:** Usa lenguaje sencillo, tuteo ("Tú")
- **Confiable:** Información clara, sin trucos ni letra pequeña
- **Sostenible:** Referencias a naturaleza, comunidad, cuidado del entorno
- **Eficiente:** Sin rodeos, directo al grano

### Ejemplos de Microcopy

**❌ Evitar:**
"Introduce tus credenciales para proceder con la autenticación"

**✅ Mejor:**
"Inicia sesión"

---

**❌ Evitar:**
"Tu solicitud de reserva ha sido procesada con éxito"

**✅ Mejor:**
"¡Reserva confirmada! Te esperamos en el punto de encuentro"

---

## 📦 Recursos y Archivos

### Fuentes
- **Inter**: [Google Fonts](https://fonts.google.com/specimen/Inter)
- Pesos necesarios: 400, 500, 600, 700

### Iconos
- **Lucide Icons**: https://lucide.dev
- **Heroicons**: https://heroicons.com (Outline set)

### Colores en Formato Dev-Ready
Ver archivo: `design-tokens.css`

---

## 📋 Checklist de Implementación

Al diseñar nuevas pantallas, asegúrate de:

- [ ] Usar colores solo del sistema definido
- [ ] Respetar escala tipográfica (no tamaños arbitrarios)
- [ ] Aplicar espaciado del sistema 4pt
- [ ] Botón primario: máximo 1 por pantalla
- [ ] Estados hover/focus/disabled en todos los interactivos
- [ ] Contraste WCAG AA mínimo en textos
- [ ] Tap targets de 44x44px mínimo (mobile)
- [ ] Mantener consistencia con componentes existentes
- [ ] Diseño mobile-first probado
- [ ] Feedback visual en acciones (loading, éxito, error)

---

**Versión:** 1.0
**Última actualización:** Noviembre 2024
**Mantenido por:** Equipo de Producto VAVOY

---

*Este styleguide es un documento vivo. Actualízalo conforme evolucione el producto, pero mantén siempre la coherencia y la simplicidad como norte.*
