import {
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';

@Catch(HttpException)
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse() as any;

    const message = response.message || 'An error occurred';

    switch (status) {
      case 404:
        return new ApolloError(message, 'NOT_FOUND');
      case 403:
        return new ApolloError(message, 'FORBIDDEN');
      case 401:
        return new ApolloError(message, 'UNAUTHENTICATED');
      default:
        return new ApolloError(message, 'INTERNAL_SERVER_ERROR');
    }
  }
}
