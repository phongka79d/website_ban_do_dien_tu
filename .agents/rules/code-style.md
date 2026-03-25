# Code Style Standards

## Language & Syntax
- Modern ES6+ syntax. No var, no legacy patterns.
- Functional programming preferred. Pure functions, immutability, composition.
- Avoid classes unless framework requires them (e.g., Error subclasses).

## Naming
- Descriptive names. No abbreviations unless universally known (id, url, api).
- Functions: verb + noun (`fetchUserData`, `calculateTotal`).
- Booleans: prefix with is/has/should (`isActive`, `hasPermission`).
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`).
- Files/folders: kebab-case (`user-service.ts`, `auth-utils.ts`).

## SOLID Principles
- **S** - One function/module does one thing.
- **O** - Extend behavior without modifying existing code.
- **L** - Subtypes must be substitutable for their base types.
- **I** - Small, focused interfaces. No god objects.
- **D** - Depend on abstractions, not implementations.

## JSDoc
- Every exported function and component must have JSDoc.
- Include: purpose, @param, @returns (or @props for components).

```javascript
/**
 * Fetch user by ID from the database.
 * @param {string} userId - The unique user identifier.
 * @returns {Promise<User | null>} The user object or null if not found.
 */
async function fetchUserById(userId) { ... }