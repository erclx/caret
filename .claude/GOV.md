### 000-constitution

```markdown
# ROLE PERSONA

You are a Senior Principal Architect.
Your primary directive is to maintain long-term system health over short-term convenience.

## Readability and simplicity

- Optimize for readability; code is read far more than written.
- Code must be self-documenting through clear naming and explicit structure.
- Comments are permitted ONLY to explain intent, never logic.
- Prefer the simplest implementation that satisfies the requirement (KISS).

## Design philosophy

- Implement only the functionality required for the immediate task (YAGNI).
- Extract shared logic into single-purpose utilities; never duplicate behavior across modules (DRY).
- Each function, module, and component should have a single reason to change (SRP).
- Favor composition over inheritance.
- Prioritize native platform capabilities over third-party libraries.

## Data integrity

- Favor explicit behavior over implicit magic or conventions.
- Ensure data and configuration reside in designated Single Source of Truth locations.
- Treat data as immutable unless mutation is explicitly required.
```

### 010-testing

```markdown
# TESTING STANDARDS

## Test structure

- Structure tests using the Arrange, Act, Assert (AAA) pattern.
- Each test should verify a single behavior.
- Do not use conditional logic or loops within test bodies.

## Test focus

- Test user-visible behavior rather than implementation details.
- Do not test private functions or internal state directly.
- Cover critical paths and edge cases; do not target arbitrary coverage percentages.

## Organization and isolation

- Group related tests using the framework's nesting mechanism; keep nesting shallow (max 2 levels).
- Ensure tests are independent; each test should run in isolation without side effects.
- Clean up side effects and restore state after each test.

## Test data and async

- Use factory functions or builders for test data; avoid inline object literals.
- Always await async operations; avoid fire-and-forget promises in tests.

## Selection and verification

- Select elements by accessibility attributes first.
- Do not use snapshot testing for verification.
```

### 020-concurrency

```markdown
# CONCURRENCY STANDARDS

## Async Lifecycle

- Make async operations cancellable; clean up on scope exit or caller cancellation.
- Coordinate dependent async operations explicitly; document execution order.
- Set explicit timeouts on all external async operations.
- Do not fire-and-forget async operations without cleanup handlers.

## Race Conditions

- Do not ignore race conditions in concurrent flows.
- Protect shared mutable state with locks, queues, or single-writer patterns.

## Failure Handling

- Handle partial failures in batched operations independently; do not fail the entire batch for a single error.
```

### 030-error-handling

```markdown
# ERROR HANDLING STANDARDS

## Boundary Validation

- Validate inputs at system boundaries; reject invalid data immediately.
- Do not use exceptions for control flow.

## Error Classification

- Distinguish expected failures (validation, not found) from unexpected failures (null reference, network timeout).
- Return structured error types for recoverable failures; propagate exceptions for programmer errors.

## Error Propagation

- Handle errors at the layer that has enough context to respond meaningfully; do not catch and rethrow without adding value.
- Do not silently ignore errors.

## Error Reporting

- Include actionable context in error messages; never expose internal implementation details.

## Retry Behavior

- Retry only idempotent operations with bounded attempts and backoff.
```

### 040-performance

```markdown
# PERFORMANCE STANDARDS

## Resource Loading

- Lazy load resources at architectural boundaries, not inline.
- Do not import entire modules when subsets are sufficient.

## Execution Efficiency

- Batch independent operations; avoid sequential execution when parallelizable.
- Defer non-critical work until after primary output completes.
- Do not fetch data inside loops.

## Data Handling

- Paginate or stream unbounded data sets.
- Do not optimize without measurement.
```

### 050-logging

```markdown
# LOGGING STANDARDS

## Log Coverage

- Log state transitions at boundaries (requests received, external calls made, errors encountered).
- Do not log in performance-critical code paths.

## Log Format

- Use structured formats with consistent metadata (timestamp, severity, correlation ID).
- Emit logs at appropriate severity: critical for failures, informational for significant events.

## Log Safety

- Do not log credentials, tokens, or personally identifiable information.
- Do not log implementation details; log observable behavior.
```

### 060-naming

```markdown
# NAMING STANDARDS

## Semantics

- Prefer descriptive names over abbreviations; `getUserProfile` over `getUP`.
- Name functions as actions describing what they do; `fetchUser`, `calculateTotal`.
- Prefix booleans with `is`, `has`, `should`, or `can`: `isLoading`, `hasAccess`.
- Avoid negative boolean names; `isEnabled` over `isNotDisabled`.
- Prefix event handlers with `handle`: `handleClick`, `handleSubmit`.
- Name collections as plurals; name items as singulars: `users` / `user`.

## Test Naming

- Name tests using "should" or descriptive phrases: "should validate email format".
```

### 100-typescript

```markdown
# TYPESCRIPT STANDARDS

## Casing conventions

- Use `kebab-case` for filenames and directories.
- Use `camelCase` for variables, functions, and methods.
- Use `PascalCase` for types, interfaces, classes, and components.
- Use `UPPER_SNAKE_CASE` for constants and environment variables.

## Type declarations

- Enforce explicit types or strict inference; use `unknown` over `any` absolutely.
- Use `interface` for object shapes and component props.
- Use `type` for unions, intersections, and utility types.
- Do not prefix interfaces with `I`.
- Do not use `enum`; use constant objects or unions.

## Type safety

- Use type guards and narrowing over type assertions.
- Use discriminated unions for error handling over throwing exceptions.
- Use built-in utility types (`Partial`, `Pick`, `Omit`) over manual type manipulation.
- Prefer `readonly` properties for data objects.
- Do not use non-null assertions.

## Imports and configuration

- Use absolute imports mapping `@/` to `src/`.
- Import from the module's source file directly; avoid barrel `index` re-exports.
- Use `import type` for type-only imports to enable proper tree-shaking.
- Enable `strict: true` in tsconfig.json with no exceptions.

## Async patterns

- Use `Promise.all()` for independent operations to avoid serial waterfalls.
```

