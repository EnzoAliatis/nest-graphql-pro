import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/pagination.args';
import { SearchArgs } from 'src/common/dto/search.args';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    private readonly listItemService: ListItemService,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listRepository.create({ ...createListInput, user });

    return await this.listRepository.save(newList);
  }

  async findAll(
    user: User,
    paginationArgs?: PaginationArgs,
    searchArgs?: SearchArgs,
  ): Promise<List[]> {
    const { limit = 10, offset = 0 } = paginationArgs;
    const { q = '' } = searchArgs;

    const queryBuilder = this.listRepository
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

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!list) {
      throw new NotFoundException(`List #${id} not found`);
    }

    return list;
  }

  async update(updateListInput: UpdateListInput, user: User): Promise<List> {
    await this.findOne(updateListInput.id, user);

    const updatedList = await this.listRepository.preload({
      ...updateListInput,
      user,
    });

    return await this.listRepository.save(updatedList);
  }

  async remove(id: string, user: User): Promise<List> {
    const list = await this.findOne(id, user);

    await this.listRepository.delete(id);

    return list;
  }

  async listCountByUser(user: User): Promise<number> {
    return await this.listRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
