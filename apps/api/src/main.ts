import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  // Behind Fly.io's edge proxy (and most platforms). Trusting the FIRST proxy
  // hop lets req.ip return the real client IP — required for the M-Pesa
  // callback IP allowlist.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const port = Number(process.env.PORT ?? 4000);
  const prefix = process.env.API_GLOBAL_PREFIX ?? 'api';
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? [];

  if (isProd && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be set in production.');
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    // In dev, fall back to allowing all origins; in prod we hard-fail above.
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const configService = app.get(ConfigService);
  app.useGlobalInterceptors(
    new LoggingInterceptor(configService),
    new TransformInterceptor()
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Qreative Spaces API')
    .setDescription('Inclusive venues platform — REST API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/${prefix}`);
  logger.log(`Swagger docs: http://localhost:${port}/${prefix}/docs`);
}

void bootstrap();
