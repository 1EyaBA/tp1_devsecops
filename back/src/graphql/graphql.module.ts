import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from '../auth/auth.module';
import { AppUserModule } from '../app-user/app-user.module';
import { RideModule } from '../ride/ride.module';
import { PostModule } from '../post/post.module';
import { ReviewModule } from '../review/review.module';
import { ReportModule } from '../report/report.module';
import { CommentModule } from '../comment/comment.module';

import { AuthResolver } from 'src/auth/auth.resolver';
import { DashboardResolver } from 'src/dashboard/dashboard.resolver';
import { ReviewResolver } from 'src/review/review.resolver';


@Module({
  imports: [
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      playground: true,
      context: ({ req }) => ({
        user: req.user,
      }),
      introspection: true,
      debug: true,
      path: '/graphql',
    }),
    AuthModule,
    AppUserModule,
    RideModule,
    PostModule,
    ReviewModule,
    ReportModule,
    CommentModule,
  ],
  providers: [AuthResolver, DashboardResolver],
})
export class GraphqlModule {}