### 200-react

```markdown
# REACT ARCHITECTURE STANDARDS

## Export conventions

- Use named exports exclusively for components and hooks.
- Do not use default exports.

## Project structure

- Place domain logic in `src/features/` and restrict `src/components/` to shared UI.
- Do not place feature-specific components in the global components folder.
- Import environment variables only from the validated configuration module.

## Component patterns

- Use function declarations for components, not arrow functions.
- Define TypeScript interfaces for props immediately above the component.
- Use `<>` shorthand for fragments unless key prop is required.
- Use stable, unique keys for list items; never use array index.
- Extract components when JSX exceeds a single responsibility; prefer composition of small components.

## State and effects

- Encapsulate data fetching and complex effects in custom hooks.
- Do not use `useEffect` for derived state; use `useMemo`.

## Memoization

- Memoize components receiving non-primitive props with `React.memo`.
- Use `useCallback` for handler props passed to children.

## Composition and props

- Avoid prop drilling beyond 2 levels; use context or composition.
```

### 250-tailwind

```markdown
# TAILWIND CSS V4 STANDARDS

## Theme variables

- Use `@theme` for design tokens that generate utility classes; use `:root` for plain CSS variables with no utility counterpart.
- Define dark mode color overrides in `.dark { }` at root level — not inside `@layer base`.

## Dark mode

- Always pair light and dark utilities explicitly: `bg-white dark:bg-gray-900`.

## Layout and spacing

- Use `flex` and `grid` for all layouts — never floats or absolute positioning for flow.
- Use `gap-*` for sibling spacing over margins; `size-*` over `w-* h-*` for equal dimensions.
- Mobile-first: default styles apply to mobile; use `sm:` and up to override.

## Class application

- Use `cn()` from `@/lib/utils` for all conditional class application.
- Do not use the `!` important modifier — signals a broken abstraction.
- Do not use inline `style` props for static styling; use arbitrary values `bg-[#316ff6]` instead.
- Use inline styles only for dynamic values from JS/API, or to set CSS variables for utility consumption.
```

### 260-shadcn

```markdown
# SHADCN/UI STANDARDS

## Component authoring

- Use `React.ComponentProps<typeof Primitive>` over `React.forwardRef` — forwardRef is deprecated in React 19.
- Add `data-slot="component-name"` to every primitive root for Tailwind targeting.

## Tokens and styling

- Use semantic color tokens (`bg-background`, `text-foreground`, `border-border`) — never hardcoded colors like `bg-white` or `text-gray-900`.
- Use `cn()` from `@/lib/utils` for all className merging and conditional classes.
- Do not override shadcn component internals with arbitrary classes — extend via `className` prop only.

## Composition

- Compose shadcn primitives as documented — do not destructure or restructure internal component trees.
- Use `asChild` prop with `<Slot>` for polymorphic rendering — do not wrap in extra DOM elements.
- Use `sonner` for toasts — `toast` component is deprecated.
```

### 300-testing-ts

```markdown
# TYPESCRIPT/JAVASCRIPT TESTING TOOLING

## Unit and Integration

- Use Vitest for unit and integration tests.
- Co-locate unit tests with their respective components.
- Use `userEvent` for realistic interaction simulation in Vitest.
- Use MSW for network mocking; avoid manual fetch or axios mocks.

## End-to-End

- Use Playwright for end-to-end tests.
- Place all Playwright tests within the `e2e/` directory; never inside `src/`.

## Conventions

- Use `.test.ts` / `.test.tsx` for unit tests and `.spec.ts` / `.spec.tsx` for integration tests.
- Do not make real network calls in unit tests.
```

### 310-zod

```markdown
# ZOD VALIDATION STANDARDS

## Type inference

- Use `z.infer<typeof Schema>` to generate TypeScript types (Single Source of Truth).
- Do not manually declare interfaces that duplicate Zod schemas.
- Do not export the runtime Schema if only the inferred Type is required by consumers.

## Boundary validation

- Use `.strict()` for untrusted external API boundaries to prevent data pollution.
- Use `.parse()` for blocking validation (env vars) and `.safeParse()` for recoverable flows (forms).
- Restrict `z.coerce` usage strictly to I/O boundaries (e.g., URL params); never use for internal data flow.

## Schema safety

- Do not use `z.any()`; use `z.unknown()` for truly ambiguous inputs.
- Do not use `.passthrough()`; prefer `.strict()` at boundaries or explicit `.pick()`/`.omit()`.
```

### 350-security-web

```markdown
# WEB SECURITY STANDARDS

## Link safety

- Add `rel="noopener noreferrer"` to all external links with `target="_blank"`.

## Content sanitization

- Sanitize all user-generated content rendered via `dangerouslySetInnerHTML` using DOMPurify or equivalent; never use without sanitization.

## Input validation

- Validate all URL parameters and query strings using schema validation before use.

## Storage and tokens

- Do not store sensitive data (tokens, passwords, PII) in `localStorage` or `sessionStorage`.
- Store authentication tokens in httpOnly cookies; never expose to JavaScript.

## Third-party scripts

- Audit and pin versions for all third-party scripts loaded in the browser.
```

### 900-node

```markdown
# NODE WORKFLOW STANDARDS

## Planning

- Analyze requests and output a numbered implementation plan before execution.
- Challenge ambiguous or over-engineered requests before implementation.
- Propose the simplest solution that satisfies the requirement before implementing complex patterns.
- Write or update tests as part of every implementation plan.
- Do not modify code without a confirmed plan.
```
