import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItemModule } from 'src/list-item/list-item.module';

@Module({
  imports: [TypeOrmModule.forFeature([List]), ListItemModule],
  providers: [ListsResolver, ListsService],
  exports: [TypeOrmModule, ListsService],
})
export class ListsModule {}
