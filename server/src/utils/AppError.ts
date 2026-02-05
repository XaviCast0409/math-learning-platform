// src/utils/AppError.ts
class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // isOperational = true significa que es un error controlado (ej: usuario duplicado)
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;