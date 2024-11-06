import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item, { name: 'createItem' })
  createItem(
    @Args('createItemInput') createItemInput: CreateItemInput,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.create(createItemInput, user);
  }

  @Query(() => [Item], { name: 'items' })
  findAll(@CurrentUser() user: User) {
    return this.itemsService.findAll(user);
  }

  @Query(() => Item, { name: 'item' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.findOne(id, user);
  }

  @Mutation(() => Item)
  updateItem(
    @Args('updateItemInput') updateItemInput: UpdateItemInput,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.update(updateItemInput, user);
  }

  @Mutation(() => Item)
  removeItem(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.remove(id, user);
  }
}
