import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';

import { AuthResponse } from './types/auth-response.type';
import { LoginInput, SignupInput } from './dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    console.log(signupInput);

    const user = await this.usersService.create(signupInput);

    const token = this.jwtService.sign({ id: user.id });

    return {
      token,
      user,
    };
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: user.id });

    return {
      user,
      token,
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOne(id);

    if (!user.isActive) {
      throw new UnauthorizedException('User is not active, talk with an admin');
    }

    delete user.password;

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    console.log('hollaa');
    const token = this.jwtService.sign({ id: user.id });

    return {
      user,
      token,
    };
  }
}
