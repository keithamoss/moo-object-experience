# Mantine v9 Migration Plan

## Strategy

**Big bang migration** in a feature branch. MUI and Mantine cannot cleanly coexist — their CSS reset systems conflict and there is no incremental migration path without visual regressions. All MUI components will be replaced with Mantine equivalents in a single pass.

- **Mantine version**: v9 (released March 31, 2026). Requires React 19.2+ — already satisfied (project uses `react@^19.2.4`).
- **Mantine UI**: Used for copy-paste layout and design blocks. This is a static block library — code is copied into the project directly, not imported from npm.
- **Tailwind**: Not used.

---

## Decision: `@mantine/form`

**Adopted**, scoped to `SearchContainer` query state.

### What it replaces

`useForm` replaces `useState(localQuery)` and the `handleQueryChange` callback in `SearchContainer`. The form owns the live (uncommitted, mid-keystroke) query value. URL update remains the commit mechanism.

```ts
// Before
const [localQuery, setLocalQuery] = useState('');
const handleQueryChange = useCallback((newQuery: string) => {
  setLocalQuery(newQuery);
}, []);

// After
const form = useForm({ initialValues: { query: '' } });
// No handleQueryChange needed — Autocomplete uses form.getInputProps('query').onChange directly
```

`form.onSubmit` replaces the manual value-extraction in `handleCommit`:

```ts
// Before
const handleCommit = useCallback(() => {
  const trimmedQuery = localQuery.trim();
  if (trimmedQuery) { setIsSearching(true); updateURL(trimmedQuery, activeFields); }
  else { setSearchParams(new URLSearchParams()); }
}, [localQuery, ...]);

// After
const handleCommit = form.onSubmit(({ query }) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery) { setIsSearching(true); updateURL(trimmedQuery, activeFields); }
  else { setSearchParams(new URLSearchParams()); }
});
// localQuery removed from closure dependency — form.values.query accessed directly
```

For suggestion selection (`handleCommitWithQuery`), which does last-word replacement before committing:

```ts
// After — form.setFieldValue then commit
const handleCommitWithQuery = useCallback((query: string) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    form.setFieldValue('query', trimmedQuery);
    setIsSearching(true);
    updateURL(trimmedQuery, activeFields);
  } else {
    form.reset();
    setSearchParams(new URLSearchParams());
  }
}, [activeFields, updateURL, setSearchParams, form]);
```

URL → form sync (browser back/forward) becomes `form.setFieldValue` instead of `setLocalQuery`:

```ts
useEffect(() => {
  const urlQuery = searchParams.get(URL_PARAMS.QUERY) || '';
  form.setFieldValue('query', urlQuery); // was: setLocalQuery(urlQuery)
}, [searchParams]);
```

### What it does NOT manage

- **`activeFields`** — stays Redux-managed. Filter toggles are always immediately committed to the URL; there is no uncommitted filter state. Putting `activeFields` in form state would create a second source of truth with no benefit.
- **`isSearching`** — stays as `useState`. This is UI-only loading state, not form state.
- **`handleToggleField`**, **`handleClear`** — `handleClear` calls `form.reset()` + `setSearchParams(new URLSearchParams())`; `handleToggleField` is unchanged.

### Net code reduction

Modest: ~20 lines removed from `SearchContainer` (eliminates `useState(localQuery)`, `handleQueryChange` useCallback, simplifies the `localQuery` closure in `handleCommit`). The primary value here is learning `@mantine/form`'s API in a real case — not a dramatic simplification.

### Validation

None for now. Add `@mantine/form` validation + a schema library (Zod v4 recommended) when data-entry forms are introduced.

### `@mantine/form` and Mantine `Autocomplete`

Mantine's `getInputProps` returns `(value: string, onChange: (val: string) => void)` — directly compatible with `Autocomplete`'s `onChange` signature. No synthetic event wrapping needed.

```tsx
<Autocomplete
  {...form.getInputProps('query')}
  onOptionSubmit={handleOptionSubmit}
  onKeyDown={handleKeyDown}
  // ...other props
/>
```

---

## Phase 1 — Install and Configure Mantine v9

### 1.1 Configure Copilot instructions

Create `.github/copilot-instructions.md` at the project root so that GitHub Copilot and the agent have persistent context about the stack **before any code changes are made**:

