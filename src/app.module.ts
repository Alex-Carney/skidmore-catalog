import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './modules/authentication/auth.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configs/config';
import { ThrottlerConfig } from './configs/config.interface';
import { APP_GUARD } from '@nestjs/core';
import { ResourceModule } from './modules/resource/resource.module';
import { AccountModule } from "./modules/account/account.module";

/**
 * App Module wraps all sub modules together, along with Configuration and Throttling.
 * App Module also handles the App Controller, which controls routes outside the general API (logging in etc)
 */
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
    ResourceModule,
    AccountModule
  ],
  controllers: [AppController],
  providers: [
    {
      //this is how we register a GLOBAL provider. We want the ThrottlerGuard to be applied to every endpoint
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
