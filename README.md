# VAVOY Design System

Sistema de diseño completo para VAVOY — plataforma de movilidad compartida hiperlocal.

---

## 📁 Archivos Incluidos

```
yavoy/
├── STYLEGUIDE.md              # Guía completa del sistema de diseño
├── design-tokens.css          # Variables CSS listas para usar
├── components-showcase.html   # Ejemplos visuales de componentes
└── README.md                  # Este archivo
```

---

## 🚀 Inicio Rápido

### 1. Revisar la Guía de Estilo

Lee `STYLEGUIDE.md` para entender:
- Principios de diseño
- Paleta de colores completa
- Sistema tipográfico
- Componentes UI
- Layout y espaciado

### 2. Implementar los Design Tokens

Importa el archivo CSS en tu proyecto:

```html
<link rel="stylesheet" href="design-tokens.css">
```

O si usas un bundler (Webpack, Vite, etc.):

```css
@import './design-tokens.css';
```

### 3. Ver Ejemplos en Vivo

Abre `components-showcase.html` en tu navegador para ver todos los componentes funcionando.

---

## 🎨 Uso de Variables CSS

### Ejemplo: Botón Primario

```css
.mi-boton {
  background: var(--primary-main);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.mi-boton:hover {
  background: var(--primary-light);
  box-shadow: var(--shadow-primary);
}
```

### Ejemplo: Card de Viaje

```html
<div class="card">
  <div class="card-header">
    <div class="avatar">AM</div>
    <div>
      <h3 class="card-title">Ana Martínez</h3>
      <p class="card-subtitle">⭐ 4.8</p>
    </div>
  </div>

  <div class="card-body">
    <h4>Madrid → Segovia</h4>
    <p>Hoy, 18:30</p>
  </div>

  <div class="card-footer">
    <span class="badge badge-success">2 plazas</span>
    <span class="price">15€</span>
  </div>
</div>
```

```css
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

---

## 🎯 Variables Más Usadas

### Colores

```css
var(--primary-main)      /* Verde naturaleza - #2D7A4F */
var(--primary-subtle)    /* Fondo verde claro - #E8F5EF */
var(--secondary-main)    /* Azul confianza - #3B82C4 */
var(--accent-main)       /* Naranja energía - #F59E42 */

var(--neutral-50)        /* Fondo página - #FAFAF9 */
var(--surface)           /* Blanco puro - #FFFFFF */
var(--text-primary)      /* Texto principal - #242420 */
var(--text-secondary)    /* Texto secundario - #52524B */
var(--border)            /* Bordes - #E7E7E3 */
```

### Espaciado

```css
var(--spacing-2)   /* 8px  - Espacios pequeños */
var(--spacing-3)   /* 12px - Entre elementos relacionados */
var(--spacing-4)   /* 16px - Padding estándar */
var(--spacing-6)   /* 24px - Entre secciones */
var(--spacing-8)   /* 32px - Separación grande */
```

### Tipografía

```css
var(--font-size-h1)    /* 32px - Títulos de página */
var(--font-size-h4)    /* 18px - Títulos de cards */
var(--font-size-base)  /* 16px - Texto principal */
var(--font-size-sm)    /* 14px - Texto secundario */

var(--font-weight-semibold)  /* 600 - Botones, títulos */
var(--font-weight-regular)   /* 400 - Texto normal */
```

### Sombras

```css
var(--shadow-sm)  /* Cards en reposo */
var(--shadow-md)  /* Cards hover */
var(--shadow-lg)  /* Dropdowns */
var(--shadow-xl)  /* Modals */
```

---

## 📱 Mobile-First

Todos los componentes están diseñados **mobile-first**. Breakpoints:

```css
/* Mobile (default) */
@media (min-width: 0) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

### Ejemplo Responsive

```css
.grid-viajes {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: 1fr; /* Mobile: 1 columna */
}

@media (min-width: 768px) {
  .grid-viajes {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columnas */
  }
}

@media (min-width: 1024px) {
  .grid-viajes {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columnas */
  }
}
```

---

## ♿ Accesibilidad

### Contraste

Todos los colores cumplen **WCAG AA**:
- Texto normal: contraste 4.5:1 mínimo
- Texto grande: contraste 3:1 mínimo

### Focus States

Siempre añade estados de focus visibles:

```css
button:focus,
input:focus {
  outline: 3px solid var(--primary-main);
  outline-offset: 2px;
}
```

### Tap Targets (Mobile)

Asegúrate de que todos los elementos táctiles tengan **mínimo 44x44px**:

```css
.boton-movil {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-3) var(--spacing-4);
}
```

---

## 🎭 Componentes Disponibles

Ver `STYLEGUIDE.md` para especificaciones completas:

### Botones
- Primary (acción principal)
- Secondary (acción secundaria)
- Ghost (acción terciaria)
- Tamaños: small, medium (default), large