```markdown
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
- Use ARIA roles and `data-testid` for selectors. No `.Mantine*` class selectors.

## Mantine documentation

When uncertain about a Mantine v9 API, fetch the relevant doc page:

- Index: https://mantine.dev/llms.txt
- Full consolidated doc: https://mantine.dev/llms-full.txt
- Per-component: `https://mantine.dev/llms/core-{component-name}.md`
  (e.g. https://mantine.dev/llms/core-autocomplete.md, https://mantine.dev/llms/core-combobox.md)
- `@mantine/form`: https://mantine.dev/llms/form-use-form.md
```

Also update `.github/copilot-instructions.md` whenever a significant architectural decision is made (new library, state pattern change, etc.).

### 1.2 Remove MUI packages

```bash
npm uninstall @mui/material @mui/icons-material @mui/system @emotion/react @emotion/styled
```

Delete the following file (will be recreated in Phase 2):
- `src/theme/theme.ts`

`src/theme/cardStyles.ts` is deleted later — during Phase 3 ResultCard migration, after its styles are moved to `ResultCard.module.css`.

### 1.3 Install Mantine packages

```bash
npm install @mantine/core @mantine/hooks @mantine/form
```

Only `@mantine/core`, `@mantine/hooks`, and `@mantine/form` are required for the current component set. Additional `@mantine/*` packages can be added as needed (date pickers, notifications, etc.).

### 1.4 Install icon library

`@mui/icons-material` is replaced by `@tabler/icons-react` — the most widely-used icon library in the Mantine ecosystem, with 5,000+ icons and full tree-shaking.

```bash
npm install @tabler/icons-react
```

Before touching any components, grep the entire codebase for `@mui/icons-material` and build a complete icon mapping. See the [icon mapping table](#icon-mapping) in Phase 3.

### 1.5 PostCSS setup

Install PostCSS plugins:

```bash
npm install --save-dev postcss postcss-preset-mantine postcss-simple-vars
```

Create `postcss.config.cjs` at the project root:

```js
module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};
```

### 1.6 Import styles and set up `MantineProvider`

In `main.tsx`, replace `ThemeProvider` / `CssVarsProvider` with `MantineProvider`:

```tsx
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme/theme';

root.render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>
);
```

`@mantine/core/styles.css` is a single static CSS file — no Emotion, no runtime CSS injection. It replaces MUI's `CssBaseline` and the Emotion packages entirely.

### 1.7 VS Code setup

Add to `.vscode/settings.json`:

```json
{
  "cssVariables.lookupFiles": [
    "**/*.css",
    "**/*.scss",
    "node_modules/@mantine/core/styles.css"
  ]
}
```

Install VS Code extensions:
- **PostCSS Intellisense and Highlighting** (`vunguyentuan.vscode-postcss`) — syntax highlighting for PostCSS in `.module.css` files
- **CSS Variable Autocomplete** (`vunguyentuan.vscode-css-variables`) — autocomplete for `--mantine-*` CSS variables

### 1.8 Verify Phase 1

The app will fail to compile at this point — components still reference MUI imports. The Phase 1 verification is structural: confirm `postcss.config.cjs` is picked up by Vite, `@mantine/core/styles.css` loads without error, and DevTools shows `--mantine-primary-color` on `:root`. Proceed to Phase 2.

---

## Phase 2 — Theme Migration

### 2.1 Current theme values

The existing MUI theme defines:
- **Primary**: custom grey (`#bdbdbd` main / `#e0e0e0` light / `#9e9e9e` dark / `#212121` contrast text)
- **Secondary**: red/pink (`#dc004e` main)
- **Background**: `#fafafa` default / `#ffffff` paper
- **Buttons**: `textTransform: none` override (no uppercasing)

### 2.2 Mantine colour model

Mantine colours are 10-shade arrays indexed 0–9. The `primaryColor` key identifies which array to use; `primaryShade` picks the shade within it (default: `6` for light scheme, `8` for dark).

Mantine's built-in `gray` is a reasonable starting match for the existing primary palette:

| MUI value | Closest Mantine `gray` shade |
|---|---|
| `#bdbdbd` (main) | `gray[4]` = `#ced4da` |
| `#9e9e9e` (dark) | `gray[6]` = `#868e96` |
| `#e0e0e0` (light) | `gray[2]` = `#e9ecef` |

