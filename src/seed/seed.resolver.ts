import { Resolver, Mutation } from '@nestjs/graphql';
import { SeedService } from './seed.service';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, {
    name: 'runSeed',
    description: 'Create a new seed',
  })
  createSeed(): Promise<boolean> {
    return this.seedService.runSeed();
  }
}
