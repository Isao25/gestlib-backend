import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Autenticación global
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
