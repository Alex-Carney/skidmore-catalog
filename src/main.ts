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
import { TullyGroupModule } from './v1 code/tully-group-resolvers/tully-group.module';
import { TullyEnvironmentModule } from './v1 code/resources/tully-environment/tully-environment.module';
import { TullyCombinedModule } from './v1 code/resources/tully-combined/tully-combined.module';
import { SdssOpticalModule } from './v1 code/resources/sdss-optical/sdss-optical.module';
import { SdssDerivedModule } from './v1 code/resources/sdss-derived/sdss-derived.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { ResourceModule } from './modules/resource/resource.module';
import { useContainer, Validator } from 'class-validator';
import { UserMiddleware } from "./middleware/user.middleware";
import { ValidationPipe } from "@nestjs/common";


declare const module: any


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication> (
    AppModule
    );

  useContainer(app.select(AppModule), { fallbackOnErrors: true})
  // Validation
  app.useGlobalPipes(
    new ValidationPipe(),
  );





  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest');
  const corsConfig = configService.get<CorsConfig>('cors');
  const legacySwaggerConfig = configService.get<SwaggerConfig>('legacy_swagger');
  const v2SwaggerConfig = configService.get<SwaggerConfig>('v2_swagger');



  // Legacy Swagger Api
  if (legacySwaggerConfig.enabled) {
    const legacyOptions = new DocumentBuilder()
      .setTitle(legacySwaggerConfig.title || 'Nestjs')
      .setDescription(legacySwaggerConfig.description || 'The nestjs API description')
      .setVersion(legacySwaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const legacyDocument = SwaggerModule.createDocument(app, legacyOptions, {
      include: [TullyGroupModule, SdssOpticalModule, SdssDerivedModule, TullyEnvironmentModule, TullyCombinedModule],
    });

    const legacyCustomOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        defaultModelsExpandDepth: -1, //schemas wont show up
        syntaxHighlight: {
          activated: false,
          theme: "agate"
        },
        persistAuthorization: true, //users' tokens persist even after refreshing the page
      },
      customSiteTitle: 'Legacy API · Skidmore Catalog',
    };

    SwaggerModule.setup(legacySwaggerConfig.path || 'api', app, legacyDocument, legacyCustomOptions);
  }
  if (v2SwaggerConfig.enabled) {
    const v2Options = new DocumentBuilder()
    .setTitle(v2SwaggerConfig.title || 'Nestjs')
    .setDescription(v2SwaggerConfig.description || 'The nestjs API description')
    .setVersion(v2SwaggerConfig.version || '1.0')
    .addBearerAuth()
    .build();
  const v2Document = SwaggerModule.createDocument(app, v2Options, {
    include: [RepositoryModule, ResourceModule],
  });

  const v2CustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, //schemas wont show up
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

  // V2 Swagger API

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
