# Frontend Error Handling Governance

This document describes the standard pattern used in this frontend app for normalizing errors and showing user-friendly messages.

## Key concepts

- Use `normalizeError(error)` to convert any thrown error into a structured `AppError`.
- Use `getApiErrorMessage(error)` for display strings in UI components.
- Preserve HTTP status and optional payload details while avoiding unsafe raw object rendering.

## Files

- `src/lib/errors/app-error.ts`
- `src/lib/errors/normalize-error.ts`
- `src/lib/api/errors.ts`

## Example

```ts
try {
  await apiCall();
} catch (error) {
  const displayMessage = getApiErrorMessage(error);
  toast.error(displayMessage);
}
```