**Recommendation**: Use `primaryColor: 'gray'` with `primaryShade: 6`. Tune the shade visually during Phase 2. If an exact hex match is required, define a custom 10-shade colour array using `MantineColorsTuple`.

### 2.3 Create new `src/theme/theme.ts`

```ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'gray',
  primaryShade: 6,
  // Mantine buttons don't uppercase text by default — no override needed.
  // The old MUI textTransform: none is already Mantine's default behaviour.

  components: {
    // Add per-component style overrides here as components are migrated.
  },
});
```

### 2.4 Border radius

Mantine v9 changed the default border radius from `sm` (4px in v8) to `md` (8px). Components will appear slightly rounder than the previous MUI defaults. To revert:

```ts
const theme = createTheme({
  defaultRadius: 'sm', // 4px — closer to old MUI default
});
```

Review visually after Phase 2 before deciding.

### 2.5 Font

Mantine's default font stack already includes Roboto: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif`. No change is required to keep Roboto. To make it the explicit primary font:

```ts
const theme = createTheme({
  fontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
});
```

To switch to Inter instead (remove the Roboto Google Fonts `<link>` from `index.html` and add Inter):

```ts
// In index.html replace Google Fonts link with:
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

const theme = createTheme({
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
});
```

Decide on font during Phase 2 — defer to visual preference.

### 2.6 Verify Phase 2

Add a test `<Button>` from `@mantine/core` to `App.tsx`. Confirm:
- Renders with the correct primary grey colour
- `--mantine-color-gray-6` visible in DevTools on `:root`
- No text transform on button label
- Border radius looks acceptable (tune `defaultRadius` if needed)

Remove the test button before Phase 3.

---

## Phase 3 — Component Migration

### Component mapping

| MUI Component | Used in | Mantine Replacement |
|---|---|---|
| `AppBar` + `Toolbar` | `App.tsx` | Sticky `<header>` + `Group` (see note below) |
| `Container` | `App.tsx` | `Container` |
| `Box` | Throughout | Native HTML elements + `Box` (sparingly) |
| `Typography` | Throughout | `Text`, `Title` |
| `Paper` | `SearchBar`, `ObjectDetailPage` | `Paper` |
| `Grid` container | `ObjectDetailPage`, `ObjectDetailSkeleton` | `Grid` |
| `Grid` item | same | `Grid.Col` |
| `Card` | `ResultCard` | `Card` |
| `CardActionArea` | `ResultCard` | Polymorphic `Card component={Link}` + CSS Module hover |
| `CardContent` | `ResultCard` | `Box` inside `Card` |
| `Autocomplete` (freeSolo) | `SearchBar` | `Autocomplete` with custom callbacks (see UX inventory) |
| `TextField` | `SearchBar` | Built into Mantine `Autocomplete` |
| `Checkbox` | `SearchFilters` | `Checkbox` |
| `FormControlLabel` | `SearchFilters` | Not needed — Mantine `Checkbox` has built-in `label` prop |
| `FormGroup` | `SearchFilters` | `Stack` |
| `Accordion` | `SearchFilters` | `Accordion` |
| `Collapse` | `SearchBar` | `Collapse` — note: `expanded` prop, not `in` |
| `Alert` | `ObjectDetailPage`, `SearchResults` | `Alert` |
| `CircularProgress` | `SearchResults` | `Loader` |
| `Skeleton` | `ObjectDetailSkeleton` | `Skeleton` |
| `Badge` (dot indicator) | `SearchBar` | `Indicator` |
| `IconButton` | `SearchBar` | `ActionIcon` |
| `List` + `ListItem` | `ObjectDetailPage` | `List` + `List.Item` |
| `Breadcrumbs` (MUI) | `Breadcrumbs.tsx` | `Breadcrumbs` |

### Icon mapping {#icon-mapping}

Before migrating any component, run:

```bash
grep -r "@mui/icons-material" src/ --include="*.tsx" --include="*.ts" -l
```

Then map each icon to its `@tabler/icons-react` equivalent. Common mappings:

| MUI Icon | Tabler Icons replacement |
|---|---|
| `ErrorOutline` | `IconAlertCircle` |
| `Search` / `SearchOutlined` | `IconSearch` |
| `Clear` / `Close` | `IconX` |
| `FilterList` | `IconFilter` |
| `ExpandMore` | `IconChevronDown` |
| `ExpandLess` | `IconChevronUp` |
| `ArrowBack` | `IconArrowLeft` |
| `Home` | `IconHome` |

