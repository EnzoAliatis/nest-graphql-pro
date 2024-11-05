import { registerEnumType } from '@nestjs/graphql';

export enum ValidRoles {
  admin = 'admin',
  user = 'user',
  superAdmin = 'superAdmin',
}

registerEnumType(ValidRoles, { name: 'ValidRoles' });
