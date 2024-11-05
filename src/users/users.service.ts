import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Repository, ArrayContains } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SignupInput } from 'src/auth/dto/signup.input';

// import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private logger: Logger = new Logger();

  async create(signupInput: SignupInput) {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) {
      return await this.userRepository.find({
        // relations: {
        //   lastUpdateBy: true,
        // },
        //  No es necesario por que tenemos lazy en el entity
      });
    }

    const users = await this.userRepository.find({
      where: {
        roles: ArrayContains(roles),
      },
    });
    return users;
  }

  async findOne(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ id });
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneByOrFail({ email });
    } catch (error) {
      this.logger.error(error);
      this.handleDBError({
        code: '23505',
        detail: 'Email not found',
      });
    }
  }

  async update(
    updateUserInput: UpdateUserInput,
    adminUser: User,
  ): Promise<User> {
    let user = await this.findOne(updateUserInput.id);

    user = {
      ...user,
      ...updateUserInput,
      lastUpdateBy: adminUser,
    };

    return await this.userRepository.save(user);
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOne(id);

    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;

    return await this.userRepository.save(userToBlock);
  }

  private handleDBError(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Check server logs');
  }
}
