export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };

  static ok<T>(data: T, meta?: Record<string, unknown>): ApiResponseDto<T> {
    return { success: true, data, meta };
  }

  static fail<T>(
    code: number,
    message: string,
    details?: unknown,
  ): ApiResponseDto<T> {
    return { success: false, error: { code, message, details } };
  }
}
