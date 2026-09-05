## Development

- Start the dev server in background mode: `astro dev --background`
- Manage it with `astro dev stop`, `astro dev status`, `astro dev logs`
- There are no lint, typecheck, or test scripts. `npm run build` (or `npx astro build`) is the verification step. `astro check` will prompt to install `@astrojs/check` — not present; use the build instead.

## Architecture

- `src/pages/index.astro` composes the homepage: `<Navbar />` (from `src/components/common/`), then sections imported from `src/components/home/` (`Hero.astro`, `SobreNosotros.astro`, etc.). Add new homepage sections in `src/components/home/` and shared components in `src/components/common/`.
- Styling is Tailwind v4 via the `@tailwindcss/vite` plugin in `astro.config.mjs` — there is NO `tailwind.config` file. All design tokens live in the `@theme` block of `src/styles/global.css` (beige/brown/pink/blue palette, `--font-sans` Poppins, `--font-script` Sacramento, `--font-exmouth`).
- Fonts: Poppins + Sacramento load from Google Fonts in `src/layouts/Layout.astro`; Exmouth is self-hosted at `public/fonts/exmouth_.woff` with `@font-face` in `global.css`. The Figma design uses Exmouth for script, but the hero uses `font-script` (Sacramento) — match what's already in the component, not the Figma font name.
- Icons use `astro-icon` with the lucide set: `<Icon name="lucide:...">`.

## Animation (motion)

- `motion` v12 is used via `import { animate } from 'motion'` in `Navbar.astro` and `Hero.astro`.
- Use keyframe arrays to force the initial state (e.g. `{ opacity: [0, 1] }`); a separate `duration: 0` pre-step gets cancelled by the following call and breaks the first-run animation.
- CSS transforms do NOT apply to inline elements: any element animated with `x`/`scale`/`rotate` must be `inline-block` (or block).
- When animating a container and its children simultaneously (slide crossfades), set the entering child's initial value via keyframes so the effect is visible on the very first transition.

## Figma / assets

- **Estructura y organización de imágenes**:
  - `src/assets/images/`: Para imágenes que se procesan y optimizan con Astro (`import ... from '../../assets/images/...'` y `<Image />`).
  - `public/images/`: Para activos estáticos servidos directamente, SVGs consumidos vía `<img>` o imágenes inyectadas dinámicamente en scripts de cliente (`/images/...`).
  - **Subdirectorios por sección**:
    - `shared/`: Activos globales o transversales (`logo.png`, `logo-simple.svg`, `chef-hat.svg`, `map-icon.svg`, `est-icon*.png`, `footer-*`).
    - `home/{seccion}/`: Organizadas por componente (`hero/`, `navbar/`, `sobre-nosotros/`, `our-products/`, `more-than/`, `combos/`, `testimonials/`, `find-us/`).
    - `home/find-us/products/`: Productos interactivos para animaciones de hover grid.
- **Convenciones de nombrado**:
  - Usar kebab-case descriptivo en minúsculas (ej. `card-default.png`, `hero-cream.png`, `cookie-clasica.png`).
  - Nunca dejar nombres crudos de exportación de Figma (eliminar prefijos como `Property 1=...`, typos como `cooki`, o nombres ambiguos como `hovered.png`).
- **Limpieza de exports Figma**:
  - Figma MCP exports (`figma_download_assets`, asset URLs) suelen ser sucios: los SVGs incluyen rectángulos de lienzo y bordes de selección púrpura; los PNGs pueden traer fondo sólido. Limpiarlos antes de añadirlos (quitar `<rect>` de canvas en SVGs; transparentar fondos en PNGs).
  - Las URLs remotas de assets de Figma expiran en ~7 días: guardarlas en las carpetas correspondientes en vez de usar URLs remotas.
