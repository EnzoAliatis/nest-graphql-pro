import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => ListItem)
export class ListItemResolver {
  constructor(private readonly listItemService: ListItemService) {}

  @Mutation(() => ListItem)
  createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
  ) {
    return this.listItemService.create(createListItemInput);
  }

  @Query(() => ListItem, { name: 'listItem' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<ListItem> {
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  async updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    return this.listItemService.update(updateListItemInput);
  }

  @Mutation(() => ListItem)
  removeListItem(@Args('id', { type: () => Int }) id: number) {
    return this.listItemService.remove(id);
  }
}
