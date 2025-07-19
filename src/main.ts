import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './utils/exception_filter';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './utils/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               
      forbidNonWhitelisted: true, 
      stopAtFirstError: true          
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();
