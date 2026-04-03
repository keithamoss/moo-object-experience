# GitHub Copilot Instructions

## UI Library

This project uses **Mantine v9** (`@mantine/core`, `@mantine/hooks`, `@mantine/form`).
MUI (`@mui/material`) has been removed entirely — do not add MUI imports.

## Icons

Use `@tabler/icons-react`. Do not use `@mui/icons-material`.

## Styling

- CSS Modules for component-specific styles (`ComponentName.module.css`)
- Mantine style props (`c`, `p`, `mb`, etc.) for inline overrides
- `--mantine-*` CSS variables for theme tokens in `.module.css` files
- No Tailwind, no Emotion, no `sx` prop

## Forms

Use `@mantine/form` (`useForm`) for form state. No validation schema yet — add Zod v4 when data-entry forms are introduced.

## Search state architecture

URL is the source of truth for search query and active fields. Redux reads from URL (via `useURLSearchState`). Components read from Redux only. `@mantine/form` owns the live (uncommitted) query value in `SearchContainer`; `form.onSubmit` writes to the URL.

## Tests

- Unit tests: Vitest + Testing Library (`npm run test`)
- E2E: Playwright (`npm run test:e2e`) — run against `npm run dev`
- Run a single E2E test by name: `npm run test:e2e -- --grep "test name here"`
- Use ARIA roles and `data-testid` for selectors. No `.Mantine*` class selectors.
- E2E locators must be unambiguous — prefer `{ name: '...', exact: true }` over regex when multiple elements may match.

## Illustrations

Use [unDraw](https://undraw.co/) for open-source SVG illustrations (MIT-style license, free to use).

- Browse: https://undraw.co/illustrations
- Search API: `https://undraw.co/api/search?q={keyword}` — returns JSON with `media` CDN URLs
- Download SVG via CDN: `https://cdn.undraw.co/illustration/{slug}.svg`
- Save downloaded SVGs as `src/components/{ComponentName}Image.svg` and import as a module path
- Use Mantine `<Image>` to render with `max-width` sizing in the CSS module

## Mantine documentation

When uncertain about a Mantine v9 API, fetch the relevant doc page:

- Index: https://mantine.dev/llms.txt
- Full consolidated doc: https://mantine.dev/llms-full.txt
- Per-component: `https://mantine.dev/llms/core-{component-name}.md`
  (e.g. https://mantine.dev/llms/core-autocomplete.md, https://mantine.dev/llms/core-combobox.md)
- `@mantine/form`: https://mantine.dev/llms/form-use-form.md
