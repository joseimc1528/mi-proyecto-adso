import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabases, disconnectDatabases } from './config/db.js';

async function bootstrap() {
  await connectDatabases();

  const server = app.listen(config.port, () => {
    console.log(`🚀 Servidor activo en: http://localhost:${config.port}`);
  });

  let isShuttingDown = false;
  const handleShutdown = (signal) => {
    if (isShuttingDown) return;       // Evita doble cierre con Ctrl+C repetido
    isShuttingDown = true;
    console.log(`\n⚠️  ${signal} recibido. Cerrando conexiones limpiamente...`);

    // Si algo se cuelga, forzar la salida a los 10 s
    setTimeout(() => process.exit(1), 10000).unref();

    server.close(async () => {
      await disconnectDatabases();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

bootstrap();