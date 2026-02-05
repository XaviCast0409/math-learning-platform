import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASS;
const dbPort = Number(process.env.DB_PORT) || 5432;

// Opciones base de configuración
const config: Options = {
  host: dbHost,
  dialect: 'postgres',
  port: dbPort,
  // En desarrollo (dev) queremos ver el SQL para corregir errores. 
  // En producción ponemos false para no ensuciar los logs.
  logging: process.env.NODE_ENV === 'development' ? false : console.log,
  
  // Configuración del Pool de conexiones (Rendimiento)
  pool: {
    max: 5,     // Máximo de conexiones abiertas
    min: 0,     // Mínimo
    acquire: 30000, // Tiempo máximo para intentar conectar antes de dar error
    idle: 10000     // Tiempo para cerrar conexión si no se usa
  },
  
  // IMPORTANTE: Configuración SSL para Producción (Railway/Render/Neon)
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false // Necesario para algunas nubes que usan certificados self-signed
    }
  } : {}
};

const sequelize = new Sequelize(dbName, dbUser, dbPassword, config);

export default sequelize;