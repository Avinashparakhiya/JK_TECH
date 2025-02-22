import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create the NestJS application
    const app = await NestFactory.create(AppModule);

    // Get ConfigService for environment configuration
    const configService = app.get(ConfigService);
    const port = configService.get<number>('SERVER_PORT') || 3000;
    const env = configService.get<string>('NODE_ENV') || 'development';

    await app.listen(port);

    logger.log(`Environment: ${env}`);
    logger.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    const errorMessage = `Failed to start the server: ${error.message}`;
    logger.error(errorMessage, error.stack);
    process.exit(1); // Exit with error code
  }
}

bootstrap();
