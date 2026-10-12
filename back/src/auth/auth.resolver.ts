import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from '../graphql/inputs/login-user.input';
import { RegisterInput } from '../graphql/inputs/register-user.input'
import { JwtAuthResponse } from './dto/jwt-auth-response.dto';  
import { User } from 'src/user/entities/user.entity';
import { AppUser } from 'src/app-user/entities/app-user.entity';


@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AppUser)
  async register(@Args('input') registerInput: RegisterInput): Promise<AppUser> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => JwtAuthResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<JwtAuthResponse> {
    const user = await this.authService.login(loginInput);
    return {
      accessToken: user.accessToken,  
      refreshToken: user.refreshToken, 
      user: user.user,  
    };
  }
  
  @Query(() => String, { nullable: true })
  dummyQuery(): string {
    return 'dummy';
  }
}
