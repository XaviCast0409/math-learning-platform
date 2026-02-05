import { createServer } from 'http'; // 👈 1. IMPORTANTE: Importamos esto
import app from './app';
import sequelize from './config/database';
import dotenv from 'dotenv';
import './models/index'; 

// 👇 2. Importamos nuestro servicio de Sockets
import SocketService from './services/socket.service';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // 1. Conectar a la BD (Igual que antes)
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente.');

    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con la base de datos.');

    // 2. CREAR EL SERVIDOR HTTP
    // Envolvemos la app de Express en un servidor nativo
    const httpServer = createServer(app);

    // 3. INICIALIZAR SOCKETS
    // Le pasamos el servidor HTTP a nuestra clase SocketService
    SocketService.initialize(httpServer);

    // 4. LEVANTAR EL SERVIDOR
    // ⚠️ OJO: Ahora usamos 'httpServer.listen', NO 'app.listen'
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor (HTTP + Sockets) corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
}

main();