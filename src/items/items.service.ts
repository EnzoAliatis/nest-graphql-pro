import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

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

  async findAll(user: User): Promise<Item[]> {
    // TODO: filter, pagination, etc.

    const items = await this.itemRepository.find({
      where: { user: { id: user.id } },
    });

    return items;
  }

  async findOne(id: string, user: User): Promise<Item> {
    const todo = await this.itemRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!todo) {
      throw new NotFoundException(`Item #${id} not found`);
    }

    return todo;
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
    return (await this.findAll(user)).length;
  }
}
