import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { readFileSync, writeFileSync } from 'fs';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/exceptions/all-exception.filter';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  dotenv.config(); // Loads .env file


  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configureService = new ConfigService();
  const logger = new Logger("Main File");

  const appRunningPort = configureService.get<number>('PORT');
  const dbURL = configureService.get<string>('DATABASE_URL');

  logger.log(`Running port ${appRunningPort}`);
  logger.log(`Database URL: ${dbURL}`);


  const dbProvider = process.env.DB_PROVIDER;
  const dbHost = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;
  const dbPort = process.env.DB_PORT;
  const dbUsername = process.env.DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD;

  const databaseUrl = `${dbProvider}://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`; // db url concatenation
  logger.log(`Database URL: ${databaseUrl}`);

  const dotEnvFilePath = configureService.get<string>('DOT_ENV_FILE_PATH');

  if (!dotEnvFilePath) {
    throw new Error('DOT_ENV_FILE_PATH is not defined');
  }

  const dotEnvFileData = readFileSync(dotEnvFilePath, 'utf-8');
  logger.log(`Dotenv file path: ${dotEnvFilePath}`);

  const updatedEnvFileData = dotEnvFileData.replace(`DATABASE_URL=""`, `DATABASE_URL="${databaseUrl}"`);

  writeFileSync(dotEnvFilePath, updatedEnvFileData, 'utf-8');
  writeFileSync(".env", updatedEnvFileData, 'utf-8'); // for prisma


  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use('/downloads', express.static(path.join(process.cwd(), 'downloads')));


  await app.listen(appRunningPort || 3000);
}
bootstrap();
