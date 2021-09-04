import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import {
  CorsConfig,
  NestConfig,
  SwaggerConfig,
} from './configs/config.interface';
import * as compression from "compression"

declare const module: any


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const swaggerConfig = configService.get<SwaggerConfig>('swagger');



  // Swagger Api
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs')
      .setDescription(swaggerConfig.description || 'The nestjs API description')
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        syntaxHighlight: {
          activated: false,
          theme: "agate"
        },
        persistAuthorization: true, //users' tokens persist even after refreshing the page
      },
      customSiteTitle: 'SEGC API Docs',
    };

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document, customOptions);
  }

  // Cors
  if (corsConfig.enabled) {
    app.enableCors();
  }

 



//------------------- MIDDLEWARE ---------------------------//
  app.use(compression());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

//-----------------------------------------------------



  await app.listen(process.env.PORT || nestConfig.port || 3000);

   // HMR

   if(module.hot) {
     module.hot.accept();
     module.hot.dispose(() => app.close());
   }
}
bootstrap();
