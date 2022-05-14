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
import { RepositoryModule } from './modules/repository/repository.module';
import { ResourceModule } from './modules/resource/resource.module';
import { Logger } from "@nestjs/common";
import { AccountModule } from "./modules/account/account.module";

declare const module: any

/**
 * Entry point for the program
 * Creates the app, registers all config services, sets up swagger, establishes middleware
 * @author Starter Project, edited by Alex Carney
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication> (AppModule, {
      bufferLogs: true,
    });
  // app.useLogger(app.get(Logger))

  // Configuration setup
  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const v2SwaggerConfig = configService.get<SwaggerConfig>('v2_swagger');

  // Swagger setup (GUI for API)
  if (v2SwaggerConfig.enabled) {
    const v2Options = new DocumentBuilder()
    .setTitle(v2SwaggerConfig.title || 'Nestjs')
    .setDescription(v2SwaggerConfig.description || 'The nestjs API description')
    .setVersion(v2SwaggerConfig.version || '1.0')
    .addBearerAuth()
    .build();
  const v2Document = SwaggerModule.createDocument(app, v2Options, {
    include: [AccountModule, RepositoryModule, ResourceModule],
  });

  const v2CustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, //schemas wont show up
      // syntax highlight caused browser to crash on large queries. This was the first of my major roadblocks
      syntaxHighlight: {
        activated: false,
        theme: "agate"
      },
      persistAuthorization: true, //users' tokens persist even after refreshing the page
    },
    customSiteTitle: 'API · Skidmore Catalog',
  };
  SwaggerModule.setup(v2SwaggerConfig.path || 'api', app, v2Document, v2CustomOptions);
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
