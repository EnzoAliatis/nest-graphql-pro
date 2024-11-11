import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly ListItemService: ListItemService,
  ) {
    this.isProd = this.configService.get('STAGE') === 'prod';
  }

  private async deleteData() {
    await this.listItemRepository.delete({});
    await this.listRepository.delete({});
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

  private async loadLists(): Promise<List[]> {
    const users = await this.usersService.findAll([]);
    const lists = [];

    for await (const list of SEED_LISTS) {
      const random = Math.floor(Math.random() * users.length);
      const listEntity = await this.listsService.create(list, users[random]);
      lists.push(listEntity);
    }

    return lists;
  }

  private async loadListItems() {
    const users = await this.usersService.findAll([]);
    const lists = await this.listRepository.find();
    const items = await this.itemsService.findAll(
      users[0],
      {
        limit: 15,
        offset: 0,
      },
      {
        q: '',
      },
    );

    for (const item of items) {
      const randomList = Math.floor(Math.random() * lists.length);

      await this.ListItemService.create({
        quantity: Math.round(Math.random() * 10),
        completed: !!Math.round(Math.random() * 1),
        listId: lists[randomList].id,
        itemId: item.id,
      });
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
      // console.log('Data deleted');

      await this.loadUsers();
      // console.log('Users loaded');

      await this.loadItems();
      // console.log('Items loaded');

      await this.loadLists();
      // console.log('Lists loaded');

      await this.loadListItems();
    } catch (error) {
      console.log('Errorrr -->', error);
    }

    return true;
  }
}
