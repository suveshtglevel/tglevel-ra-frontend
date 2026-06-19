// Shared shapes for backend responses. Keep these aligned with the API contract
// so every typed request/response flows through one source of truth.

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  // Field-level validation errors, keyed by form field name.
  errors?: Record<string, string[]>;
}
