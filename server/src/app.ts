import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/api.routes';
import AppError from './utils/AppError';
import { globalErrorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.use('/api', apiRoutes);

// 404 - Manejo de rutas no encontradas
// CAMBIO APLICADO AQUÍ 👇
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
});

// Middleware Global de Errores
app.use(globalErrorHandler);

export default app;