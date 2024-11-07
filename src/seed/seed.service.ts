import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    private readonly itemsService: ItemsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly usersService: UsersService,
  ) {
    this.isProd = this.configService.get('STAGE') === 'prod';
  }

  private async deleteData() {
    await this.itemRepository.delete({});
    await this.userRepository.delete({});
  }

  private async loadUsers() {
    for (const user of SEED_USERS) {
      await this.usersService.create(user);
    }
  }

  private async loadItems() {
    const users = await this.usersService.findAll([]);

    for (const item of SEED_ITEMS) {
      const random = Math.floor(Math.random() * users.length);

      await this.itemsService.create(item, users[random]);
    }
  }

  async runSeed(): Promise<boolean> {
    if (this.isProd) {
      throw new UnauthorizedException(
        'You are not allowed to run seed in production',
      );
    }
    try {
      await this.deleteData();
      await this.loadUsers();
      await this.loadItems();
    } catch (error) {
      console.log('Errorrr -->', error);
    }

    return true;
  }
}
