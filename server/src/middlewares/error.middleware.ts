import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Si estamos en desarrollo, queremos ver el stack trace completo
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // En producción, no le mostramos detalles técnicos al usuario
    if (err.isOperational) {
      // Error conocido (ej: "Email duplicado")
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Error de programación (Bug desconocido)
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Algo salió mal en el servidor.'
      });
    }
  }
};