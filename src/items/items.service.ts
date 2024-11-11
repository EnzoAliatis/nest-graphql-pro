import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const item = this.itemRepository.create({
      ...createItemInput,
      user,
    });

    return await this.itemRepository.save(item);
  }

  async findAll(
    user: User,
    paginationArgs?: PaginationArgs,
    searchArgs?: SearchArgs,
  ): Promise<Item[]> {
    const { limit = 10, offset = 0 } = paginationArgs;
    const { q = '' } = searchArgs;

    const queryBuilder = this.itemRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"userId" = :userId', { userId: user.id });

    if (q) {
      queryBuilder.andWhere('LOWER(name) LIKE :q', {
        q: `%${q.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }

    return item;
  }

  async update(updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    await this.findOne(updateItemInput.id, user);

    const item = await this.itemRepository.preload(updateItemInput);

    if (!item) {
      throw new NotFoundException(`Item #${updateItemInput.id} not found`);
    }

    return await this.itemRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: soft delete, integridad referencial

    const item = await this.findOne(id, user);

    await this.itemRepository.delete(id);

    return item;
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