### AppBar / Toolbar → sticky `<header>`

Mantine's `AppShell` is a full layout system (header + navbar + aside + footer). For this app's simple top bar, `AppShell` is unnecessary scaffolding.

**Recommendation**: Replace `AppBar`/`Toolbar` with a plain sticky `<header>` styled with Mantine's `Box` and `Group`:

```tsx
<Box
  component="header"
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'var(--mantine-color-body)',
    borderBottom: '1px solid var(--mantine-color-default-border)',
  }}
>
  <Container size="lg">
    <Group h={60} justify="space-between">
      {/* logo + nav links */}
    </Group>
  </Container>
</Box>
```

**Phase 3 plan**: Implement the `<Box component="header">` + `Group` skeleton above — enough to make the app compile and render correctly. Do not spend time polishing it.

**Phase 4 plan**: Replace with a Mantine UI header block — browse [ui.mantine.dev](https://ui.mantine.dev), pick a header, paste the TSX + CSS Module, and delete the Phase 3 interim code.

Revisit `AppShell` if sidebar or drawer navigation is added later.

### `SearchContainer` — `@mantine/form` integration

This is the main site of the `@mantine/form` migration. See the [`@mantine/form` decision section](#decision-mantineform) for the full before/after — summary:

| `SearchContainer` element | Before | After |
|---|---|---|
| Live query value | `useState(localQuery)` | `form.values.query` |
| Keystroke handler | `handleQueryChange` useCallback | Eliminated — `Autocomplete` uses `form.getInputProps('query').onChange` directly |
| Commit handler | reads `localQuery` from closure | `form.onSubmit(({ query }) => ...)` — no closure dependency on live value |
| Suggestion selection | `setLocalQuery()` then `updateURL()` | `form.setFieldValue('query', ...)` then `updateURL()` |
| Clear | `setLocalQuery('')` + `setSearchParams(...)` | `form.reset()` + `setSearchParams(...)` |
| Browser back/forward sync | `setLocalQuery(urlQuery)` in `useEffect` | `form.setFieldValue('query', urlQuery)` in same `useEffect` |
| `activeFields` | Redux selector | **Unchanged** — no uncommitted filter state, Redux stays authoritative |
| `isSearching` | `useState` | **Unchanged** — UI state, not form state |

### `SearchBar` — UX inventory and migration options

The current `SearchBar` is built on MUI `Autocomplete freeSolo`. Before choosing between Mantine `Autocomplete` and `Combobox`, here is a full inventory of every current UX behaviour and how each maps across.

#### Current UX inventory

| Behaviour | How it works now |
|---|---|
| Free-text input | User can type anything; not restricted to suggestion list |
| Suggestions trigger | Only appear after 2+ characters in the last word being typed |
| Last-word suggestion replacement | Selecting a suggestion replaces only the *last word* of a multi-word query — "ancient sto" → select "stones" → "ancient stones", not "stones" |
| Up to 10 suggestions | Supplied by `termsService.getSuggestions`; custom filtering via `filterOptions={(x) => x}` |
| Arrow key navigation | ArrowUp/Down moves through suggestions; tracked via `isNavigatingSuggestionsRef` |
| Enter (no suggestion highlighted) | Commits search; blurs input to dismiss mobile keyboard |
| Enter (suggestion highlighted via arrow keys) | Selects suggestion, replaces last word, commits |
| Escape | Clears query and suggestions |
| Blur | Commits if query differs from committed value; skipped if just committed (double-commit prevention) |
| Double-commit prevention | `justCommittedRef` prevents blur from committing after Enter or suggestion selection |
| Mobile keyboard hint | `enterKeyHint: 'search'` shows "Search" on mobile keyboard |
| Filter toggle button | Inside input adornment; dot badge when non-default fields are active |
| Clear button | Inside input adornment; visible when query is non-empty |
| Keyboard shortcut hints | "Enter to search · Esc to clear" shown on desktop only (user-agent detection) |
| Filter panel | Animated `Collapse` below the input |
| Browser autocomplete off | `autoComplete: 'off'`, `spellCheck: false` |
| Dropdown position | Fixed to `bottom-start` |

#### Mantine `Autocomplete` — API mapping from MUI

Mantine `Autocomplete` is always free-text (no `freeSolo` prop needed).

| Mantine prop/callback | Purpose | MUI equivalent |
|---|---|---|
| `onChange(value)` | Fires on every keystroke | `onInputChange(_, val, 'input')` |
| `onOptionSubmit(value)` | Fires when a suggestion is selected (click or keyboard Enter) | `onChange(_, val, 'selectOption')` |
| `data` | Suggestion list | `options` |
| `filter` | Custom suggestion filtering | `filterOptions` |
| `rightSection` | Custom content after the input (buttons, icons) | `InputProps.endAdornment` |
| `comboboxProps.position` | Dropdown placement | `componentsProps.popper.placement` |
| `inputProps` | Pass-through attributes to `<input>` | `inputProps` |

#### Gap analysis — Mantine `Autocomplete` vs current UX

| Behaviour | Achievable with Mantine `Autocomplete`? | Detail |
|---|---|---|
| Free-text input | ✅ Built-in | Always free-text by default |
| Custom suggestion filtering | ✅ Custom code | Set `filter={() => true}`; control `data` from state (same pattern as now) |
| **Last-word suggestion replacement** | ✅ Custom code | Implement in `onOptionSubmit`: slice query, replace last word, commit |
| **Escape to clear** | ✅ Custom code | `onKeyDown`: Mantine closes the dropdown on Escape but does *not* clear the input — add `if (key === 'Escape') clear()` |
| Enter to commit (free text) | ✅ Custom code | `onKeyDown`: `if (key === 'Enter' && !justCommittedRef.current) commit()` |
| Blur to commit | ❌ **Dropped** | No `onBlur` commit logic in Mantine version |
| Double-commit prevention | ✅ Custom code | `justCommittedRef` pattern ports directly — set in `onOptionSubmit`, checked in `onKeyDown` |
| Arrow key navigation in dropdown | ✅ Built-in | Mantine handles this internally |
| `isNavigatingSuggestionsRef` | ✅ May not be needed | `onOptionSubmit` fires unconditionally for both click and keyboard selection — you may not need to track navigation state separately |
| Filter + clear buttons | ✅ Custom code | Use `rightSection` prop |
| `enterKeyHint`, `autoComplete`, `spellCheck` | ✅ Custom code | Pass via `inputProps` |
| Dropdown position | ✅ Built-in | `comboboxProps={{ position: 'bottom-start' }}` |
| Keyboard shortcut hints (desktop) | ✅ No change | Pure React, no library dependency |
| Filter `Collapse` panel | ✅ Small change | `expanded` prop instead of `in` |

**Every current UX behaviour is achievable with Mantine `Autocomplete`.** Most of the custom logic ports directly — the ref flag pattern, `onKeyDown`, and `onBlur` are application logic, not MUI-specific.

#### Decided: what to keep and what to drop

| Behaviour | Decision | Implementation |
|---|---|---|
| Last-word suggestion replacement | ✅ **Keep** | Custom `onOptionSubmit`: slice query, replace last word, commit |
| Escape to clear | ✅ **Keep** | Custom `onKeyDown`: `if (key === 'Escape') { clear(); setSuggestions([]) }` |
| Blur-to-commit | ❌ **Drop** | Remove `onBlur` commit logic; search fires only on Enter or suggestion selection |

`justCommittedRef` is **not needed** in the Mantine migration — its only purpose was to prevent `handleBlur` from committing after Enter, and `handleBlur` no longer commits. `isNavigatingSuggestionsRef` may also be removable — verify once wired up, since `onOptionSubmit` fires unconditionally for both click and arrow-key+Enter selection.

#### When to escalate to `Combobox`

`Combobox` is the primitive that `Autocomplete` is built on. Use it if:

- `onOptionSubmit` and `onKeyDown` fire in an unexpected order when combining arrow-key navigation with Enter (the double-commit problem resurfaces in a new form)
- You need to suppress the dropdown in specific application states
- Custom option rendering (icons, grouping, highlighting) is needed

The main upside of `Combobox` over `Autocomplete` is owning the full keyboard event loop — `isNavigatingSuggestionsRef` becomes unnecessary because you control exactly when a selection fires. The downside is more boilerplate.

### `Collapse` prop rename (v9 breaking change)

```tsx
// Before (MUI)
<Collapse in={showFilters}>

// After (Mantine v9)
<Collapse expanded={showFilters}>
```

TypeScript will catch this immediately as a compile error since `in` is no longer a valid prop.

### `CardActionArea` → polymorphic `Card`

```tsx
// Before (MUI)
<Card>
  <CardActionArea component={RouterLink} to={url}>
    <CardContent>...</CardContent>
  </CardActionArea>
</Card>

// After (Mantine)
<Card
  component={RouterLink}
  to={url}
  className={classes.card}
  style={{ cursor: 'pointer' }}
>
  ...
</Card>
```

The hover lift animation from `cardStyles.ts` moves to a CSS Module (`ResultCard.module.css`):

```css
.card {
  transition: transform 150ms ease, box-shadow 150ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--mantine-shadow-md);
  }
}
```

Delete `src/theme/cardStyles.ts` once this is done.

### `FormControlLabel` → Mantine `Checkbox` built-in label

```tsx
// Before (MUI)
<FormControlLabel
  control={<Checkbox checked={checked} onChange={onChange} />}
  label="Title"
/>

// After (Mantine)
<Checkbox checked={checked} onChange={onChange} label="Title" />
```

### Migration complexity tiers

#### Tier 1 — Straightforward

| Component | Notes |
|---|---|
| `LoadingIndicator` | `CircularProgress` → `Loader`; layout uses `Stack` |
| `NotFoundPage` | `Typography` → `Title`/`Text`; centering via `Center` + `Stack` |
| `Breadcrumbs` | 1:1 — Mantine `Breadcrumbs` has a very similar API |
| `InvalidObjectPage` | `Alert` 1:1; icon button → `ActionIcon` |
| `Footer` | `Box component="footer"` → `<footer>` + `Group`/`Stack` |
| `KeyboardKey` | Already uses inline styles — straightforward move to CSS Module |
| `ErrorBoundary` | Error colour via `c="red"` style prop on `Text` |

#### Tier 2 — Moderate

| Component | Notes |
|---|---|
| `SearchFilters` | `Accordion` 1:1; `Checkbox` simpler (built-in label); `FormGroup` → `Stack` |
| `ResultCard` | Card API similar; `CardActionArea` pattern changes — see above |
| `ObjectDetailPage` | `Grid`, `Alert`, `List` all have Mantine equivalents |
| `SearchResults` | `Loader` + `Alert` + `Skeleton` — remapping only |
| `ObjectDetailSkeleton` | Mantine `Grid` + `Skeleton` |

#### Tier 3 — Complex

| Component | Notes |
|---|---|
| `SearchBar` | All current UX is achievable with `Autocomplete` + custom callbacks; see UX inventory above. Escalate to `Combobox` only if event ordering causes double-commit issues. |
| `App.tsx` | Header restructure; remove `AppBar`/`Toolbar` |

#### Recommended migration order

Work through the tiers in sequence. Run `npm run test` and `npm run test:e2e` after completing each tier before starting the next.

1. **Tier 1** — knock out the easy components first; confirms the Mantine setup is correct and gives test confidence before the harder work
2. **Tier 2** — `ResultCard` + `SearchResults` should be migrated as a pair (shared grid parent/child relationship); `ObjectDetailPage` + `ObjectDetailSkeleton` similarly
3. **Tier 3** — `SearchBar` last; it has the most custom logic and benefits from having confirmed the rest of the app is stable

### Test changes required alongside component migration

Most tests use ARIA roles and `data-testid` and will be unaffected. The following selectors target MUI-specific class names and **will break** — update in the same commit as the component change.

Before starting Phase 3, run this grep to confirm no new `.Mui` selectors have been added since this list was written:

```bash
grep -rn "\.Mui" src/ e2e/ --include="*.ts" --include="*.tsx"
```

#### Will break — complete list

| Test file | Line | Broken selector | Fix |
|---|---|---|---|
| [SearchBar.test.tsx](src/features/home/SearchBar.test.tsx#L260) | L260–281 | `.MuiCollapse-root`, `.MuiCollapse-hidden` | Add `data-testid="filter-collapse"` to the `Collapse` wrapper; assert visibility via `aria-hidden` or a child element instead of the class |
| [ResultCard.test.tsx](src/components/ResultCard.test.tsx#L76) | L76 | `.MuiCardActionArea-root` | Remove — `CardActionArea` is gone; test the card link via `getByRole('link')` |
| [ResultCard.test.tsx](src/components/ResultCard.test.tsx#L100) | L100 | `.MuiGrid-root` | Add `data-testid="result-card-grid"` to Mantine `Grid`, update test |
| [LoadingIndicator.test.tsx](src/components/LoadingIndicator.test.tsx#L31) | L31 | `.MuiCircularProgress-root` | Replace with Mantine `Loader`; query via `getByRole('status')` or add `data-testid="loading-indicator"` |
| [e2e/object-detail.spec.ts](e2e/object-detail.spec.ts#L157) | L157 | `.MuiPaper-root` | Add `data-testid="metadata-section"` to Mantine `Paper`, update Playwright locator |

#### Conditional — safe only if migrated correctly

| Test file | Line | Selector | Condition |
|---|---|---|---|
| [Footer.test.tsx](src/components/Footer.test.tsx#L28) | L28 | `querySelector('footer')` | Safe if native `<footer>` element is used (not `Box component="footer"`) |
| [KeyboardKey.test.tsx](src/components/KeyboardKey.test.tsx#L12) | L12–13 | `querySelector('kbd')` | Safe if element remains `<kbd>` |
| [e2e/homepage.spec.ts](e2e/homepage.spec.ts#L27) | L27 | `h6:has-text("result")` | Safe if replaced with `<h6>` or `<Title order={6}>` |

#### Icon tests — will break

Any test using `[data-testid="ErrorOutlineIcon"]` or any MUI icon `data-testid` pattern will break when icons are swapped to Tabler. Add explicit `data-testid` props to icons that are tested before removing the MUI icon.

#### Test expansion policy

When migrating a component, also update its test file to:

1. **Remove tests that tested MUI-specific behaviour** (e.g. the `MuiCollapse-hidden` class check — this tested MUI's internals, not the app's intent)
2. **Keep and update tests that tested intent** (e.g. "filters panel is hidden on load", "filters panel is visible after clicking the toggle button") — rewrite the assertion to use a stable selector
3. **Add tests for any Mantine-specific custom behaviour introduced during migration**, for example:
   - `SearchBar`: last-word suggestion replacement (`onOptionSubmit` replaces last word, not full query)
   - `SearchBar`: Escape clears the query (not just the dropdown)
   - Any component that introduces a CSS Module hover/focus state that changes interactive behaviour

The goal is: after migration, each component's test file should cover the same intent as before, plus the new Mantine-specific custom behaviour, with zero `.Mui` class selectors remaining.

#### E2E / Playwright workflow

Run Playwright **continuously against the local dev server** throughout the big bang branch — not just at the end.

```bash
# Terminal 1 — keep running throughout the branch
npm run dev

# Terminal 2 — run after each component batch
npm run test:e2e
```

This catches visual and interaction regressions as each component is migrated, rather than accumulating them until the end. Failures are easier to bisect when the change set is small.

---

## Phase 4 — Mantine UI Blocks

[Mantine UI](https://ui.mantine.dev) is a copy-paste block library. Browse the site, select a block, and copy the TSX + CSS Module into the project. There is no npm package — the code is owned by the project.

### Recommended blocks to evaluate

| Category | Use in this project |
|---|---|
| **Headers** | Replace the Phase 3 interim `<Box component="header">` with a proper block |
| **Footers** | Replace the Phase 3 interim `Footer` with a proper block |
| **Error pages** | `NotFoundPage`, `InvalidObjectPage` — upgrade visuals after Phase 3 migration |
| **Empty states** | No-results state in `SearchResults` |
| **Cards** | Evaluate for `ResultCard` visual design upgrade |
| **Hero sections** | Homepage empty/landing state |

### Notes on using Mantine UI blocks

- Blocks are authored for Mantine v7/v8. Before pasting, review against the [v9 changelog](https://mantine.dev/changelog/9-0-0/) for deprecated props:
  - `Text color="..."` → `Text c="..."` (v9 removed `color` prop on `Text`)
  - `TypographyStylesProvider` → `Typography` (renamed in v9)
  - `Collapse in={...}` → `Collapse expanded={...}` (renamed in v9)
  - `Grid gutter` → `Grid gap` (renamed in v9)
- Blocks typically come with a `.module.css` file — copy it alongside the `.tsx`.
- Most blocks import `@tabler/icons-react` — consistent with Phase 1.

---

## Phase 5 — Clean Up

After all components are migrated and all tests pass:

```bash
npm uninstall @mui/material @mui/icons-material @mui/system @emotion/react @emotion/styled
```

Delete:
- `src/theme/cardStyles.ts` (hover styles moved to `ResultCard.module.css` in Phase 3)

Audit for any remaining MUI/Emotion imports:

```bash
grep -r "@mui\|@emotion" src/ --include="*.tsx" --include="*.ts"
```

Run the full test suite after each batch of component migrations:

```bash
npm run lint
npm run test
npm run test:e2e
```

---

## Confirmed Decisions

| Decision | Choice |
|---|---|
| Mantine version | v9 |
| Migration strategy | Big bang in a feature branch |
| MUI | Completely removed — no coexistence |
| Tailwind | Not used |
| `@mantine/form` | Adopted — manages live `query` value in `SearchContainer`; replaces `useState(localQuery)` + `handleQueryChange`; no validation yet |
| Icon library | `@tabler/icons-react` |
| Mantine UI | Used for copy-paste layout/design blocks |
| Visual design | Mantine defaults + colour palette override |
| Primary colour | Mantine built-in `gray`, `primaryShade: 6` |
| Secondary/accent | Mantine built-in `red` (used via `c` prop on individual components) |
| Border radius | Mantine v9 default `md` (8px) — tune to `sm` if too round |
| Font | Keep Roboto (default Mantine stack) or switch to Inter — decide in Phase 2 |
| CSS approach | CSS Modules for custom styles; Mantine style props for inline overrides |
| AppShell | Not used initially — plain sticky `<header>` or Mantine UI header block |
| Card hover | `ResultCard.module.css` — `translateY` + Mantine shadow CSS variable |
| SearchBar | Mantine `Autocomplete` with custom `onOptionSubmit` (last-word replacement) and `onKeyDown` (Escape to clear). Blur-to-commit dropped. Escalate to `Combobox` only if double-commit resurfaces. |
| `Collapse` prop | `expanded` (not `in`) per Mantine v9 breaking change |
| Test selectors | Replace `.Mui*` class selectors with `data-testid` in same commit as component |
| `@emotion/*` packages | Removed — Mantine uses static CSS |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| SearchBar — last-word replacement | ✅ Kept. Custom `onOptionSubmit` replaces only the last word; same logic as current `onChange`. |
| SearchBar — Escape to clear | ✅ Kept. One-line `onKeyDown` addition; keyboard hint copy is unchanged. |
| SearchBar — blur-to-commit | ❌ Dropped. `onBlur` no longer commits; search fires only on Enter or suggestion selection. Remove `committedQuery` prop comparison from the blur handler. |
| SearchBar — event ordering (`onOptionSubmit` + `onKeyDown`) | If double-commit resurfaces, escalate to `Combobox`. Low probability given `onOptionSubmit` fires unconditionally. |
| Mantine v9 is very fresh (released March 31, 2026) | Pin to `9.0.0`; monitor patch releases; v8.3.x is the stable fallback |
| Single-maintainer project sustainability | Acknowledged long-term risk; consciously accepted |
| Mantine UI blocks authored for v7/v8 | Review each block against v9 changelog before pasting; key v9 changes documented in Phase 4 |
| No `BottomNavigation` equivalent in Mantine | Not currently needed; build from scratch or use community library if required |
| Icon tests reference MUI `data-testid` patterns | Include icon `data-testid` audit at the start of Phase 3 |
| `Collapse` prop renamed `in` → `expanded` | TypeScript catches this at compile time; scoped to `SearchBar` |
| Default border radius changed 4px → 8px | One-line override in theme if visual review (Phase 2) shows it's wrong |
| CSS Modules new to this project | Low risk — Vite supports `.module.css` natively with no configuration |
| `ResultCard` + `SearchResults` share grid parent/child relationship | Migrate both components together as a coordinated pair |
| Mantine v9 requires React 19.2+ | Already satisfied — project is on `react@^19.2.4` |
