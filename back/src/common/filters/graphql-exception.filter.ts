import {
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

// Remplace ApolloError (apollo-server-express, abandonné et vulnérable) : même message, même extensions.code
const gqlError = (message: string, code: string) =>
  new GraphQLError(message, { extensions: { code } });

@Catch(HttpException)
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse() as any;

    const message = response.message || 'An error occurred';

    switch (status) {
      case 404:
        return gqlError(message, 'NOT_FOUND');
      case 403:
        return gqlError(message, 'FORBIDDEN');
      case 401:
        return gqlError(message, 'UNAUTHENTICATED');
      default:
        return gqlError(message, 'INTERNAL_SERVER_ERROR');
    }
  }
}
