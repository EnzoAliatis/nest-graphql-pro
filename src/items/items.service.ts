import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const item = this.itemRepository.create(createItemInput);

    return await this.itemRepository.save(item);
  }

  async findAll(): Promise<Item[]> {
    // TODO: filter, pagination, etc.

    const items = await this.itemRepository.find();

    return items;
  }

  async findOne(id: string): Promise<Item> {
    const todo = await this.itemRepository.findOneBy({ id });

    if (!todo) {
      throw new NotFoundException(`Item #${id} not found`);
    }

    return todo;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemRepository.preload(updateItemInput);

    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }

    return await this.itemRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    // TODO: soft delete, integridad referencial

    const item = await this.findOne(id);

    await this.itemRepository.delete(id);

    return item;
  }
}
