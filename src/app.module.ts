import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AuthModule } from './resolvers/auth/auth.module';
import { UserModule } from './resolvers/user/user.module';
import { PostModule } from './resolvers/post/post.module';
import { AppResolver } from './resolvers/app.resolver';
import { DateScalar } from './common/scalars/date.scalar';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './configs/config';
import { GraphqlConfig, ThrottlerConfig } from './configs/config.interface';
import { TullyGroupModule } from './resolvers/tully-group/tully-group.module';
import { APP_GUARD } from '@nestjs/core';
import { SdssOpticalModule } from './resources/sdss-optical/sdss-optical.module';
import { SdssDerivedModule } from './resources/sdss-derived/sdss-derived.module';
import { TullyEnvironmentModule } from './resources/tully-environment/tully-environment.module';
import { TullyCombinedModule } from './resources/tully-combined/tully-combined.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    GraphQLModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const graphqlConfig = configService.get<GraphqlConfig>('graphql');
        return {
          installSubscriptionHandlers: true,
          buildSchemaOptions: {
            numberScalarMode: 'integer',
          },
          sortSchema: graphqlConfig.sortSchema,
          autoSchemaFile:
            graphqlConfig.schemaDestination || './src/schema.graphql',
          debug: graphqlConfig.debug,
          playground: graphqlConfig.playgroundEnabled,
          context: ({ req }) => ({ req }),
        };
      },
      inject: [ConfigService],
    }), //all of that was for GraphQLModule
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
    UserModule,
    PostModule,
    TullyGroupModule,
    SdssOpticalModule,
    SdssDerivedModule,
    TullyEnvironmentModule,
    TullyCombinedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver, 
    DateScalar,
    {
      //this is how we register a GLOBAL provider. We want the ThrottlerGuard to be applied to every endpoint
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