### Inputs
- Text input
- Estados: normal, focus, error, disabled
- Labels, helper text, error messages

### Cards
- Card de viaje (principal)
- Card elevada (modals)
- Con hover effect

### Badges y Chips
- Badges: éxito, info, advertencia, error
- Chips: seleccionables/filtros

### Navegación
- Header (mobile/desktop)
- Bottom navigation (mobile)

---

## 🛠️ Frameworks

### React/Vue/Angular

Puedes usar las variables CSS directamente:

```jsx
// React
<button
  style={{
    background: 'var(--primary-main)',
    padding: 'var(--spacing-3) var(--spacing-6)',
    borderRadius: 'var(--radius-md)'
  }}
>
  Reservar
</button>
```

O crear componentes reutilizables:

```jsx
// Button.jsx
export const Button = ({ variant = 'primary', children }) => {
  return (
    <button className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};
```

### Tailwind CSS

Si usas Tailwind, puedes extender tu configuración con los tokens de VAVOY:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#2D7A4F',
          light: '#48A876',
          dark: '#1E5A3A',
          subtle: '#E8F5EF',
        },
        // ... resto de colores
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        // ... resto de espaciado
      }
    }
  }
}
```

---

## 📊 Paleta de Colores Completa

### Primarios

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| Primary | `#2D7A4F` | 45, 122, 79 | Botones CTA, acciones principales |
| Primary Light | `#48A876` | 72, 168, 118 | Hover states |
| Primary Dark | `#1E5A3A` | 30, 90, 58 | Pressed states |
| Primary Subtle | `#E8F5EF` | 232, 245, 239 | Fondos suaves |

### Secundarios

| Color | Hex | RGB | Uso |
|-------|-----|-----|-----|
| Secondary | `#3B82C4` | 59, 130, 196 | Links, información |
| Secondary Light | `#5FA1D8` | 95, 161, 216 | Hover states |
| Secondary Dark | `#2B6399` | 43, 99, 153 | Pressed states |

### Neutrales

| Color | Hex | Contexto |
|-------|-----|----------|
| Neutral 50 | `#FAFAF9` | Fondos de página |
| Neutral 100 | `#F5F5F3` | Fondos alternativos |
| Neutral 200 | `#E7E7E3` | Bordes, separadores |
| Neutral 300 | `#D1D1CC` | Bordes activos |
| Neutral 500 | `#737369` | Texto secundario |
| Neutral 700 | `#3A3A35` | Encabezados |
| Neutral 800 | `#242420` | Texto principal |

---

## 🔧 Troubleshooting

### Los colores no se aplican

**Solución:** Asegúrate de importar `design-tokens.css` **antes** de tus estilos personalizados.

```html
<!-- ✅ Correcto -->
<link rel="stylesheet" href="design-tokens.css">
<link rel="stylesheet" href="tu-estilo.css">

<!-- ❌ Incorrecto -->
<link rel="stylesheet" href="tu-estilo.css">
<link rel="stylesheet" href="design-tokens.css">
```

### Las fuentes no se ven

**Solución:** Importa Inter desde Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Los espacios no coinciden

**Solución:** Usa siempre variables del sistema de espaciado (4pt):

```css
/* ✅ Correcto */
padding: var(--spacing-4);
margin: var(--spacing-6);

/* ❌ Evitar */
padding: 15px;
margin: 25px;
```

---

## 📚 Recursos Adicionales

### Fuentes
- [Inter en Google Fonts](https://fonts.google.com/specimen/Inter)

### Iconos (recomendados)
- [Lucide Icons](https://lucide.dev) — Outlined, trazo 2px
- [Heroicons](https://heroicons.com) — Outline set

### Inspiración
- Airbnb Design System
- Bolt Design Guidelines
- AllTrails UI Patterns
- Material Design 3

---

## 🤝 Contribuir

Si necesitas añadir nuevos componentes o modificar el sistema:

1. **Mantén la coherencia** — Usa solo colores, espaciados y tipografías del sistema
2. **Documenta** — Actualiza `STYLEGUIDE.md` con nuevos componentes
3. **Accesibilidad** — Verifica contraste WCAG AA y navegación por teclado
4. **Mobile-first** — Diseña primero para móvil, luego adapta a desktop

---

## 📄 Licencia

Este sistema de diseño es propiedad de VAVOY. Uso interno exclusivo.

---

## 📞 Contacto

¿Dudas sobre el sistema de diseño?
- Revisa primero `STYLEGUIDE.md`
- Abre `components-showcase.html` para ver ejemplos visuales
- Contacta al equipo de producto para casos especiales

---

**Versión:** 1.0
**Última actualización:** Noviembre 2024
**Mantenido por:** Equipo de Producto VAVOY
