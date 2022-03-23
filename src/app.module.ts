import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from './resolvers/auth/auth.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configs/config';
import { ThrottlerConfig } from './configs/config.interface';
import { TullyGroupModule } from './v1 code/tully-group-resolvers/tully-group.module';
import { APP_GUARD } from '@nestjs/core';
import { SdssOpticalModule } from './v1 code/resources/sdss-optical/sdss-optical.module';
import { SdssDerivedModule } from './v1 code/resources/sdss-derived/sdss-derived.module';
import { TullyEnvironmentModule } from './v1 code/resources/tully-environment/tully-environment.module';
import { TullyCombinedModule } from './v1 code/resources/tully-combined/tully-combined.module';
import { ResourceModule } from './modules/resource/resource.module';
//import { RoleModule } from './resolvers/role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const throttlerConfig = configService.get<ThrottlerConfig>('throttler');
        return {
          ttl: throttlerConfig.throttleTTL,
          limit: throttlerConfig.throttleLimit,
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    RepositoryModule,
    //RoleModule,
    ResourceModule,
    TullyGroupModule,
    SdssOpticalModule,
    SdssDerivedModule,
    TullyEnvironmentModule,
    TullyCombinedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      //this is how we register a GLOBAL provider. We want the ThrottlerGuard to be applied to every endpoint
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
