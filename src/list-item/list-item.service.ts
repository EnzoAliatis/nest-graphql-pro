import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ListItem } from './entities/list-item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from 'src/lists/entities/list.entity';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput) {
    const { itemId, listId, ...rest } = createListItemInput;

    const listItem = this.listItemRepository.create({
      ...rest,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.listItemRepository.save(listItem);

    return this.findOne(listItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit = 10, offset = 0 } = paginationArgs;
    const { q = '' } = searchArgs;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where('"listId" = :listId', { listId: list.id });

    if (q) {
      queryBuilder.andWhere('LOWER(name) LIKE :q', {
        q: `%${q.toLowerCase()}%`,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemRepository.findOneBy({ id });

    if (!listItem) {
      throw new NotFoundException(`List item #${id} not found`);
    }
    return listItem;
  }

  async update(updateListItemInput: UpdateListItemInput): Promise<ListItem> {
    const { id, listId, itemId, ...rest } = updateListItemInput;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set(rest)
      .where('"id" = :id', { id });

    if (listId) {
      queryBuilder.set({ list: { id: listId } });
    }

    if (itemId) {
      queryBuilder.set({ item: { id: itemId } });
    }

    await queryBuilder.execute();

    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async countByList(list: List): Promise<number> {
    return await this.listItemRepository.count({
      where: { list: { id: list.id } },
    });
  }
}
