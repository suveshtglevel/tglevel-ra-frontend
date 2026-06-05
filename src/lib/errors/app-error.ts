export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}
