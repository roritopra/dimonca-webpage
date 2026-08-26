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

- Exported assets go to `public/images/` and are referenced as `/images/...`.
- Figma MCP exports (`figma_download_assets`, asset URLs) are often dirty: SVGs include the gray canvas rect and purple selection outline, PNG renders can carry a solid canvas background. Clean them before committing (strip the canvas `<rect>` from SVGs; flood-fill the solid background to transparent for PNGs).
- Remote Figma asset URLs expire in ~7 days — download to `public/images/` promptly rather than inlining URLs.
