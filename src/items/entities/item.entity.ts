import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  // @Column()
  // @Field(() => Int)
  // quantity: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string;

  // stores
  // user

  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index('userId_index')
  @Field(() => User)
  user: User;
}
