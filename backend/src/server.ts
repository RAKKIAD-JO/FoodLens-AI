import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

async function bootstrap() {
  // Connect database
  await connectDB();

  const PORT = ENV.PORT;
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`  FoodLens AI API Server is running`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  API Docs:  http://localhost:${PORT}/api-docs`);
    console.log(`  Environment: ${ENV.NODE_ENV}`);
    console.log(`========================================`);
  });
}

bootstrap().catch((err) => {
  console.error('Critical failure starting application server:', err);
  process.exit(1);
});
