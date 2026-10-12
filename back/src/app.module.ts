import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RideModule } from './ride/ride.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { AppUserModule } from './app-user/app-user.module';
import { AdminModule } from './admin/admin.module';
import { AppUserRideModule } from './app-user-ride/app-user-ride.module';
import { ReviewModule } from './review/review.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GraphqlModule } from './graphql/graphql.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import {EventStreamModule } from './SSE/sse.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { JoinRequestModule } from './join-request/join-request.module';
import {ReportModule} from "src/report/report.module";
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ChatGateway } from './chat/chat.gateway';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port:configService.get<number>('DB_PORT', 3306),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: true,
          autoLoadEntities: true,
        };
      },
    }),
      AuthModule,
      
      RideModule,
      PostModule,
      CommentModule,
      MessageModule,
      ChatModule,
      ReviewModule,
      UserModule,
      AppUserModule,
      AdminModule,
      AppUserRideModule,
      EventStreamModule,
      SubscriptionModule,
      JoinRequestModule,
      ReportModule,
      GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/graphql/schema.gql'),
      installSubscriptionHandlers: true,
      /*subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true
      },*/
    }),
        
      RideModule, PostModule, 
      CommentModule, MessageModule, ChatModule, ReviewModule, UserModule, AppUserModule, AdminModule, AppUserRideModule, 
      ReviewModule,EventStreamModule,SubscriptionModule, JoinRequestModule,MessageModule, NotificationModule],
  
     
     
        controllers: [AppController],
        providers: [AppService, JwtStrategy],
})
export class AppModule {}
