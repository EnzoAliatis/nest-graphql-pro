import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Min, IsOptional, Max } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @Min(0)
  offset: number = 0;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(500)
  limit: number = 10;
}
