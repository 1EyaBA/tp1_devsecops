import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role } from 'src/enums/role';
import { AppUser } from "src/app-user/entities/app-user.entity";



registerEnumType(Role, {
  name: "Role",
});

@ObjectType()
export class AppUserWithRole extends AppUser {
  @Field(() => Role)
  roleInRide: Role;

  constructor(user: Partial<AppUser>, role: Role) {
    super();
    Object.assign(this, user);
    this.roleInRide = role;
  }
}
