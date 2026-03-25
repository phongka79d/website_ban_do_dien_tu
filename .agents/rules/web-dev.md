# Web Development Standards

## SEO
- Every page must have metadata: title, description, og:image (when applicable).
- Use semantic URLs. No query strings for primary navigation.
- Add structured data (JSON-LD) for content-heavy pages.
- Ensure pages are server-rendered or statically generated for crawlability.

## Accessibility (a11y)
- Use semantic HTML elements: nav, main, header, section, article, aside.
- All images must have alt text.
- Interactive elements must be keyboard accessible.
- Use aria attributes only when semantic HTML is insufficient.
- Maintain color contrast ratio >= 4.5:1 for text.

## Component Architecture
- Component-driven development. Small, focused, reusable.
- One component per file. Name matches filename.
- Props: minimal, well-typed, documented with JSDoc/@props.
- Avoid prop drilling. Use context or state management when depth > 2.

## Async & Error Handling
- All async functions must have try/catch or .catch().
- Show user-facing error states (not blank screens).
- Use error boundaries for component trees (React/Next.js).
- Log errors with enough context to debug (function name, input, error message).

## Performance Basics
- Lazy load images and heavy components.
- Minimize bundle size. Tree-shake unused imports.
- Use appropriate caching headers for static assets.
- Measure Core Web Vitals. Optimize LCP, FID, CLS.